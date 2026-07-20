import { useEffect, useMemo, useState } from 'react';
import { useAccount } from '../context/AccountContext';

const panelStyle = {
  background: 'rgba(255,255,255,0.92)',
  borderRadius: '18px',
  padding: '20px',
  boxShadow: '0 4px 16px rgba(84,70,50,0.1)',
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '2px solid #E0E0E0',
  borderRadius: '12px',
  fontSize: '1rem',
  fontFamily: 'inherit',
};

const primaryButtonStyle = {
  width: '100%',
  padding: '13px 18px',
  border: 'none',
  borderRadius: '13px',
  background: '#FF7043',
  color: 'white',
  fontSize: '1rem',
  fontWeight: 800,
  fontFamily: 'inherit',
  cursor: 'pointer',
};

async function copyText(value) {
  if (navigator.clipboard) return navigator.clipboard.writeText(value);
  const area = document.createElement('textarea');
  area.value = value;
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

function AuthForm() {
  const { signIn, signUp, verifyEmail } = useAccount();
  const [mode, setMode] = useState('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'signup') {
        const result = await signUp({ name: name || '保護者', email, password });
        if (result.needsVerification) {
          setVerificationEmail(email);
          setMessage('確認コードをメールで送りました。届いたコードを入力してください。');
        }
      } else {
        await signIn({ email, password });
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const submitVerification = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const nextSession = await verifyEmail({
        email: verificationEmail,
        otp: verificationCode.trim(),
      });
      if (!nextSession) {
        await signIn({ email: verificationEmail, password });
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  if (verificationEmail) {
    return (
      <div style={panelStyle}>
        <h2 style={{ color: '#5D4037', marginBottom: '6px' }}>確認コードを入力</h2>
        <p style={{ color: '#8D6E63', fontSize: '0.88rem', marginBottom: '16px', overflowWrap: 'anywhere' }}>
          {verificationEmail} に届いた確認コードを入力してください。
        </p>
        <form onSubmit={submitVerification} style={{ display: 'grid', gap: '11px' }}>
          <input
            style={{ ...inputStyle, textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.2em' }}
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value.replace(/\s/g, ''))}
            placeholder="確認コード"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />
          <button type="submit" style={primaryButtonStyle} disabled={busy}>
            {busy ? '確認中…' : 'メールアドレスを確認する'}
          </button>
        </form>
        {message && <p style={{ marginTop: '12px', color: message.includes('送りました') ? '#2E7D32' : '#D84315', fontWeight: 700 }}>{message}</p>}
        <button
          type="button"
          onClick={() => { setVerificationEmail(''); setVerificationCode(''); setMessage(''); }}
          style={{ marginTop: '14px', border: 'none', background: 'none', color: '#1E88E5', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}
        >
          メールアドレスを入力し直す
        </button>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <h2 style={{ color: '#5D4037', marginBottom: '6px' }}>
        {mode === 'signup' ? '保護者アカウントを作る' : 'ログイン'}
      </h2>
      <p style={{ color: '#8D6E63', fontSize: '0.88rem', marginBottom: '16px' }}>
        学習記録・お支払い・紹介実績を同じメールアドレスで管理します。
      </p>
      <form onSubmit={submit} style={{ display: 'grid', gap: '11px' }}>
        {mode === 'signup' && (
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="お名前（保護者）" autoComplete="name" />
        )}
        <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="メールアドレス" autoComplete="email" required />
        <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード（8文字以上）" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required />
        <button type="submit" style={primaryButtonStyle} disabled={busy}>
          {busy ? '処理中…' : mode === 'signup' ? '無料で登録する' : 'ログインする'}
        </button>
      </form>
      {message && <p style={{ marginTop: '12px', color: '#D84315', fontWeight: 700 }}>{message}</p>}
      <button
        type="button"
        onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMessage(''); }}
        style={{ marginTop: '14px', border: 'none', background: 'none', color: '#1E88E5', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}
      >
        {mode === 'signup' ? '登録済みの方はこちら' : 'はじめての方はこちら'}
      </button>
    </div>
  );
}

function PricingCard({ pricing, account, onCheckout, onPortal, busy }) {
  const premium = account?.subscription?.isPremium;
  const founder = account?.subscription?.founderCampaign;
  const campaignAvailable = pricing?.campaignAvailable && (!founder || premium);
  const displayPrice = founder && premium ? 300 : campaignAvailable ? 300 : 480;

  return (
    <div style={{ ...panelStyle, border: '3px solid #FFB74D' }}>
      <p style={{ color: '#F57C00', fontWeight: 800 }}>
        {campaignAvailable ? '🎉 先着100名キャンペーン' : 'プレミアムプラン'}
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', margin: '6px 0' }}>
        <strong style={{ fontSize: '2.2rem', color: '#FF7043' }}>月額 {displayPrice}円</strong>
        <span style={{ color: '#8D6E63' }}>（税込）</span>
      </div>
      {campaignAvailable && (
        <p style={{ fontSize: '0.87rem', color: '#5D4037', marginBottom: '10px' }}>
          通常480円。キャンペーンで登録した方は、継続中ずっと月額300円です。
          {Number.isInteger(pricing?.campaignRemaining) && ` 残り${pricing.campaignRemaining}名。`}
        </p>
      )}
      <ul style={{ paddingLeft: '20px', lineHeight: 1.8, fontSize: '0.9rem', color: '#5D4037' }}>
        <li>小学2〜6年生の算数ドリル</li>
        <li>こくご・りか・しゃかいのドリル</li>
        <li>写真・自由入力のAIヒント</li>
        <li>学習スタンプとキャラクターを保存</li>
      </ul>
      {premium ? (
        <>
          <p style={{ margin: '12px 0', color: '#2E7D32', fontWeight: 800 }}>✓ プレミアム利用中</p>
          <button type="button" style={{ ...primaryButtonStyle, background: '#546E7A' }} onClick={onPortal} disabled={busy}>
            お支払い・解約を管理
          </button>
        </>
      ) : (
        <button type="button" style={{ ...primaryButtonStyle, marginTop: '14px' }} onClick={onCheckout} disabled={busy}>
          {busy ? 'Stripeへ移動中…' : `${displayPrice}円で申し込む`}
        </button>
      )}
    </div>
  );
}

function ReferralPanel({ account, apiFetch, refreshAccount }) {
  const referralUrl = `${window.location.origin}/?ref=${account.user.referralCode}`;
  const [copied, setCopied] = useState(false);
  const [paypayId, setPaypayId] = useState(account.user.paypayId || '');
  const [message, setMessage] = useState('');

  const savePayPayId = async () => {
    try {
      await apiFetch('/api/referrals/paypay', {
        method: 'POST', body: JSON.stringify({ paypayId }),
      });
      await refreshAccount();
      setMessage('保存しました');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div style={panelStyle}>
      <h2 style={{ color: '#5D4037', marginBottom: '8px' }}>🤝 お友だち紹介</h2>
      <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: '#6D4C41' }}>
        このリンクから登録した方の月額決済が完了するたび、1人につき毎月100円です。
        月末締め、翌月7日までに登録メール宛へPayPay受取リンクをお送りします。
      </p>
      <div style={{ display: 'flex', gap: '8px', margin: '13px 0' }}>
        <input style={{ ...inputStyle, minWidth: 0 }} readOnly value={referralUrl} aria-label="紹介リンク" />
        <button
          type="button"
          onClick={async () => { await copyText(referralUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
          style={{ ...primaryButtonStyle, width: 'auto', whiteSpace: 'nowrap', paddingInline: '16px' }}
        >
          {copied ? 'コピー済み' : 'コピー'}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {[
          ['継続中の紹介', `${account.referrals.activeReferrals}人`],
          ['今月の件数', `${account.referrals.monthCommissions}件`],
          ['今月の報酬', `${account.referrals.monthAmountYen}円`],
        ].map(([label, value]) => (
          <div key={label} style={{ background: '#FFF8E1', borderRadius: '12px', padding: '11px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#8D6E63' }}>{label}</div>
            <strong style={{ color: '#E65100', fontSize: '1.15rem' }}>{value}</strong>
          </div>
        ))}
      </div>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#5D4037', marginBottom: '5px' }}>
        PayPay ID（任意・管理用）
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input style={{ ...inputStyle, minWidth: 0 }} value={paypayId} onChange={(e) => setPaypayId(e.target.value)} placeholder="未入力でもメールで受取リンクを送れます" />
        <button type="button" onClick={savePayPayId} style={{ ...primaryButtonStyle, width: 'auto', paddingInline: '16px' }}>保存</button>
      </div>
      {message && <p style={{ marginTop: '7px', fontSize: '0.82rem', color: '#2E7D32' }}>{message}</p>}
      <p style={{ marginTop: '12px', fontSize: '0.76rem', color: '#8D6E63', lineHeight: 1.55 }}>
        自己紹介、重複・不正登録、返金・チャージバックは対象外です。報酬は1段階のみで、紹介先がさらに紹介した分は含みません。
      </p>
    </div>
  );
}

export default function AccountPage({ onBack, onGoAdmin }) {
  const {
    configured, user, account, loading, error, signOut, apiFetch, refreshAccount,
  } = useAccount();
  const [pricing, setPricing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/pricing').then((response) => response.json()).then(setPricing).catch(() => {});
  }, []);

  const checkoutMessage = useMemo(() => {
    const status = new URLSearchParams(window.location.search).get('checkout');
    if (status === 'success') return 'お申し込みありがとうございます。反映まで数秒かかることがあります。';
    if (status === 'cancelled') return 'お申し込みはキャンセルされました。料金は発生していません。';
    return '';
  }, []);

  const redirectFromApi = async (path) => {
    setBusy(true);
    setMessage('');
    try {
      const data = await apiFetch(path, {
        method: 'POST',
        body: '{}',
        headers: { 'x-idempotency-key': crypto.randomUUID() },
      });
      window.location.href = data.url;
    } catch (error) {
      setMessage(error.message);
      setBusy(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px 16px', textAlign: 'center', fontWeight: 700 }}>会員情報を確認中…</div>;
  }

  return (
    <main style={{ padding: '20px 14px 48px', maxWidth: '620px', margin: '0 auto', display: 'grid', gap: '16px' }}>
      <button onClick={onBack} style={{ border: 'none', background: 'none', color: '#1E88E5', fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', justifySelf: 'start' }}>
        ← ホームにもどる
      </button>
      {!configured && (
        <div style={panelStyle}>
          <h2>会員機能はセットアップ待ちです</h2>
          <p style={{ marginTop: '8px', color: '#6D4C41', lineHeight: 1.7 }}>
            Cloudflareダッシュボードで、このWorkerの「設定 → 変数とシークレット」に
            <code style={{ background: '#FFF3E0', padding: '2px 6px', borderRadius: '6px' }}>NEON_AUTH_URL</code>
            を追加すると、再ビルドなしでログインとStripe申込が表示されます。
          </p>
          <button
            type="button"
            style={{ ...primaryButtonStyle, marginTop: '14px' }}
            onClick={() => window.location.reload()}
          >
            設定したので再読み込みする
          </button>
        </div>
      )}
      {configured && !user && (
        <>
          <div style={{ ...panelStyle, border: '3px solid #FFB74D', textAlign: 'center' }}>
            <p style={{ color: '#F57C00', fontWeight: 800 }}>
              {pricing?.campaignAvailable ? '🎉 先着100名は継続中ずっと' : 'プレミアムプラン'}
            </p>
            <strong style={{ display: 'block', color: '#FF7043', fontSize: '2rem', margin: '5px 0' }}>
              {pricing ? `月額 ${pricing.campaignAvailable ? 300 : 480}円` : '料金を確認中…'}
            </strong>
            <p style={{ color: '#6D4C41', fontSize: '0.87rem' }}>
              通常480円。1年生算数は無料で試せます。まずメールアドレスで登録してください。
            </p>
          </div>
          <AuthForm />
        </>
      )}
      {configured && user && !account && (
        <div style={panelStyle}>
          <h2 style={{ color: '#5D4037', marginBottom: '8px' }}>会員情報を読み込めませんでした</h2>
          <p style={{ color: '#D84315', marginBottom: '14px', overflowWrap: 'anywhere' }}>
            {error || '通信が一時的に失敗しました。もう一度お試しください。'}
          </p>
          <div style={{ display: 'grid', gap: '9px' }}>
            <button type="button" style={primaryButtonStyle} onClick={() => refreshAccount().catch(() => {})}>
              もう一度読み込む
            </button>
            <button type="button" onClick={signOut} style={{ border: 'none', background: 'none', color: '#1E88E5', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
              ログアウトしてやり直す
            </button>
          </div>
        </div>
      )}
      {configured && user && account && (
        <>
          <div style={{ ...panelStyle, padding: '14px 18px' }}>
            <p style={{ fontSize: '0.78rem', color: '#8D6E63' }}>ログイン中</p>
            <strong style={{ overflowWrap: 'anywhere' }}>{account.user.email}</strong>
            <button type="button" onClick={signOut} style={{ float: 'right', border: 'none', background: 'none', color: '#78909C', cursor: 'pointer', fontFamily: 'inherit' }}>ログアウト</button>
          </div>
          {(checkoutMessage || message) && (
            <p style={{ ...panelStyle, color: message ? '#D84315' : '#2E7D32', fontWeight: 700 }}>{message || checkoutMessage}</p>
          )}
          <PricingCard
            pricing={pricing}
            account={account}
            busy={busy}
            onCheckout={() => redirectFromApi('/api/billing/checkout')}
            onPortal={() => redirectFromApi('/api/billing/portal')}
          />
          <ReferralPanel account={account} apiFetch={apiFetch} refreshAccount={refreshAccount} />
          {account.isAdmin && (
            <button
              type="button"
              onClick={onGoAdmin}
              style={{ border: 'none', background: 'none', color: '#1E88E5', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, justifySelf: 'start' }}
            >
              🔐 管理者ページへ
            </button>
          )}
        </>
      )}
    </main>
  );
}
