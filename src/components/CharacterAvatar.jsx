import { getLevel } from '../data/characters';

// 5ぼうのほしのpathをつくる
function starPath(cx, cy, outerR, innerR) {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return `M ${points.join(' L ')} Z`;
}

// キャラクタータイプ別・レベル別のSVGアバター
function FairyAvatar({ level }) {
  const colors = [
    { body: '#FFF9C4', wing: '#FFE082', dress: '#FFD54F', glow: 'none' },
    { body: '#C8E6C9', wing: '#A5D6A7', dress: '#66BB6A', glow: 'none' },
    { body: '#BBDEFB', wing: '#90CAF9', dress: '#42A5F5', glow: '#E3F2FD' },
    { body: '#E1BEE7', wing: '#CE93D8', dress: '#AB47BC', glow: '#F3E5F5' },
  ];
  const c = colors[level - 1];
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      {level >= 3 && <circle cx="100" cy="100" r="90" fill={c.glow} opacity="0.5" />}
      {level >= 4 && <>
        <path d={starPath(30, 40, 5, 2)} fill="#FFD54F" opacity="0.8" />
        <path d={starPath(172, 55, 4, 1.5)} fill="#FFD54F" opacity="0.7" />
        <path d={starPath(25, 110, 4, 1.5)} fill="#FFD54F" opacity="0.7" />
        <path d={starPath(178, 130, 5, 2)} fill="#FFD54F" opacity="0.8" />
        <path d={starPath(100, 12, 6, 2.5)} fill="#FFD54F" opacity="0.8" />
      </>}
      {/* はね */}
      <ellipse cx="60" cy="90" rx="25" ry={level >= 3 ? 40 : 30} fill={c.wing} opacity="0.7" transform="rotate(-15 60 90)" />
      <ellipse cx="140" cy="90" rx="25" ry={level >= 3 ? 40 : 30} fill={c.wing} opacity="0.7" transform="rotate(15 140 90)" />
      {level >= 2 && <>
        <ellipse cx="50" cy="85" rx="15" ry={level >= 3 ? 30 : 22} fill={c.wing} opacity="0.4" transform="rotate(-25 50 85)" />
        <ellipse cx="150" cy="85" rx="15" ry={level >= 3 ? 30 : 22} fill={c.wing} opacity="0.4" transform="rotate(25 150 85)" />
      </>}
      {/* からだ */}
      <ellipse cx="100" cy="155" rx="30" ry="25" fill={c.dress} />
      {/* フード（ココ・レベル2） */}
      {level === 2 && (
        <path d="M 58 80 Q 50 28 100 22 Q 150 28 142 80 Q 128 50 100 50 Q 72 50 58 80 Z" fill={c.dress} />
      )}
      {/* フード（キラ・レベル3） */}
      {level === 3 && (
        <path d="M 55 82 Q 45 26 100 18 Q 155 26 145 82 Q 130 48 100 48 Q 70 48 55 82 Z" fill={c.dress} />
      )}
      {/* こうりん（ソラ・レベル4） */}
      {level === 4 && (
        <circle cx="100" cy="70" r="55" fill="none" stroke="#FFD54F" strokeWidth="2.5" opacity="0.6" />
      )}
      {/* ながいかみ（ソラ・レベル4） */}
      {level === 4 && (
        <>
          <path d="M 55 85 Q 35 130 45 175 Q 55 165 60 140 Q 58 110 65 90 Z" fill="#FFF9E1" stroke="#FFECB3" strokeWidth="1" />
          <path d="M 145 85 Q 165 130 155 175 Q 145 165 140 140 Q 142 110 135 90 Z" fill="#FFF9E1" stroke="#FFECB3" strokeWidth="1" />
        </>
      )}
      {/* フード（ソラ・レベル4） */}
      {level === 4 && (
        <path d="M 52 84 Q 42 24 100 15 Q 158 24 148 84 Q 132 46 100 46 Q 68 46 52 84 Z" fill="#FDFAF6" stroke={c.dress} strokeWidth="2" />
      )}
      {/* かお */}
      <circle cx="100" cy="95" r="42" fill={c.body} />
      {/* ほっぺ */}
      <circle cx="75" cy="105" r="8" fill="#FFAB91" opacity="0.5" />
      <circle cx="125" cy="105" r="8" fill="#FFAB91" opacity="0.5" />
      {/* め */}
      <ellipse cx="85" cy="92" rx="5" ry="7" fill="#5D4037" />
      <ellipse cx="115" cy="92" rx="5" ry="7" fill="#5D4037" />
      <circle cx="87" cy="89" r="2" fill="white" />
      <circle cx="117" cy="89" r="2" fill="white" />
      {/* くち */}
      <path d="M 90 110 Q 100 118 110 110" fill="none" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
      {/* うずまき・はっぱ・ほん（ココ・レベル2） */}
      {level === 2 && (
        <>
          <path d="M 100 22 Q 94 8 104 5 Q 116 3 113 13 Q 111 19 103 16" fill="none" stroke={c.dress} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 118 16 L 142 4 Q 148 18 132 29 Z" fill="#81C784" stroke="#558B2F" strokeWidth="1" />
          <line x1="130" y1="14" x2="122" y2="23" stroke="#558B2F" strokeWidth="1" />
          <rect x="80" y="140" width="40" height="28" rx="3" fill="#2E7D32" />
          <rect x="97" y="140" width="6" height="28" fill="#1B5E20" />
          <path d="M 88 150 L 92 144 L 96 150 L 92 156 Z" fill="#A5D6A7" />
          <path d="M 104 150 L 108 144 L 112 150 L 108 156 Z" fill="#A5D6A7" />
        </>
      )}
      {/* うずまき・ほしのかざり・きらきら（キラ・レベル3） */}
      {level === 3 && (
        <>
          <path d="M 100 18 Q 94 4 104 1 Q 116 -1 113 9 Q 111 15 103 12" fill="none" stroke={c.dress} strokeWidth="3.5" strokeLinecap="round" />
          <path d={starPath(122, 40, 11, 5)} fill="#FFD54F" stroke="#FFB300" strokeWidth="1" />
          <path d={starPath(50, 45, 5, 2)} fill="#FFD54F" opacity="0.8" />
          <path d={starPath(158, 100, 6, 2.5)} fill="#FFD54F" opacity="0.8" />
          <path d={starPath(42, 120, 4, 1.5)} fill="#FFD54F" opacity="0.7" />
        </>
      )}
      {/* ステッキ（レベル3） */}
      {level === 3 && <>
        <line x1="135" y1="130" x2="155" y2="75" stroke="#FFB300" strokeWidth="3" strokeLinecap="round" />
        <rect x="147" y="118" width="8" height="6" rx="2" fill="#42A5F5" />
        <path d={starPath(155, 68, 12, 5)} fill="#FFD54F" stroke="#FFB300" strokeWidth="1.5" />
      </>}
      {/* おうじょのつえ（ソラ・レベル4） */}
      {level === 4 && <>
        <line x1="135" y1="132" x2="152" y2="72" stroke="#FFD54F" strokeWidth="3" strokeLinecap="round" />
        <circle cx="152" cy="58" r="13" fill="none" stroke="#FFD54F" strokeWidth="3" />
        <path d={starPath(152, 56, 5, 2.2)} fill="#4FC3F7" />
      </>}
      {/* かんむり（レベル4） */}
      {level >= 4 && <>
        <path d="M 72 55 L 82 34 L 93 52 L 100 28 L 107 52 L 118 34 L 128 55" fill="#FFD54F" stroke="#FFB300" strokeWidth="1.5" strokeLinejoin="round" />
        <path d={starPath(100, 30, 7, 3)} fill="#4FC3F7" stroke="#0288D1" strokeWidth="1" />
      </>}
    </svg>
  );
}

