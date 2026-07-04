export default function ClockFace({ hour, minute, size = 160 }) {
  const center = size / 2;
  const hourAngle = ((hour % 12) + minute / 60) * 30 - 90;
  const minuteAngle = minute * 6 - 90;
  const hourLen = size * 0.28;
  const minuteLen = size * 0.4;

  const hourX = center + hourLen * Math.cos((hourAngle * Math.PI) / 180);
  const hourY = center + hourLen * Math.sin((hourAngle * Math.PI) / 180);
  const minuteX = center + minuteLen * Math.cos((minuteAngle * Math.PI) / 180);
  const minuteY = center + minuteLen * Math.sin((minuteAngle * Math.PI) / 180);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={center} cy={center} r={size / 2 - 4} fill="white" stroke="#FF7043" strokeWidth="4" />
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x = center + (size * 0.42) * Math.cos(angle);
        const y = center + (size * 0.42) * Math.sin(angle);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.09} fontWeight="800" fill="#5D4037">
            {i === 0 ? 12 : i}
          </text>
        );
      })}
      <line x1={center} y1={center} x2={hourX} y2={hourY} stroke="#5D4037" strokeWidth={size * 0.035} strokeLinecap="round" />
      <line x1={center} y1={center} x2={minuteX} y2={minuteY} stroke="#42A5F5" strokeWidth={size * 0.025} strokeLinecap="round" />
      <circle cx={center} cy={center} r={size * 0.04} fill="#FF7043" />
    </svg>
  );
}
