// オリジナルのかわいい先生キャラクター（SVGで描画）
export default function TeacherCharacter({ size = 120, speaking = false }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        margin: '0 auto',
        animation: speaking ? 'bounce 0.6s ease infinite alternate' : 'none',
      }}
    >
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        {/* からだ */}
        <ellipse cx="100" cy="170" rx="45" ry="30" fill="#FFB74D" />
        {/* かお */}
        <circle cx="100" cy="95" r="55" fill="#FFCC80" />
        {/* ほっぺ */}
        <circle cx="65" cy="110" r="12" fill="#FFAB91" opacity="0.6" />
        <circle cx="135" cy="110" r="12" fill="#FFAB91" opacity="0.6" />
        {/* め */}
        <ellipse cx="78" cy="90" rx="8" ry="10" fill="#5D4037" />
        <ellipse cx="122" cy="90" rx="8" ry="10" fill="#5D4037" />
        <circle cx="81" cy="87" r="3" fill="white" />
        <circle cx="125" cy="87" r="3" fill="white" />
        {/* くち */}
        <path
          d={speaking
            ? 'M 85 115 Q 100 130 115 115'
            : 'M 85 115 Q 100 125 115 115'}
          fill="none"
          stroke="#5D4037"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* ぼうし（先生帽） */}
        <rect x="60" y="38" width="80" height="15" rx="3" fill="#42A5F5" />
        <rect x="75" y="20" width="50" height="22" rx="3" fill="#42A5F5" />
        <circle cx="100" cy="20" r="6" fill="#FFD54F" />
        {/* めがね */}
        <circle cx="78" cy="90" r="16" fill="none" stroke="#795548" strokeWidth="2.5" />
        <circle cx="122" cy="90" r="16" fill="none" stroke="#795548" strokeWidth="2.5" />
        <line x1="94" y1="90" x2="106" y2="90" stroke="#795548" strokeWidth="2.5" />
      </svg>
    </div>
  );
}