function OwlAvatar({ level }) {
  const colors = [
    { body: '#D7CCC8', belly: '#EFEBE9', brow: '#8D6E63' },
    { body: '#A1887F', belly: '#D7CCC8', brow: '#5D4037' },
    { body: '#6D4C41', belly: '#BCAAA4', brow: '#3E2723' },
    { body: '#4E342E', belly: '#A1887F', brow: '#3E2723' },
  ];
  const c = colors[level - 1];
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      {level >= 4 && <circle cx="100" cy="100" r="90" fill="#FFF8E1" opacity="0.4" />}
      {/* からだ */}
      <ellipse cx="100" cy="130" rx="50" ry={55} fill={c.body} />
      <ellipse cx="100" cy="140" rx="35" ry="35" fill={c.belly} />
      {/* はね */}
      <ellipse cx="55" cy="120" rx="20" ry="35" fill={c.body} transform="rotate(-10 55 120)" />
      <ellipse cx="145" cy="120" rx="20" ry="35" fill={c.body} transform="rotate(10 145 120)" />
      {/* あたま */}
      <circle cx="100" cy="80" r="40" fill={c.body} />
      {/* みみ */}
      <path d="M 65 55 L 70 35 L 80 55" fill={c.brow} />
      <path d="M 120 55 L 130 35 L 135 55" fill={c.brow} />
      {/* めのまわり */}
      <circle cx="82" cy="78" r="18" fill="white" />
      <circle cx="118" cy="78" r="18" fill="white" />
      <circle cx="82" cy="78" r="9" fill="#5D4037" />
      <circle cx="118" cy="78" r="9" fill="#5D4037" />
      <circle cx="85" cy="75" r="3" fill="white" />
      <circle cx="121" cy="75" r="3" fill="white" />
      {/* くちばし */}
      <path d="M 94 93 L 100 103 L 106 93" fill="#FF8F00" />
      {/* めがね（レベル2+） */}
      {level >= 2 && <>
        <circle cx="82" cy="78" r="20" fill="none" stroke="#5D4037" strokeWidth="2.5" />
        <circle cx="118" cy="78" r="20" fill="none" stroke="#5D4037" strokeWidth="2.5" />
        <line x1="102" y1="78" x2="98" y2="78" stroke="#5D4037" strokeWidth="2.5" />
      </>}
      {/* ぼうし（レベル3+） */}
      {level >= 3 && <>
        <rect x="70" y="38" width="60" height="12" rx="3" fill="#1B5E20" />
        <rect x="80" y="22" width="40" height="20" rx="3" fill="#1B5E20" />
      </>}
      {/* マント（レベル4） */}
      {level >= 4 && <>
        <path d="M 55 100 Q 40 140 50 180 L 70 170 Q 65 130 70 110 Z" fill="#B71C1C" opacity="0.7" />
        <path d="M 145 100 Q 160 140 150 180 L 130 170 Q 135 130 130 110 Z" fill="#B71C1C" opacity="0.7" />
      </>}
    </svg>
  );
}

