import { neon } from '@neondatabase/serverless';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing'];
const REFERRAL_REWARD_YEN = 100;
const jwksCache = new Map();
let campaignCache = null;

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

class StripeError extends Error {
  constructor(status, data) {
    super(data?.error?.message || `Stripe API error (${status})`);
    this.status = status;
    this.data = data;
  }
}

function responseJson(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  });
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function getSql(env) {
  if (!env.DATABASE_URL) {
    throw new HttpError(503, 'NeonのDATABASE_URLがまだ設定されていません');
  }
  return neon(env.DATABASE_URL);
}

function getJwks(url) {
  if (!jwksCache.has(url)) {
    jwksCache.set(url, createRemoteJWKSet(new URL(url)));
  }
  return jwksCache.get(url);
}

async function requireUser(request, env) {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) {
    throw new HttpError(401, 'ログインしてください');
  }

  const token = header.slice(7).trim();
  const jwksUrl = env.NEON_AUTH_JWKS_URL
    || (env.NEON_AUTH_URL ? `${env.NEON_AUTH_URL.replace(/\/$/, '')}/.well-known/jwks.json` : '');

  if (!jwksUrl) {
    throw new HttpError(503, 'NEON_AUTH_JWKS_URLがまだ設定されていません');
  }

  try {
    const { payload } = await jwtVerify(token, getJwks(jwksUrl), {
      clockTolerance: 5,
    });
    const email = normalizeEmail(payload.email);
    if (!payload.sub || !email || (payload.role && payload.role !== 'authenticated')) {
      throw new Error('required claims are missing');
    }
    return { authUserId: String(payload.sub), email };
  } catch (error) {
    console.warn('Neon Auth JWT verification failed:', error.message);
    throw new HttpError(401, 'ログインの有効期限が切れました。もう一度ログインしてください');
  }
}

function getAdminEmails(env) {
  return new Set(String(env.ADMIN_EMAILS || '').split(',').map(normalizeEmail).filter(Boolean));
}

function requireAdmin(user, env) {
  if (!getAdminEmails(env).has(user.email)) {
    throw new HttpError(403, '管理者だけが利用できます');
  }
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, '送信内容を読み取れませんでした');
  }
}

function createReferralCode() {
  return crypto.randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase();
}

function formatJstDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function currentJstMonth(date = new Date()) {
  const parts = formatJstDateParts(date);
  return `${parts.year}-${parts.month}`;
}

function previousMonth(month) {
  const [year, number] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, number - 2, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function assertMonth(month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month || '')) {
    throw new HttpError(400, '対象月はYYYY-MM形式で指定してください');
  }
}

async function findAppUser(sql, authUserId) {
  const rows = await sql`
    SELECT u.*, s.status AS subscription_status, s.founder_campaign,
           s.stripe_customer_id, s.stripe_subscription_id,
           s.current_period_end, s.cancel_at_period_end
    FROM app_users u
    LEFT JOIN subscriptions s ON s.user_id = u.id
    WHERE u.auth_user_id = ${authUserId}
    LIMIT 1
  `;
  return rows[0] || null;
}

