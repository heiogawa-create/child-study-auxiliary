import CharacterAvatar from '../components/CharacterAvatar';
import SubjectButton from '../components/SubjectButton';
import { getEvolution, getLevel, getNextLevelStamps } from '../data/characters';

const SUBJECTS = ['さんすう', 'こくご', 'えいご', 'りか', 'そのほか'];

export default function HomePage({ characterId, onSelectSubject, totalStamps, todayStamps }) {
  const evo = getEvolution(characterId, totalStamps);
  const level = getLevel(totalStamps);
  const nextStamps = getNextLevelStamps(totalStamps);

  return (
    <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <CharacterAvatar typeId={characterId} totalStamps={totalStamps} size={130} />

        {/* キャラ名・レベル */}
        <p style={{ fontSize: '0.85rem', color: '#FF7043', fontWeight: 700, marginTop: '4px' }}>
          Lv.{level} {evo.name}（{evo.title}）
        </p>

        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#FF7043',
            margin: '4px 0',
          }}
        >
          べんきょうヒント
        </h1>

        {/* キャラのセリフ */}
        <div
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: '16px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#5D4037',
            marginBottom: '4px',
          }}
        >
          「{evo.message}」
        </div>
      </div>

      {/* スタンプ・進化バー */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(255,255,255,0.7)',
          borderRadius: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
          <span>⭐ きょう: <strong>{todayStamps}こ</strong></span>
          <span>🏆 ぜんぶ: <strong>{totalStamps}こ</strong></span>
        </div>

        {nextStamps !== null ? (
          <>
            <div
              style={{
                height: '12px',
                backgroundColor: '#E0E0E0',
                borderRadius: '6px',
                overflow: 'hidden',
                marginBottom: '4px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min((totalStamps / nextStamps) * 100, 100)}%`,
                  backgroundColor: '#FFB74D',
                  borderRadius: '6px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#9E9E9E', textAlign: 'right' }}>
              つぎのしんかまで あと <strong style={{ color: '#FF7043' }}>{nextStamps - totalStamps}</strong>こ
            </p>
          </>
        ) : (
          <p style={{ fontSize: '0.85rem', color: '#FF7043', fontWeight: 700, textAlign: 'center' }}>
            ✨ さいこうレベル！すごい！
          </p>
        )}
      </div>

      {/* 教科ボタン */}
      <p
        style={{
          textAlign: 'center',
          fontSize: '1.1rem',
          fontWeight: 700,
          marginBottom: '12px',
          color: '#5D4037',
        }}
      >
        どのきょうかのもんだい？
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {SUBJECTS.map((subject) => (
          <SubjectButton
            key={subject}
            subject={subject}
            onClick={onSelectSubject}
          />
        ))}
      </div>
    </div>
  );
}