function RobotAvatar({ level }) {
  const colors = [
    { body: '#B0BEC5', head: '#CFD8DC', eye: '#4FC3F7', accent: '#78909C' },
    { body: '#90A4AE', head: '#B0BEC5', eye: '#29B6F6', accent: '#607D8B' },
    { body: '#78909C', head: '#90A4AE', eye: '#03A9F4', accent: '#546E7A' },
    { body: '#FFD54F', head: '#FFECB3', eye: '#FF5722', accent: '#FFA000' },
  ];
  const c = colors[level - 1];
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      {level >= 4 && <circle cx="100" cy="100" r="90" fill="#FFF8E1" opacity="0.3" />}
      {/* アンテナ */}
      <line x1="100" y1="35" x2="100" y2="50" stroke={c.accent} strokeWidth="3" />
      <circle cx="100" cy="30" r={level >= 3 ? 8 : 6} fill={c.eye} />
      {level >= 2 && <>
        <line x1="80" y1="45" x2="80" y2="55" stroke={c.accent} strokeWidth="2" />
        <circle cx="80" cy="42" r="4" fill={c.eye} />
        <line x1="120" y1="45" x2="120" y2="55" stroke={c.accent} strokeWidth="2" />
        <circle cx="120" cy="42" r="4" fill={c.eye} />
      </>}
      {/* あたま */}
      <rect x="62" y="50" width="76" height="65" rx="16" fill={c.head} />
      {/* め */}
      <rect x="75" y="68" width="18" height="14" rx="4" fill={c.eye} />
      <rect x="107" y="68" width="18" height="14" rx="4" fill={c.eye} />
      <rect x="80" y="71" width="6" height="6" rx="2" fill="white" />
      <rect x="112" y="71" width="6" height="6" rx="2" fill="white" />
      {/* くち */}
      <rect x="88" y="95" width="24" height="6" rx="3" fill={c.accent} />
      {/* からだ */}
      <rect x="70" y="120" width="60" height="50" rx="10" fill={c.body} />
      {/* ボタン */}
      <circle cx="90" cy="140" r="5" fill={c.eye} />
      <circle cx="110" cy="140" r="5" fill={c.eye} />
      {/* うで */}
      <rect x="50" y="125" width="18" height={level >= 3 ? 40 : 30} rx="8" fill={c.accent} />
      <rect x="132" y="125" width="18" height={level >= 3 ? 40 : 30} rx="8" fill={c.accent} />
      {/* はね（レベル3+） */}
      {level >= 3 && <>
        <path d="M 50 115 L 30 100 L 35 120 Z" fill={c.eye} opacity="0.6" />
        <path d="M 150 115 L 170 100 L 165 120 Z" fill={c.eye} opacity="0.6" />
      </>}
      {/* ハート（レベル4） */}
      {level >= 4 && <text x="100" y="160" textAnchor="middle" fontSize="16">❤️</text>}
    </svg>
  );
}

