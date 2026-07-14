import CharacterAvatar from '../components/CharacterAvatar';
import ActionButton from '../components/ActionButton';
import { getEvolution, getLevel, CHARACTER_TYPES, LEVELS } from '../data/characters';

export default function RewardPage({ characterId, stamps, totalStamps, onGoHome, onChangeCharacter }) {
  const evo = getEvolution(characterId, totalStamps);
  const level = getLevel(totalStamps);
  const type = CHARACTER_TYPES.find((c) => c.id === characterId) || CHARACTER_TYPES[0];

  return (
    <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <CharacterAvatar typeId={characterId} totalStamps={totalStamps} size={120} />
        <p style={{ fontSize: '1rem', fontWeight: 800, color: '#5D4037', marginTop: '4px' }}>
          Lv.{level} {evo.name}（{evo.title}）
        </p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FF7043', margin: '8px 0' }}>
          🏆 ごほうびスタンプ
        </h2>
      </div>

      {/* 進化ロードマップ */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '16px',
        }}
      >
        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#5D4037', marginBottom: '10px', textAlign: 'center' }}>
          ✨ しんかのみち
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {type.evolution.map((e, i) => {
            const isActive = i < level;
            const isCurrent = i === level - 1;
            return (
              <div key={i} style={{ textAlign: 'center', flex: 1, position: 'relative' }}>
                {i > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '-50%',
                      top: '27px',
                      width: '100%',
                      height: '3px',
                      backgroundColor: isActive ? '#FFB74D' : '#E0E0E0',
                    }}
                  />
                )}
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 5px',
                  backgroundColor: isActive ? '#FFF8E1' : '#EEEEEE', border: isCurrent ? '3px solid #FF7043' : '2px solid white',
                  position: 'relative', zIndex: 1, overflow: 'hidden', filter: isActive ? 'none' : 'grayscale(1)', opacity: isActive ? 1 : 0.55,
                }}>
                  <CharacterAvatar typeId={characterId} totalStamps={LEVELS[i].minStamps} size={52} />
                </div>
                <p style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: isCurrent ? '#FF7043' : isActive ? '#5D4037' : '#BDBDBD',
                }}>
                  {e.name}
                </p>
                <p style={{ fontSize: '0.6rem', color: '#9E9E9E' }}>
                  {LEVELS[i].minStamps}こ
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* スタンプ一覧 */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '16px',
          minHeight: '100px',
        }}
      >
        {stamps.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#BDBDBD', fontSize: '1.05rem', padding: '20px 0' }}>
            まだスタンプがないよ。もんだいをといてみよう！
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {stamps.map((stamp) => (
              <div
                key={stamp.id}
                style={{
                  fontSize: '2rem',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,224,130,0.3)',
                  borderRadius: '12px',
                }}
                title={stamp.date}
              >
                {stamp.type}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '12px', marginBottom: '20px', fontSize: '1rem' }}>
        ぜんぶで <strong style={{ fontSize: '1.3rem', color: '#FF7043' }}>{stamps.length}</strong> こ あつめたよ！
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <ActionButton onClick={onGoHome} color="#42A5F5">
          🏠 ホームにもどる
        </ActionButton>
        {onChangeCharacter && (
          <ActionButton onClick={onChangeCharacter} color="#AB47BC" variant="outline">
            🔄 キャラクターをかえる
          </ActionButton>
        )}
      </div>
    </div>
  );
}
