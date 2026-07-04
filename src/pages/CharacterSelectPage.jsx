import { CHARACTER_TYPES } from '../data/characters';
import CharacterAvatar from '../components/CharacterAvatar';

export default function CharacterSelectPage({ onSelect }) {
  return (
    <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
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
          まいにちがんばるとしんかするよ！
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {CHARACTER_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              backgroundColor: 'white',
              border: `3px solid ${type.color}`,
              borderRadius: '16px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
              transition: 'transform 0.15s',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div style={{ flexShrink: 0, width: 80, height: 80 }}>
              <CharacterAvatar typeId={type.id} totalStamps={0} size={80} />
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
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