async function syncProfile(request, env, user) {
  const sql = getSql(env);
  const body = await readJson(request);
  const referralCode = String(body.referralCode || '').trim().toUpperCase().slice(0, 32);
  const characterId = typeof body.characterId === 'string' ? body.characterId.slice(0, 64) : null;
  const totalStamps = Number.isInteger(body.totalStamps)
    ? Math.max(0, Math.min(body.totalStamps, 1_000_000))
    : null;

  let appUser = await findAppUser(sql, user.authUserId);

  if (!appUser) {
    const referrerRows = referralCode
      ? await sql`
          SELECT id FROM app_users
          WHERE referral_code = ${referralCode} AND referral_blocked = false
          LIMIT 1
        `
      : [];
    const referrerId = referrerRows[0]?.id || null;

    for (let attempt = 0; attempt < 4 && !appUser; attempt += 1) {
      try {
        const code = createReferralCode();
        await sql`
          INSERT INTO app_users(auth_user_id, email, referral_code, referred_by_user_id)
          VALUES (${user.authUserId}, ${user.email}, ${code}, ${referrerId})
          ON CONFLICT (auth_user_id) DO UPDATE SET
            email = EXCLUDED.email,
            updated_at = now()
        `;
        appUser = await findAppUser(sql, user.authUserId);
      } catch (error) {
        if (attempt === 3) throw error;
      }
    }
  } else if (appUser.email !== user.email) {
    await sql`
      UPDATE app_users SET email = ${user.email}, updated_at = now()
      WHERE id = ${appUser.id}
    `;
  }

  if (characterId !== null || totalStamps !== null) {
    await sql`
      INSERT INTO learning_profiles(user_id, character_id, total_stamps)
      VALUES (${appUser.id}, ${characterId}, ${totalStamps ?? 0})
      ON CONFLICT (user_id) DO UPDATE SET
        character_id = coalesce(EXCLUDED.character_id, learning_profiles.character_id),
        total_stamps = greatest(learning_profiles.total_stamps, EXCLUDED.total_stamps),
        updated_at = now()
    `;
  }

  return loadAccount(sql, user, env);
}

async function loadAccount(sql, user, env) {
  const appUser = await findAppUser(sql, user.authUserId);
  if (!appUser) {
    throw new HttpError(404, '会員情報がまだ作成されていません');
  }

  const month = currentJstMonth();
  const [profileRows, referralRows] = await Promise.all([
    sql`
      SELECT character_id, total_stamps, grade_id
      FROM learning_profiles WHERE user_id = ${appUser.id} LIMIT 1
    `,
    sql`
      SELECT
        (SELECT count(*)::integer
         FROM app_users child
         JOIN subscriptions sub ON sub.user_id = child.id
         WHERE child.referred_by_user_id = ${appUser.id}
           AND sub.status IN ('active', 'trialing')) AS active_referrals,
        (SELECT count(*)::integer
         FROM referral_earnings e
         WHERE e.referrer_user_id = ${appUser.id}
           AND e.period_month = ${month}
           AND e.status IN ('pending', 'payable', 'paid')) AS month_commissions,
        (SELECT coalesce(sum(e.amount_yen), 0)::integer
         FROM referral_earnings e
         WHERE e.referrer_user_id = ${appUser.id}
           AND e.period_month = ${month}
           AND e.status IN ('pending', 'payable', 'paid')) AS month_amount_yen,
        (SELECT coalesce(sum(e.amount_yen), 0)::integer
         FROM referral_earnings e
         WHERE e.referrer_user_id = ${appUser.id}
           AND e.status IN ('pending', 'payable')) AS unpaid_amount_yen
    `,
  ]);

  const subscriptionStatus = appUser.subscription_status || 'inactive';
  return {
    user: {
      id: appUser.id,
      email: appUser.email,
      referralCode: appUser.referral_code,
      paypayId: appUser.paypay_id,
    },
    subscription: {
      status: subscriptionStatus,
      isPremium: ACTIVE_SUBSCRIPTION_STATUSES.includes(subscriptionStatus),
      founderCampaign: Boolean(appUser.founder_campaign),
      currentPeriodEnd: appUser.current_period_end,
      cancelAtPeriodEnd: Boolean(appUser.cancel_at_period_end),
      hasCustomer: Boolean(appUser.stripe_customer_id),
    },
    learning: profileRows[0] || null,
    referrals: {
      activeReferrals: referralRows[0]?.active_referrals || 0,
      monthCommissions: referralRows[0]?.month_commissions || 0,
      monthAmountYen: referralRows[0]?.month_amount_yen || 0,
      unpaidAmountYen: referralRows[0]?.unpaid_amount_yen || 0,
      rewardPerPaymentYen: REFERRAL_REWARD_YEN,
      periodMonth: month,
    },
    isAdmin: getAdminEmails(env).has(user.email),
  };
}

