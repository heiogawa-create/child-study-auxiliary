import CharacterAvatar from '../components/CharacterAvatar';
import { GRADES, getUnits } from '../data/units';

export default function GradeSelectPage({
  subject,
  characterId,
  totalStamps,
  onSelectGrade,
  canAccessPremium,
  onRequirePremium,
  onBack,
}) {
  return (
    <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', fontSize: '1.1rem', color: '#42A5F5',
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, padding: '4px 0', marginBottom: '8px',
        }}
      >
        ← もどる
      </button>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <CharacterAvatar typeId={characterId} totalStamps={totalStamps} size={100} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#5D4037' }}>
          {subject} なんねんせい？
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {GRADES.map((grade, index) => {
          // りか・しゃかいのように3年生から始まる教科は、単元のない学年を選べなくする
          const unavailable = getUnits(subject, grade.id).length === 0;
          const locked = !unavailable && index > 0 && !canAccessPremium;
          return (
          <button
            key={grade.id}
            disabled={unavailable}
            onClick={() => locked ? onRequirePremium() : onSelectGrade(grade.id)}
            style={{
              width: '100%',
              padding: '18px 24px',
              fontSize: '1.3rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              color: 'white',
              backgroundColor: unavailable ? '#CFD8DC' : locked ? '#90A4AE' : '#FF7043',
              border: 'none',
              borderRadius: '16px',
              cursor: unavailable ? 'default' : 'pointer',
              boxShadow: unavailable ? 'none' : '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {locked ? '🔒 ' : ''}{grade.name}
            {unavailable ? (
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>（３ねんせいから）</span>
            ) : locked ? '（プレミアム）' : ''}
          </button>
          );
        })}
      </div>
      {!canAccessPremium && (
        <p style={{ marginTop: '14px', textAlign: 'center', color: '#6D4C41', fontSize: '0.85rem' }}>
          1年生は無料。2〜6年生は月額プランで使えます。
        </p>
      )}
    </div>
  );
}