function AnimalAvatar({ level }) {
  const colors = [
    { body: '#FFE0B2', ear: '#FFCC80', nose: '#FF8A65' },
    { body: '#FFCCBC', ear: '#FFAB91', nose: '#FF7043' },
    { body: '#FFE082', ear: '#FFD54F', nose: '#FFA726' },
    { body: '#FFF9C4', ear: '#FFE082', nose: '#FFB300' },
  ];
  const c = colors[level - 1];
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      {level >= 4 && <circle cx="100" cy="100" r="90" fill="#FFF8E1" opacity="0.4" />}
      {/* みみ */}
      <path d="M 60 65 L 50 25 L 80 55 Z" fill={c.ear} />
      <path d="M 140 65 L 150 25 L 120 55 Z" fill={c.ear} />
      <path d="M 65 60 L 58 32 L 78 55 Z" fill="#FFAB91" opacity="0.5" />
      <path d="M 135 60 L 142 32 L 122 55 Z" fill="#FFAB91" opacity="0.5" />
      {/* かお */}
      <circle cx="100" cy="90" r="48" fill={c.body} />
      {/* からだ */}
      <ellipse cx="100" cy="160" rx="35" ry="28" fill={c.body} />
      {/* ほっぺ */}
      <circle cx="70" cy="100" r="10" fill="#FFAB91" opacity="0.4" />
      <circle cx="130" cy="100" r="10" fill="#FFAB91" opacity="0.4" />
      {/* め */}
      <ellipse cx="82" cy="85" rx="6" ry="8" fill="#5D4037" />
      <ellipse cx="118" cy="85" rx="6" ry="8" fill="#5D4037" />
      <circle cx="84" cy="82" r="2.5" fill="white" />
      <circle cx="120" cy="82" r="2.5" fill="white" />
      {/* はな */}
      <ellipse cx="100" cy="97" rx="6" ry="4" fill={c.nose} />
      {/* くち */}
      <path d="M 93 102 Q 100 108 107 102" fill="none" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" />
      {/* ひげ */}
      <line x1="60" y1="95" x2="80" y2="98" stroke="#BDBDBD" strokeWidth="1.5" />
      <line x1="58" y1="100" x2="78" y2="101" stroke="#BDBDBD" strokeWidth="1.5" />
      <line x1="120" y1="98" x2="140" y2="95" stroke="#BDBDBD" strokeWidth="1.5" />
      <line x1="122" y1="101" x2="142" y2="100" stroke="#BDBDBD" strokeWidth="1.5" />
      {/* リボン（レベル2+） */}
      {level >= 2 && <>
        <circle cx="140" cy="55" r="5" fill="#E91E63" />
        <path d="M 135 55 L 125 48 L 130 55 L 125 62 Z" fill="#E91E63" />
        <path d="M 145 55 L 155 48 L 150 55 L 155 62 Z" fill="#E91E63" />
      </>}
      {/* マント（レベル3+） */}
      {level >= 3 && <>
        <path d="M 65 130 Q 50 160 60 185 L 80 175 Z" fill="#FF5722" opacity="0.6" />
        <path d="M 135 130 Q 150 160 140 185 L 120 175 Z" fill="#FF5722" opacity="0.6" />
      </>}
      {/* かんむり（レベル4） */}
      {level >= 4 && <>
        <path d="M 72 48 L 80 28 L 90 45 L 100 22 L 110 45 L 120 28 L 128 48" fill="#FFD54F" stroke="#FFB300" strokeWidth="1.5" />
      </>}
    </svg>
  );
}

