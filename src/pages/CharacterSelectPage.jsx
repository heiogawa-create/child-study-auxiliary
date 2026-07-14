import { CHARACTER_TYPES } from '../data/characters';
import CharacterAvatar from '../components/CharacterAvatar';

export default function CharacterSelectPage({ onSelect, currentCharacterId = null, totalStamps = 0, onBack = null }) {
  return (
    <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', fontSize: '1.1rem', color: '#42A5F5',
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, padding: '4px 0', marginBottom: '8px',
          }}
        >
          ← もどる
        </button>
      )}

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#FF7043',
            marginBottom: '8px',
          }}
        >
          💡 べんきょうヒント
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#5D4037', fontWeight: 700 }}>
          ⭐ すきなキャラクターをえらんでね！
        </p>
        <p style={{ fontSize: '0.9rem', color: '#9E9E9E', marginTop: '4px' }}>
          {currentCharacterId ? 'レベルはそのままひきつがれるよ！' : 'まいにちがんばるとしんかするよ！'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {CHARACTER_TYPES.map((type) => {
          const isCurrent = type.id === currentCharacterId;
          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                backgroundColor: isCurrent ? 'rgba(255,183,77,0.12)' : 'white',
                border: `3px solid ${type.color}`,
                borderRadius: '16px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                transition: 'transform 0.15s',
                position: 'relative',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {isCurrent && (
                <span style={{
                  position: 'absolute', top: '8px', right: '10px', fontSize: '0.75rem',
                  fontWeight: 800, color: 'white', backgroundColor: type.color,
                  borderRadius: '10px', padding: '2px 8px',
                }}>
                  いまのキャラ
                </span>
              )}
              <div style={{ flexShrink: 0, width: 80, height: 80 }}>
                <CharacterAvatar typeId={type.id} totalStamps={isCurrent ? totalStamps : 0} size={80} />
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: type.color,
                    marginBottom: '4px',
                  }}
                >
                  {type.icon} {type.name}
                </p>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: '#757575',
                    whiteSpace: 'pre-line',
                    lineHeight: '1.4',
                  }}
                >
                  {type.description}
                </p>
                <p style={{ marginTop: '6px', fontSize: '0.68rem', lineHeight: 1.4, color: '#8D6E63', fontWeight: 700 }}>
                  {type.evolution.map((character) => character.name).join(' → ')}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
