import TeacherCharacter from '../components/TeacherCharacter';
import ActionButton from '../components/ActionButton';

export default function RewardPage({ stamps, onGoHome }) {
  return (
    <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <TeacherCharacter size={100} />
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#FF7043',
            margin: '8px 0',
          }}
        >
          🏆 ごほうびスタンプ
        </h2>
        <p style={{ fontSize: '1rem', color: '#757575' }}>
          がんばったぶんだけスタンプがふえるよ！
        </p>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '20px',
          minHeight: '120px',
        }}
      >
        {stamps.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              color: '#BDBDBD',
              fontSize: '1.05rem',
              padding: '20px 0',
            }}
          >
            まだスタンプがないよ。もんだいをといてみよう！
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
            }}
          >
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
                  animation: 'fadeIn 0.3s ease',
                }}
                title={stamp.date}
              >
                {stamp.type}
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          textAlign: 'center',
          padding: '12px',
          backgroundColor: 'rgba(255,255,255,0.7)',
          borderRadius: '12px',
          marginBottom: '20px',
          fontSize: '1rem',
        }}
      >
        ぜんぶで <strong style={{ fontSize: '1.3rem', color: '#FF7043' }}>{stamps.length}</strong> こ
        あつめたよ！
      </div>

      <ActionButton onClick={onGoHome} color="#42A5F5">
        🏠 ホームにもどる
      </ActionButton>
    </div>
  );
}