async function updatePayPayId(request, env, user) {
  const sql = getSql(env);
  const body = await readJson(request);
  const value = String(body.paypayId || '').trim().slice(0, 64) || null;
  const rows = await sql`
    UPDATE app_users SET paypay_id = ${value}, updated_at = now()
    WHERE auth_user_id = ${user.authUserId}
    RETURNING paypay_id
  `;
  if (!rows[0]) throw new HttpError(404, '会員情報が見つかりません');
  return { paypayId: rows[0].paypay_id };
}

async function stripeRequest(env, path, { method = 'GET', params, idempotencyKey } = {}) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new HttpError(503, 'Stripeのシークレットキーがまだ設定されていません');
  }
  const headers = { authorization: `Bearer ${env.STRIPE_SECRET_KEY}` };
  if (params) headers['content-type'] = 'application/x-www-form-urlencoded';
  if (idempotencyKey) headers['idempotency-key'] = idempotencyKey;
  const response = await fetch(`https://api.stripe.com${path}`, {
    method,
    headers,
    body: params ? params.toString() : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new StripeError(response.status, data);
  return data;
}

async function getCampaignAvailability(env) {
  if (campaignCache && campaignCache.expiresAt > Date.now()) return campaignCache.value;
  if (!env.STRIPE_FOUNDERS_COUPON_ID || !env.STRIPE_SECRET_KEY) {
    return { available: false, remaining: null };
  }
  try {
    const coupon = await stripeRequest(
      env,
      `/v1/coupons/${encodeURIComponent(env.STRIPE_FOUNDERS_COUPON_ID)}`,
    );
    const max = coupon.max_redemptions ?? 100;
    const used = coupon.times_redeemed ?? 0;
    const value = { available: Boolean(coupon.valid) && used < max, remaining: Math.max(0, max - used) };
    campaignCache = { value, expiresAt: Date.now() + 30_000 };
    return value;
  } catch (error) {
    console.warn('Could not read founder coupon:', error.message);
    return { available: false, remaining: null };
  }
}

async function createCheckout(request, env, user) {
  if (!env.STRIPE_PRICE_ID_MONTHLY_480) {
    throw new HttpError(503, 'Stripeの月額480円Price IDがまだ設定されていません');
  }
  const sql = getSql(env);
  const appUser = await findAppUser(sql, user.authUserId);
  if (!appUser) throw new HttpError(409, '先に会員情報を作成してください');
  if (ACTIVE_SUBSCRIPTION_STATUSES.includes(appUser.subscription_status)) {
    throw new HttpError(409, 'すでにプレミアム会員です');
  }

  const campaign = await getCampaignAvailability(env);
  const shouldOfferCampaign = campaign.available && !appUser.founder_campaign;
  const appUrl = String(env.APP_URL || new URL(request.url).origin).replace(/\/$/, '');
  // 同じ会員の連打・複数タブによる二重Checkoutを30分単位で同じ処理にします。
  const requestedKey = `${appUser.id}:checkout:${Math.floor(Date.now() / 1_800_000)}`;

  const buildParams = (withCampaign) => {
    const params = new URLSearchParams();
    params.set('mode', 'subscription');
    params.set('success_url', `${appUrl}/?checkout=success`);
    params.set('cancel_url', `${appUrl}/?checkout=cancelled`);
    params.set('line_items[0][price]', env.STRIPE_PRICE_ID_MONTHLY_480);
    params.set('line_items[0][quantity]', '1');
    params.set('client_reference_id', appUser.id);
    params.set('metadata[user_id]', appUser.id);
    params.set('metadata[founder_campaign]', withCampaign ? 'true' : 'false');
    params.set('subscription_data[metadata][user_id]', appUser.id);
    params.set('subscription_data[metadata][founder_campaign]', withCampaign ? 'true' : 'false');
    params.set('locale', 'ja');
    if (appUser.stripe_customer_id) {
      params.set('customer', appUser.stripe_customer_id);
    } else {
      params.set('customer_email', appUser.email);
    }
    if (withCampaign) {
      params.set('discounts[0][coupon]', env.STRIPE_FOUNDERS_COUPON_ID);
    }
    return params;
  };

  let session;
  try {
    session = await stripeRequest(env, '/v1/checkout/sessions', {
      method: 'POST',
      params: buildParams(shouldOfferCampaign),
      idempotencyKey: `${requestedKey}:${shouldOfferCampaign ? 'founder' : 'standard'}`,
    });
  } catch (error) {
    const couponUnavailable = error instanceof StripeError && (
      error.data?.error?.code === 'coupon_expired'
      || /maximum.*redemption|no longer valid|not valid/i.test(error.message)
    );
    if (!shouldOfferCampaign || !couponUnavailable) throw error;
    console.warn('Founder coupon became unavailable; retrying standard price:', error.message);
    session = await stripeRequest(env, '/v1/checkout/sessions', {
      method: 'POST',
      params: buildParams(false),
      idempotencyKey: `${requestedKey}:standard`,
    });
  }

  return { url: session.url };
}

async function createPortal(request, env, user) {
  const sql = getSql(env);
  const appUser = await findAppUser(sql, user.authUserId);
  if (!appUser?.stripe_customer_id) {
    throw new HttpError(409, 'Stripeの会員情報がまだありません');
  }
  const appUrl = String(env.APP_URL || new URL(request.url).origin).replace(/\/$/, '');
  const params = new URLSearchParams({
    customer: appUser.stripe_customer_id,
    return_url: `${appUrl}/?account=1`,
  });
  const session = await stripeRequest(env, '/v1/billing_portal/sessions', {
    method: 'POST', params,
  });
  return { url: session.url };
}

function hexFromBuffer(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(left, right) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

async function verifyStripeSignature(payload, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  const fields = signatureHeader.split(',').map((part) => part.split('='));
  const timestamp = fields.find(([key]) => key === 't')?.[1];
  const signatures = fields.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!timestamp || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${payload}`));
  const expected = hexFromBuffer(digest);
  return signatures.some((signature) => timingSafeEqual(signature, expected));
}

function subscriptionPeriodEnd(subscription) {
  return subscription.current_period_end
    || subscription.items?.data?.[0]?.current_period_end
    || null;
}

async function upsertSubscription(sql, subscription) {
  const userId = subscription.metadata?.user_id || null;
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer : subscription.customer?.id;
  let rows = [];
  if (userId) {
    rows = await sql`SELECT id FROM app_users WHERE id = ${userId} LIMIT 1`;
  }
  if (!rows[0] && customerId) {
    rows = await sql`
      SELECT u.id FROM app_users u
      JOIN subscriptions s ON s.user_id = u.id
      WHERE s.stripe_customer_id = ${customerId} LIMIT 1
    `;
  }
  if (!rows[0]) return;

  const periodEnd = subscriptionPeriodEnd(subscription);
  const priceId = subscription.items?.data?.[0]?.price?.id || null;
  const founder = subscription.metadata?.founder_campaign === 'true';
  await sql`
    INSERT INTO subscriptions(
      user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id,
      status, founder_campaign, current_period_end, cancel_at_period_end
    ) VALUES (
      ${rows[0].id}, ${customerId}, ${subscription.id}, ${priceId},
      ${subscription.status || 'inactive'}, ${founder},
      ${periodEnd ? new Date(periodEnd * 1000).toISOString() : null},
      ${Boolean(subscription.cancel_at_period_end)}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      stripe_price_id = EXCLUDED.stripe_price_id,
      status = EXCLUDED.status,
      founder_campaign = EXCLUDED.founder_campaign,
      current_period_end = EXCLUDED.current_period_end,
      cancel_at_period_end = EXCLUDED.cancel_at_period_end,
      updated_at = now()
  `;
}

async function handleCheckoutCompleted(sql, session) {
  const userId = session.metadata?.user_id || session.client_reference_id;
  if (!userId) return;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription : session.subscription?.id;
  await sql`
    INSERT INTO subscriptions(
      user_id, stripe_customer_id, stripe_subscription_id, status, founder_campaign
    ) VALUES (
      ${userId}, ${customerId}, ${subscriptionId}, 'active',
      ${session.metadata?.founder_campaign === 'true'}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      status = EXCLUDED.status,
      founder_campaign = EXCLUDED.founder_campaign,
      updated_at = now()
  `;
}

function invoiceUserId(invoice) {
  return invoice.parent?.subscription_details?.metadata?.user_id
    || invoice.subscription_details?.metadata?.user_id
    || invoice.lines?.data?.find((line) => line.metadata?.user_id)?.metadata?.user_id
    || null;
}

async function recordReferralEarning(sql, event, invoice) {
  if (!invoice.id || Number(invoice.amount_paid || 0) <= 0) return;
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  const metadataUserId = invoiceUserId(invoice);
  let referredRows = [];
  if (metadataUserId) {
    referredRows = await sql`SELECT * FROM app_users WHERE id = ${metadataUserId} LIMIT 1`;
  }
  if (!referredRows[0] && customerId) {
    referredRows = await sql`
      SELECT u.* FROM app_users u
      JOIN subscriptions s ON s.user_id = u.id
      WHERE s.stripe_customer_id = ${customerId} LIMIT 1
    `;
  }
  if (!referredRows[0] && invoice.customer_email) {
    referredRows = await sql`
      SELECT * FROM app_users
      WHERE email = ${normalizeEmail(invoice.customer_email)}
      LIMIT 1
    `;
  }
  const referred = referredRows[0];
  if (!referred?.referred_by_user_id) return;

  const paidAtSeconds = invoice.status_transitions?.paid_at || invoice.created;
  const periodMonth = currentJstMonth(new Date(paidAtSeconds * 1000));
  const paymentIntentId = typeof invoice.payment_intent === 'string'
    ? invoice.payment_intent
    : invoice.payment_intent?.id
      || invoice.payments?.data?.find((payment) => payment.status === 'paid')?.payment?.payment_intent
      || null;
  const chargeId = typeof invoice.charge === 'string'
    ? invoice.charge
    : invoice.charge?.id
      || invoice.payments?.data?.find((payment) => payment.status === 'paid')?.payment?.charge
      || null;

  await sql`
    INSERT INTO referral_earnings(
      referrer_user_id, referred_user_id, stripe_invoice_id,
      stripe_payment_intent_id, stripe_charge_id, stripe_event_id,
      period_month, amount_yen
    )
    SELECT referrer.id, referred.id, ${invoice.id},
           ${paymentIntentId}, ${chargeId}, ${event.id},
           ${periodMonth}, ${REFERRAL_REWARD_YEN}
    FROM app_users referred
    JOIN app_users referrer ON referrer.id = referred.referred_by_user_id
    WHERE referred.id = ${referred.id}
      AND referrer.referral_blocked = false
      AND referred.id <> referrer.id
    ON CONFLICT DO NOTHING
  `;
}

async function reverseReferralEarning(sql, eventType, object) {
  const invoiceId = typeof object.invoice === 'string' ? object.invoice : object.invoice?.id;
  const chargeId = eventType === 'charge.dispute.created'
    ? (typeof object.charge === 'string' ? object.charge : object.charge?.id)
    : object.id;
  const paymentIntentId = typeof object.payment_intent === 'string'
    ? object.payment_intent : object.payment_intent?.id;
  if (!invoiceId && !chargeId && !paymentIntentId) return;
  await sql`
    UPDATE referral_earnings SET
      status = CASE WHEN status = 'paid' THEN 'review' ELSE 'reversed' END,
      reversal_reason = ${eventType},
      reversed_at = now()
    WHERE (${invoiceId}::text IS NOT NULL AND stripe_invoice_id = ${invoiceId})
       OR (${chargeId}::text IS NOT NULL AND stripe_charge_id = ${chargeId})
       OR (${paymentIntentId}::text IS NOT NULL AND stripe_payment_intent_id = ${paymentIntentId})
  `;
}

async function processStripeEvent(env, event) {
  const sql = getSql(env);
  const existing = await sql`SELECT event_id FROM stripe_events WHERE event_id = ${event.id}`;
  if (existing[0]) return;

  const object = event.data?.object || {};
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(sql, object);
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await upsertSubscription(sql, object);
      break;
    case 'invoice.paid':
      await recordReferralEarning(sql, event, object);
      break;
    case 'credit_note.created':
    case 'charge.refunded':
    case 'charge.dispute.created':
      await reverseReferralEarning(sql, event.type, object);
      break;
    default:
      break;
  }

  await sql`
    INSERT INTO stripe_events(event_id, event_type)
    VALUES (${event.id}, ${event.type})
    ON CONFLICT DO NOTHING
  `;
}

async function handleStripeWebhook(request, env) {
  const payload = await request.text();
  const valid = await verifyStripeSignature(
    payload,
    request.headers.get('stripe-signature'),
    env.STRIPE_WEBHOOK_SECRET,
  );
  if (!valid) throw new HttpError(400, 'Stripe署名を確認できませんでした');
  let event;
  try {
    event = JSON.parse(payload);
  } catch {
    throw new HttpError(400, 'Stripeイベントを読み取れませんでした');
  }
  await processStripeEvent(env, event);
  return { received: true };
}

async function ensureBatchClosed(env, month) {
  const sql = getSql(env);
  await sql`
    INSERT INTO payout_batches(period_month, due_on)
    VALUES (
      ${month},
      (to_date(${month} || '-01', 'YYYY-MM-DD') + interval '1 month' + interval '6 days')::date
    )
    ON CONFLICT (period_month) DO NOTHING
  `;
  await sql`
    UPDATE referral_earnings SET status = 'payable'
    WHERE period_month = ${month} AND status = 'pending'
  `;
}

async function closePreviousMonthIfNeeded(env, force = false) {
  const parts = formatJstDateParts();
  if (!force && parts.day !== '01') return;
  await ensureBatchClosed(env, previousMonth(`${parts.year}-${parts.month}`));
}

async function listAdminPayouts(env, user, month) {
  requireAdmin(user, env);
  assertMonth(month);
  const current = currentJstMonth();
  if (month < current) await ensureBatchClosed(env, month);
  const sql = getSql(env);
  const [summary, batchRows] = await Promise.all([
    sql`
      SELECT * FROM referral_monthly_summary
      WHERE period_month = ${month}
      ORDER BY amount_due_yen DESC, email ASC
    `,
    sql`SELECT * FROM payout_batches WHERE period_month = ${month} LIMIT 1`,
  ]);
  return { month, batch: batchRows[0] || null, rows: summary };
}

async function markAdminPayout(request, env, user) {
  requireAdmin(user, env);
  const body = await readJson(request);
  assertMonth(body.month);
  if (!/^[0-9a-f-]{36}$/i.test(body.referrerUserId || '')) {
    throw new HttpError(400, '紹介者IDが不正です');
  }
  const sql = getSql(env);
  const rows = await sql`
    SELECT * FROM mark_referral_payout(
      ${body.month}, ${body.referrerUserId}::uuid, ${String(body.note || '').slice(0, 500) || null}
    )
  `;
  return rows[0] || { payout_id: null, paid_count: 0, amount_yen: 0 };
}

const HINT_SYSTEM_PROMPT = `あなたは小学生向けのやさしい学習サポート先生です。

【絶対に守るルール】
- 答えを直接教えてはいけません
- 最終答え、計算結果、正解の選択肢は絶対に出さないでください
- 1回につき1つだけヒントを出してください

【話し方】
- 6歳でもわかるやさしい言葉を使う
- ひらがなを多く使う
- まず子供の努力をほめてからヒントを出す
- 短く、わかりやすく`;

async function handleHint(request, env, user) {
  if (!env.ANTHROPIC_API_KEY) throw new HttpError(503, 'AIヒントはまだ設定されていません');
  const sql = getSql(env);
  const appUser = await findAppUser(sql, user.authUserId);
  const premium = ACTIVE_SUBSCRIPTION_STATUSES.includes(appUser?.subscription_status)
    || getAdminEmails(env).has(user.email);
  if (!premium) throw new HttpError(402, 'AIヒントはプレミアム会員向けです');

  const { subject, question, thinking, hintLevel = 0, photo } = await readJson(request);
  const content = [];
  if (photo && typeof photo === 'string' && photo.includes(',')) {
    const [meta, data] = photo.split(',', 2);
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: meta.match(/^data:([^;]+)/)?.[1] || 'image/jpeg',
        data,
      },
    });
  }
  const level = Math.max(0, Math.min(Number(hintLevel) || 0, 2));
  content.push({
    type: 'text',
    text: [
      subject ? `きょうか: ${String(subject).slice(0, 30)}` : '',
      question ? `もんだい: ${String(question).slice(0, 3000)}` : 'もんだい: しゃしんをみてください',
      thinking ? `ここまでかんがえたこと: ${String(thinking).slice(0, 1000)}` : '',
      `これは${level + 1}かいめのヒントです。こたえを言わず、ヒントを1つだけ出してください。`,
    ].filter(Boolean).join('\n'),
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: HINT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new HttpError(502, 'AIヒントの生成に失敗しました');
  return { hint: data.content?.find((item) => item.type === 'text')?.text || 'もういちどためしてみてね！' };
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (path === '/api/health' && request.method === 'GET') {
    return responseJson({ ok: true, service: 'child-study-auxiliary' });
  }
  if (path === '/api/config' && request.method === 'GET') {
    // フロントのビルド時にVITE_NEON_AUTH_URLが無くても、Workerの実行時変数から
    // 認証URLを配布できるようにする（公開情報のみを返すこと）。
    return responseJson(
      { neonAuthUrl: env.VITE_NEON_AUTH_URL || env.NEON_AUTH_URL || '' },
      200,
      { 'cache-control': 'public, max-age=300' },
    );
  }
  if (path === '/api/pricing' && request.method === 'GET') {
    const campaign = await getCampaignAvailability(env);
    return responseJson({
      standardPriceYen: 480,
      campaignPriceYen: 300,
      campaignLimit: 100,
      campaignRemaining: campaign.remaining,
      campaignAvailable: campaign.available,
      referralRewardYen: REFERRAL_REWARD_YEN,
    });
  }
  if (path === '/api/stripe/webhook' && request.method === 'POST') {
    return responseJson(await handleStripeWebhook(request, env));
  }

  const user = await requireUser(request, env);

  if (path === '/api/profile/sync' && request.method === 'POST') {
    return responseJson(await syncProfile(request, env, user));
  }
  if (path === '/api/account' && request.method === 'GET') {
    return responseJson(await loadAccount(getSql(env), user, env));
  }
  if (path === '/api/referrals/paypay' && request.method === 'POST') {
    return responseJson(await updatePayPayId(request, env, user));
  }
  if (path === '/api/billing/checkout' && request.method === 'POST') {
    return responseJson(await createCheckout(request, env, user));
  }
  if (path === '/api/billing/portal' && request.method === 'POST') {
    return responseJson(await createPortal(request, env, user));
  }
  if (path === '/api/admin/payouts' && request.method === 'GET') {
    const month = url.searchParams.get('month') || previousMonth(currentJstMonth());
    return responseJson(await listAdminPayouts(env, user, month));
  }
  if (path === '/api/admin/payouts/mark-paid' && request.method === 'POST') {
    return responseJson(await markAdminPayout(request, env, user));
  }
  if (path === '/api/hint' && request.method === 'POST') {
    return responseJson(await handleHint(request, env, user));
  }

  throw new HttpError(404, 'APIが見つかりません');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }
    try {
      return await handleApi(request, env);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpError) {
        return responseJson({ error: error.message, details: error.details }, error.status);
      }
      if (error instanceof StripeError) {
        return responseJson({ error: 'Stripe処理に失敗しました', details: error.message }, 502);
      }
      return responseJson({ error: 'サーバー処理に失敗しました' }, 500);
    }
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(closePreviousMonthIfNeeded(env));
  },
};
