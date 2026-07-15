-- Neon SQL Editor で1回実行してください。
-- Neon Auth は先に有効化し、このアプリのテーブルは public スキーマに作成します。

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  referral_code text NOT NULL UNIQUE,
  referred_by_user_id uuid REFERENCES app_users(id),
  paypay_id text,
  referral_blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_users_no_self_referral
    CHECK (referred_by_user_id IS NULL OR referred_by_user_id <> id)
);

CREATE INDEX IF NOT EXISTS app_users_referred_by_idx
  ON app_users(referred_by_user_id);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES app_users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,
  status text NOT NULL DEFAULT 'inactive',
  founder_campaign boolean NOT NULL DEFAULT false,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_customer_idx
  ON subscriptions(stripe_customer_id);

CREATE TABLE IF NOT EXISTS learning_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES app_users(id) ON DELETE CASCADE,
  child_name text,
  grade_id text,
  character_id text,
  total_stamps integer NOT NULL DEFAULT 0 CHECK (total_stamps >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  grade_id text NOT NULL,
  unit_id text NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  correct_answers integer NOT NULL DEFAULT 0 CHECK (correct_answers >= 0),
  earned_stamps integer NOT NULL DEFAULT 0 CHECK (earned_stamps >= 0),
  last_studied_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, grade_id, unit_id)
);

CREATE TABLE IF NOT EXISTS payout_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_month text NOT NULL UNIQUE
    CHECK (period_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  closed_at timestamptz NOT NULL DEFAULT now(),
  due_on date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES payout_batches(id),
  referrer_user_id uuid NOT NULL REFERENCES app_users(id),
  amount_yen integer NOT NULL,
  recipient_email text NOT NULL,
  paypay_id text,
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'void')),
  note text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (batch_id, referrer_user_id)
);

CREATE TABLE IF NOT EXISTS referral_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid NOT NULL REFERENCES app_users(id),
  referred_user_id uuid NOT NULL REFERENCES app_users(id),
  stripe_invoice_id text NOT NULL UNIQUE,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  stripe_event_id text NOT NULL UNIQUE,
  period_month text NOT NULL
    CHECK (period_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  amount_yen integer NOT NULL DEFAULT 100 CHECK (amount_yen > 0),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'payable', 'paid', 'reversed', 'review')),
  payout_id uuid REFERENCES referral_payouts(id),
  reversal_reason text,
  reversed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT referral_earnings_no_self_referral
    CHECK (referrer_user_id <> referred_user_id)
);

CREATE INDEX IF NOT EXISTS referral_earnings_month_referrer_idx
  ON referral_earnings(period_month, referrer_user_id);

CREATE TABLE IF NOT EXISTS stripe_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE VIEW referral_monthly_summary AS
SELECT
  e.period_month,
  e.referrer_user_id,
  u.email,
  u.paypay_id,
  count(DISTINCT e.referred_user_id)
    FILTER (WHERE e.status IN ('pending', 'payable', 'paid'))::integer AS paying_referrals,
  count(*) FILTER (WHERE e.status IN ('pending', 'payable'))::integer AS unpaid_commissions,
  coalesce(sum(e.amount_yen)
    FILTER (WHERE e.status IN ('pending', 'payable')), 0)::integer AS amount_due_yen,
  coalesce(sum(e.amount_yen)
    FILTER (WHERE e.status = 'paid'), 0)::integer AS paid_yen,
  count(*) FILTER (WHERE e.status = 'review')::integer AS needs_review
FROM referral_earnings e
JOIN app_users u ON u.id = e.referrer_user_id
GROUP BY e.period_month, e.referrer_user_id, u.email, u.paypay_id;

-- 管理画面の「送金済みにする」操作を1トランザクションで記録します。
CREATE OR REPLACE FUNCTION mark_referral_payout(
  p_period_month text,
  p_referrer_user_id uuid,
  p_note text DEFAULT NULL
) RETURNS TABLE(payout_id uuid, paid_count integer, amount_yen integer)
LANGUAGE plpgsql
AS $$
DECLARE
  v_batch_id uuid;
  v_payout_id uuid;
  v_count integer;
  v_amount integer;
  v_email text;
  v_paypay_id text;
  v_year integer;
  v_month integer;
  v_due_on date;
BEGIN
  SELECT email, paypay_id INTO v_email, v_paypay_id
  FROM app_users WHERE id = p_referrer_user_id;

  IF v_email IS NULL THEN
    RAISE EXCEPTION 'referrer not found';
  END IF;

  v_year := split_part(p_period_month, '-', 1)::integer;
  v_month := split_part(p_period_month, '-', 2)::integer;
  v_due_on := (make_date(v_year, v_month, 1) + interval '1 month' + interval '6 days')::date;

  INSERT INTO payout_batches(period_month, due_on)
  VALUES (p_period_month, v_due_on)
  ON CONFLICT (period_month) DO UPDATE SET due_on = EXCLUDED.due_on
  RETURNING id INTO v_batch_id;

  SELECT count(*)::integer, coalesce(sum(e.amount_yen), 0)::integer
  INTO v_count, v_amount
  FROM referral_earnings e
  WHERE e.period_month = p_period_month
    AND e.referrer_user_id = p_referrer_user_id
    AND e.status IN ('pending', 'payable');

  IF v_count = 0 THEN
    RETURN QUERY SELECT NULL::uuid, 0, 0;
    RETURN;
  END IF;

  INSERT INTO referral_payouts(
    batch_id, referrer_user_id, amount_yen, recipient_email, paypay_id, note
  ) VALUES (
    v_batch_id, p_referrer_user_id, v_amount, v_email, v_paypay_id, p_note
  )
  ON CONFLICT (batch_id, referrer_user_id) DO UPDATE SET
    amount_yen = referral_payouts.amount_yen + EXCLUDED.amount_yen,
    recipient_email = EXCLUDED.recipient_email,
    paypay_id = EXCLUDED.paypay_id,
    note = EXCLUDED.note,
    status = 'paid',
    paid_at = now()
  RETURNING id INTO v_payout_id;

  UPDATE referral_earnings
  SET status = 'paid', payout_id = v_payout_id
  WHERE period_month = p_period_month
    AND referrer_user_id = p_referrer_user_id
    AND status IN ('pending', 'payable');

  RETURN QUERY SELECT v_payout_id, v_count, v_amount;
END;
$$;
