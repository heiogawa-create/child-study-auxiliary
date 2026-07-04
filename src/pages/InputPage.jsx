import { useState } from 'react';
import CharacterAvatar from '../components/CharacterAvatar';
import ActionButton from '../components/ActionButton';
import PhotoCapture from '../components/PhotoCapture';

const SUBJECT_ICONS = {
  さんすう: '🔢',
  こくご: '📖',
  えいご: '🔤',
  りか: '🔬',
  そのほか: '📝',
};

export default function InputPage({ subject, characterId, totalStamps, onSubmit, onBack }) {
  const [question, setQuestion] = useState('');
  const [thinking, setThinking] = useState('');
  const [photo, setPhoto] = useState(null);

  const canSubmit = question.trim() || photo;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(question.trim(), thinking.trim(), photo);
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.1rem',
          color: '#42A5F5',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontWeight: 700,
          padding: '4px 0',
          marginBottom: '8px',
        }}
      >
        ← もどる
      </button>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <CharacterAvatar typeId={characterId} totalStamps={totalStamps} size={100} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#5D4037' }}>
          {SUBJECT_ICONS[subject]} {subject}のもんだい
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <PhotoCapture photo={photo} onPhotoChange={setPhoto} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#BDBDBD' }}>
          <div style={{ flex: 1, height: '2px', backgroundColor: '#E0E0E0' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>または</span>
          <div style={{ flex: 1, height: '2px', backgroundColor: '#E0E0E0' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: '#5D4037' }}>
            📝 もんだいをかいてね
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="ここにもんだいをかいてね..."
            rows={3}
            style={{
              width: '100%', padding: '14px', fontSize: '1.05rem', fontFamily: 'inherit',
              border: '3px solid #E0E0E0', borderRadius: '12px', resize: 'vertical', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#42A5F5')}
            onBlur={(e) => (e.target.style.borderColor = '#E0E0E0')}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: '#5D4037' }}>
            💭 どこまでかんがえた？（なくてもOK）
          </label>
          <textarea
            value={thinking}
            onChange={(e) => setThinking(e.target.value)}
            placeholder="じぶんでかんがえたことをかいてね..."
            rows={3}
            style={{
              width: '100%', padding: '14px', fontSize: '1.05rem', fontFamily: 'inherit',
              border: '3px solid #E0E0E0', borderRadius: '12px', resize: 'vertical', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#42A5F5')}
            onBlur={(e) => (e.target.style.borderColor = '#E0E0E0')}
          />
        </div>

        <ActionButton onClick={handleSubmit} color="#FF7043" disabled={!canSubmit}>
          💡 ヒントをもらう
        </ActionButton>
      </div>
    </div>
  );
}
