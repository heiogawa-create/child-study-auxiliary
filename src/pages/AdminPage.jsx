import { useEffect, useState } from 'react';
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

function getPreviousJstMonth() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const date = new Date(Date.UTC(Number(values.year), Number(values.month) - 2, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

async function copyText(value) {
  if (navigator.clipboard) return navigator.clipboard.writeText(value);
  const area = document.createElement('textarea');
  area.value = value;
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

function AdminPayoutPanel({ apiFetch }) {
  const [month, setMonth] = useState(getPreviousJstMonth());
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    setMessage('');
    try {
      setReport(await apiFetch(`/api/admin/payouts?month=${encodeURIComponent(month)}`));
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => { load(); }, [month]); // eslint-disable-line react-hooks/exhaustive-deps

  const markPaid = async (row) => {
    if (!window.confirm(`${row.email}さんへ${row.amount_due_yen}円をPayPay送金済みにしますか？`)) return;
    try {
      await apiFetch('/api/admin/payouts/mark-paid', {
        method: 'POST',
        body: JSON.stringify({ month, referrerUserId: row.referrer_user_id, note: 'PayPay手動送金' }),
      });
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div style={panelStyle}>
      <h2 style={{ color: '#5D4037' }}>🔐 月末PayPay精算（管理者）</h2>
      <div style={{ display: 'flex', gap: '8px', margin: '12px 0' }}>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={inputStyle} />
        <button type="button" onClick={load} style={{ ...primaryButtonStyle, width: 'auto' }}>更新</button>
      </div>
      {report?.batch && (
        <p style={{ fontSize: '0.85rem', color: '#6D4C41', marginBottom: '10px' }}>
          締め日: {String(report.batch.closed_at).slice(0, 10)} ／ 送金期限: {report.batch.due_on}
        </p>
      )}
      <div style={{ display: 'grid', gap: '10px' }}>
        {report?.rows?.map((row) => (
          <div key={row.referrer_user_id} style={{ border: '2px solid #FFE0B2', borderRadius: '12px', padding: '12px' }}>
            <strong style={{ display: 'block', overflowWrap: 'anywhere' }}>{row.email}</strong>
            <p style={{ fontSize: '0.84rem', color: '#6D4C41', margin: '5px 0' }}>
              紹介 {row.paying_referrals}人 ／ 未払い {row.unpaid_commissions}件 ／ <strong>{row.amount_due_yen}円</strong>
              {row.paypay_id ? ` ／ PayPay ID: ${row.paypay_id}` : ''}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              <button type="button" onClick={() => copyText(row.email)} style={{ ...primaryButtonStyle, width: 'auto', padding: '8px 12px', background: '#42A5F5' }}>メールをコピー</button>
              <button type="button" onClick={() => copyText(String(row.amount_due_yen))} style={{ ...primaryButtonStyle, width: 'auto', padding: '8px 12px', background: '#66BB6A' }}>金額をコピー</button>
              {Number(row.amount_due_yen) > 0 && (
                <button type="button" onClick={() => markPaid(row)} style={{ ...primaryButtonStyle, width: 'auto', padding: '8px 12px' }}>送金済みにする</button>
              )}
            </div>
          </div>
        ))}
        {report?.rows?.length === 0 && <p style={{ color: '#8D6E63' }}>この月の紹介報酬はありません。</p>}
      </div>
      {message && <p style={{ color: '#D84315', marginTop: '9px' }}>{message}</p>}
    </div>
  );
}

export default function AdminPage({ onBack }) {
  const { account, apiFetch } = useAccount();

  return (
    <main style={{ padding: '20px 14px 48px', maxWidth: '620px', margin: '0 auto', display: 'grid', gap: '16px' }}>
      <button onClick={onBack} style={{ border: 'none', background: 'none', color: '#1E88E5', fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', justifySelf: 'start' }}>
        ← マイページにもどる
      </button>
      {account?.isAdmin ? (
        <AdminPayoutPanel apiFetch={apiFetch} />
      ) : (
        <div style={panelStyle}>
          <h2 style={{ color: '#5D4037' }}>このページは表示できません</h2>
          <p style={{ marginTop: '8px', color: '#6D4C41' }}>管理者アカウントでログインしてください。</p>
        </div>
      )}
    </main>
  );
}
