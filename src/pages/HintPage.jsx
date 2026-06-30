import { useState, useEffect } from 'react';
import TeacherCharacter from '../components/TeacherCharacter';
import ActionButton from '../components/ActionButton';
import { generateHint } from '../services/hintService';

const MAX_HINTS = 3;

export default function HintPage({
  subject,
  question,
  thinking,
  onNewQuestion,
  onGoHome,
  onEarnStamp,
}) {
  const [hints, setHints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stampEarned, setStampEarned] = useState(false);

  // 最初のヒントを取得
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const hint = await generateHint(subject, question, thinking, 0);
      if (!cancelled) {
        setHints([hint]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [subject, question, thinking]);

  const handleMoreHint = async () => {
    const nextLevel = hints.length;
    if (nextLevel >= MAX_HINTS) return;
    setLoading(true);
    const hint = await generateHint(subject, question, thinking, nextLevel);
    setHints((prev) => [...prev, hint]);
    setLoading(false);
  };

  const handleEarnStamp = () => {
    if (!stampEarned) {
      onEarnStamp();
      setStampEarned(true);
    }
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <TeacherCharacter size={100} speaking={loading} />
        {loading && hints.length === 0 ? (
          <p
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#FF7043',
              marginTop: '8px',
            }}
          >
            ヒントをかんがえているよ...
          </p>
        ) : (
          <p
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#66BB6A',
              marginTop: '8px',
            }}
          >
            いいね！ここまでかんがえられているよ！
          </p>
        )}
      </div>

      {/* ヒント表示エリア */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {hints.map((hint, index) => (
          <div
            key={index}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              borderLeft: '5px solid #FFB74D',
              animation: 'fadeIn 0.4s ease',
            }}
          >
            <p
              style={{
                fontSize: '0.85rem',
                color: '#FF7043',
                fontWeight: 700,
                marginBottom: '6px',
              }}
            >
              💡 ヒント {index + 1}
            </p>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.7' }}>{hint}</p>
          </div>
        ))}

        {loading && hints.length > 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '16px',
              color: '#FF7043',
              fontWeight: 700,
            }}
          >
            もうすこしまってね...
          </div>
        )}
      </div>

      {/* ボタンエリア */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {hints.length < MAX_HINTS && (
          <ActionButton
            onClick={handleMoreHint}
            color="#FFB74D"
            disabled={loading}
          >
            🔍 もうすこしヒント（のこり{MAX_HINTS - hints.length}かい）
          </ActionButton>
        )}

        {hints.length >= MAX_HINTS && !stampEarned && (
          <div
            style={{
              textAlign: 'center',
              padding: '12px',
              backgroundColor: 'rgba(255,183,77,0.15)',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#E65100',
            }}
          >
            ヒントはここまで！じぶんでかんがえてみよう！💪
          </div>
        )}

        {!stampEarned && (
          <ActionButton onClick={handleEarnStamp} color="#66BB6A">
            ✅ がんばったよ！スタンプをもらう
          </ActionButton>
        )}

        {stampEarned && (
          <div
            style={{
              textAlign: 'center',
              padding: '16px',
              fontSize: '1.5rem',
              animation: 'fadeIn 0.5s ease',
            }}
          >
            🎉 スタンプゲット！すごいね！
          </div>
        )}

        <ActionButton onClick={onNewQuestion} color="#42A5F5" variant="outline">
          📝 べつのもんだい
        </ActionButton>

        <ActionButton onClick={onGoHome} color="#78909C" variant="outline">
          🏠 ホームにもどる
        </ActionButton>
      </div>
    </div>
  );
}