function StarAvatar({ level }) {
  const colors = [
    { body: '#E1BEE7', core: '#F3E5F5', glow: '#CE93D8' },
    { body: '#B39DDB', core: '#D1C4E9', glow: '#9575CD' },
    { body: '#7E57C2', core: '#B39DDB', glow: '#673AB7' },
    { body: '#FFD54F', core: '#FFF9C4', glow: '#FFC107' },
  ];
  const c = colors[level - 1];
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      {/* オーラ */}
      <circle cx="100" cy="100" r={level >= 3 ? 90 : 70} fill={c.glow} opacity="0.15" />
      {level >= 2 && <circle cx="100" cy="100" r={level >= 3 ? 75 : 55} fill={c.glow} opacity="0.1" />}
      {/* ほしのかけら（レベル3+） */}
      {level >= 3 && <>
        <text x="45" y="45" fontSize="14" opacity="0.6">✦</text>
        <text x="150" y="55" fontSize="12" opacity="0.5">✦</text>
        <text x="40" y="140" fontSize="10" opacity="0.4">✦</text>
        <text x="155" y="130" fontSize="13" opacity="0.5">✦</text>
      </>}
      {level >= 4 && <>
        <text x="70" y="30" fontSize="16" opacity="0.7">⭐</text>
        <text x="120" y="35" fontSize="12" opacity="0.6">⭐</text>
      </>}
      {/* からだ */}
      <circle cx="100" cy="95" r="45" fill={c.body} />
      <circle cx="100" cy="95" r="35" fill={c.core} />
      {/* かお */}
      <ellipse cx="88" cy="90" rx="4" ry="6" fill="#5D4037" />
      <ellipse cx="112" cy="90" rx="4" ry="6" fill="#5D4037" />
      <circle cx="90" cy="87" r="2" fill="white" />
      <circle cx="114" cy="87" r="2" fill="white" />
      <circle cx="78" cy="100" r="7" fill="#F48FB1" opacity="0.4" />
      <circle cx="122" cy="100" r="7" fill="#F48FB1" opacity="0.4" />
      <path d="M 92 105 Q 100 112 108 105" fill="none" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
      {/* あし */}
      <ellipse cx="85" cy="150" rx="12" ry="10" fill={c.body} />
      <ellipse cx="115" cy="150" rx="12" ry="10" fill={c.body} />
      {/* ステッキ（レベル2+） */}
      {level >= 2 && <>
        <line x1="140" y1="130" x2="160" y2="70" stroke={c.glow} strokeWidth="3" strokeLinecap="round" />
        <text x="160" y="68" textAnchor="middle" fontSize="18">⭐</text>
      </>}
      {/* はね（レベル3+） */}
      {level >= 3 && <>
        <ellipse cx="55" cy="90" rx="18" ry="30" fill={c.glow} opacity="0.3" transform="rotate(-10 55 90)" />
        <ellipse cx="145" cy="90" rx="18" ry="30" fill={c.glow} opacity="0.3" transform="rotate(10 145 90)" />
      </>}
      {/* かんむり（レベル4） */}
      {level >= 4 && <>
        <path d="M 78 55 L 85 35 L 95 50 L 100 30 L 105 50 L 115 35 L 122 55" fill="#FFD54F" stroke="#FFB300" strokeWidth="1.5" />
      </>}
    </svg>
  );
}

const OWL_IMAGE_PATHS = [
  '/characters/owl/owl-01-hou.webp',
  '/characters/owl/owl-02-wiz.webp',
  '/characters/owl/owl-03-sage.webp',
  '/characters/owl/owl-04-gran.webp',
];

function OwlImageAvatar({ level }) {
  return (
    <img
      src={OWL_IMAGE_PATHS[level - 1] || OWL_IMAGE_PATHS[0]}
      alt=""
      draggable="false"
      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', borderRadius: '22%' }}
    />
  );
}

const AVATAR_MAP = {
  fairy: FairyAvatar,
  owl: OwlImageAvatar,
  robot: RobotAvatar,
  animal: AnimalAvatar,
  star: StarAvatar,
};

export default function CharacterAvatar({ typeId, totalStamps, size = 120, speaking = false }) {
  const level = getLevel(totalStamps);
  const AvatarComponent = AVATAR_MAP[typeId] || FairyAvatar;

  return (
    <div
      style={{
        width: size,
        height: size,
        margin: '0 auto',
        animation: speaking ? 'bounce 0.6s ease infinite alternate' : 'float 3s ease-in-out infinite',
      }}
    >
      <AvatarComponent level={level} />
    </div>
  );
}
