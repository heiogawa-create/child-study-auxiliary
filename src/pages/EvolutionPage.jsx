import { useState, useEffect } from 'react';
import CharacterAvatar from '../components/CharacterAvatar';
import ActionButton from '../components/ActionButton';
import { getCharacterType, LEVELS } from '../data/characters';

export default function EvolutionPage({ characterId, newLevel, totalStamps, onClose }) {
  const [phase, setPhase] = useState('flash');
  const type = getCharacterType(characterId);
  const evo = type.evolution[newLevel - 1];
  const prevEvo = newLevel > 1 ? type.evolution[newLevel - 2] : null;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 1200);
    return () => clearTimeout(t1);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: phase === 'flash'
          ? 'radial-gradient(circle, #FFF9C4 0%, #FFE082 100%)'
          : 'radial-gradient(circle, #FFF9C4 0%, #FFFDE7 100%)',
        transition: 'background 0.8s ease',
      }}
    >
      <div style={{ textAlign: 'center', padding: '24px 16px', maxWidth: '400px' }}>
        {phase === 'flash' ? (
          <div style={{ animation: 'evolveFlash 1.2s ease' }}>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FF6F00', marginBottom: '16px' }}>
              ✨ しんかちゅう... ✨
            </p>
            {prevEvo && (
              <div style={{ opacity: 0.5 }}>
                <CharacterAvatar
                  typeId={characterId}
                  totalStamps={LEVELS[newLevel - 2].minStamps}
                  size={120}
                />
                <p style={{ fontWeight: 700, color: '#9E9E9E', marginTop: '8px' }}>
                  {prevEvo.name}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ animation: 'evolveReveal 0.8s ease' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FF6F00', marginBottom: '4px' }}>
              🎉 しんかした！
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#FF7043', marginBottom: '8px' }}>
              レベル{newLevel}
            </p>

            <CharacterAvatar
              typeId={characterId}
              totalStamps={totalStamps}
              size={160}
            />

            <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#5D4037', marginTop: '12px' }}>
              {evo.name}
            </p>
            <p style={{ fontSize: '1rem', color: '#8D6E63', marginBottom: '8px' }}>
              （{evo.title}）
            </p>

            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(255,255,255,0.8)',
                borderRadius: '12px',
                marginBottom: '20px',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#5D4037',
              }}
            >
              「{evo.message}」
            </div>

            <ActionButton onClick={onClose} color="#FF7043">
              やったー！つづける
            </ActionButton>
          </div>
        )}
      </div>

      <style>{`
        @keyframes evolveFlash {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(0.5); opacity: 0; }
        }
        @keyframes evolveReveal {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
