import CharacterAvatar from '../components/CharacterAvatar';
import { GRADES } from '../data/units';

export default function GradeSelectPage({ subject, characterId, totalStamps, onSelectGrade, onBack }) {
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
        {GRADES.map((grade) => (
          <button
            key={grade.id}
            onClick={() => grade.available && onSelectGrade(grade.id)}
            disabled={!grade.available}
            style={{
              width: '100%',
              padding: '18px 24px',
              fontSize: '1.3rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              color: grade.available ? 'white' : '#BDBDBD',
              backgroundColor: grade.available ? '#FF7043' : '#F5F5F5',
              border: 'none',
              borderRadius: '16px',
              cursor: grade.available ? 'pointer' : 'not-allowed',
              boxShadow: grade.available ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            {grade.name}
            {!grade.available && '（じゅんびちゅう）'}
          </button>
        ))}
      </div>
    </div>
  );
}
