const SUBJECT_ICONS = {
  さんすう: '🔢',
  こくご: '📖',
  えいご: '🔤',
  りか: '🔬',
  しゃかい: '🗾',
  そのほか: '📝',
};

const SUBJECT_COLORS = {
  さんすう: '#FF7043',
  こくご: '#66BB6A',
  えいご: '#42A5F5',
  りか: '#AB47BC',
  しゃかい: '#26A69A',
  そのほか: '#FFA726',
};

export default function SubjectButton({ subject, onClick }) {
  return (
    <button
      onClick={() => onClick(subject)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        width: '100%',
        padding: '18px 24px',
        fontSize: '1.3rem',
        fontWeight: 700,
        fontFamily: 'inherit',
        color: 'white',
        backgroundColor: SUBJECT_COLORS[subject] || '#78909C',
        border: 'none',
        borderRadius: '16px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <span style={{ fontSize: '1.6rem' }}>{SUBJECT_ICONS[subject]}</span>
      {subject}
    </button>
  );
}
