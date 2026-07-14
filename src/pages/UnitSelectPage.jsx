import CharacterAvatar from '../components/CharacterAvatar';
import { getUnits } from '../data/units';

export default function UnitSelectPage({ subject, gradeId, characterId, totalStamps, onSelectUnit, onBack }) {
  const units = getUnits(subject, gradeId);

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
          📚 たんげんを えらんでね
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#9E9E9E' }}>
          1たんげん 40もん。ひらくたびに もんだいが かわるよ
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {units.map((unit) => (
          <button
            key={unit.id}
            onClick={() => onSelectUnit(unit)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '16px 20px',
              fontSize: '1.05rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              textAlign: 'left',
              color: '#5D4037',
              backgroundColor: 'white',
              border: '3px solid #FFB74D',
              borderRadius: '16px',
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
            }}
          >
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{unit.icon}</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block' }}>{unit.name}</span>
              <span style={{ display: 'block', marginTop: '5px', fontSize: '0.75rem', lineHeight: 1.45, color: '#8D6E63', fontWeight: 500 }}>
                {unit.skills}
              </span>
              <span style={{ display: 'inline-block', marginTop: '7px', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#FFF3E0', color: '#E65100', fontSize: '0.7rem' }}>
                {unit.domain} ・ {unit.questionCount}もん
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
