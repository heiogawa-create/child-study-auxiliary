export default function ActionButton({
  children,
  onClick,
  color = '#42A5F5',
  variant = 'filled',
  disabled = false,
}) {
  const isFilled = variant === 'filled';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '16px 24px',
        fontSize: '1.15rem',
        fontWeight: 700,
        fontFamily: 'inherit',
        color: isFilled ? 'white' : color,
        backgroundColor: disabled
          ? '#BDBDBD'
          : isFilled
            ? color
            : 'transparent',
        border: isFilled ? 'none' : `3px solid ${disabled ? '#BDBDBD' : color}`,
        borderRadius: '16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: isFilled ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.96)';
      }}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {children}
    </button>
  );
}
