// キャラクタータイプと進化レベルの定義
// レベルアップ条件: スタンプの合計数

// 1問正解ごとにスタンプが1つ増える。40問ドリルに合わせ、
// 早すぎず達成感も得られる進化ペースにしている。
export const LEVEL_THRESHOLDS = [0, 20, 60, 150];

export const LEVELS = [
  { level: 1, label: 'レベル1', minStamps: 0 },
  { level: 2, label: 'レベル2', minStamps: 20 },
  { level: 3, label: 'レベル3', minStamps: 60 },
  { level: 4, label: 'レベル4', minStamps: 150 },
];

export function getLevel(totalStamps) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalStamps >= LEVELS[i].minStamps) return LEVELS[i].level;
  }
  return 1;
}

export function getNextLevelStamps(totalStamps) {
  const currentLevel = getLevel(totalStamps);
  if (currentLevel >= 4) return null;
  return LEVELS[currentLevel].minStamps;
}

export function getLevelProgress(totalStamps) {
  const level = getLevel(totalStamps);
  const currentMinimum = LEVELS[level - 1].minStamps;
  if (level >= LEVELS.length) {
    return { level, currentMinimum, nextMinimum: null, remaining: 0, percentage: 100 };
  }

  const nextMinimum = LEVELS[level].minStamps;
  const earnedInLevel = totalStamps - currentMinimum;
  const levelSpan = nextMinimum - currentMinimum;
  return {
    level,
    currentMinimum,
    nextMinimum,
    remaining: Math.max(0, nextMinimum - totalStamps),
    percentage: Math.min(100, Math.max(0, (earnedInLevel / levelSpan) * 100)),
  };
}

export const CHARACTER_TYPES = [
  {
    id: 'fairy',
    name: 'ようせいタイプ',
    icon: '🧚',
    color: '#FFD54F',
    description: 'かわいいようせいたちと\nいっしょにひらめこう！',
    evolution: [
      { name: 'ピコ', title: 'ヒントのようせい', message: 'おべんきょう、いっしょにがんばろう！' },
      { name: 'ココ', title: 'ものしりようせい', message: 'わからないときは、ヒントをつかってみてね！' },
      { name: 'キラ', title: 'ひらめきようせい', message: 'そのちょうし！ひらめきはすぐそばにあるよ！' },
      { name: 'ソラ', title: 'ちえのまもりびと', message: 'すごいね！きみはとってもがんばってるよ！' },
    ],
  },
  {
    id: 'owl',
    name: 'フクロウタイプ',
    icon: '🦉',
    color: '#8D6E63',
    description: 'ふくろうせんせいが\nやさしくおしえてくれるよ！',
    evolution: [
      { name: 'ホゥ', title: 'こふくろう', message: 'いっしょにべんきょうしよう！ホゥ！' },
      { name: 'ウィズ', title: 'がくしゃフクロウ', message: 'よくかんがえているね！ホゥホゥ！' },
      { name: 'セージ', title: 'けんじゃフクロウ', message: 'そのちょうしだよ！ホゥ！' },
      { name: 'グラン', title: 'だいけんじゃ', message: 'きみのちからはすばらしい！ホゥ！' },
    ],
  },
  {
    id: 'robot',
    name: 'ロボットタイプ',
    icon: '🤖',
    color: '#78909C',
    description: 'AIロボといっしょに\nかしこくなろう！',
    evolution: [
      { name: 'ビット', title: 'こがたロボ', message: 'ピピッ！いっしょにがんばるロボ！' },
      { name: 'バイト', title: 'がくしゅうロボ', message: 'データかいせき…ヒントをはっけんしたロボ！' },
      { name: 'ギガ', title: 'スーパーロボ', message: 'キミののうりょく、すごいロボ！' },
      { name: 'テラ', title: 'てんさいロボ', message: 'さいこうレベル！キミはてんさいロボ！' },
    ],
  },
  {
    id: 'animal',
    name: 'どうぶつタイプ',
    icon: '🐱',
    color: '#FF8A65',
    description: 'どうぶつたちが\nきみをおうえんするよ！',
    evolution: [
      { name: 'ミケ', title: 'こねこ', message: 'いっしょにがんばるニャン！' },
      { name: 'タマ', title: 'ものしりねこ', message: 'いいかんがえだニャン！' },
      { name: 'レオ', title: 'ゆうかんなねこ', message: 'そのちょうし！すごいニャン！' },
      { name: 'キング', title: 'ねこのおうさま', message: 'きみはさいこうにすごいニャン！' },
    ],
  },
  {
    id: 'star',
    name: 'ほしのせいれいタイプ',
    icon: '⭐',
    color: '#7E57C2',
    description: 'ほしのせいれいたちと\nキラキラまなぼう！',
    evolution: [
      { name: 'ルナ', title: 'ちいさなほし', message: 'キラキラ！いっしょにがんばろう！' },
      { name: 'ステラ', title: 'かがやくほし', message: 'よくがんばっているよ！キラーン！' },
      { name: 'ノヴァ', title: 'すごいほし', message: 'そのかがやき、すばらしい！' },
      { name: 'コスモ', title: 'うちゅうのほし', message: 'きみのかがやきはうちゅういち！' },
    ],
  },
];

export function getCharacterType(typeId) {
  return CHARACTER_TYPES.find((c) => c.id === typeId) || CHARACTER_TYPES[0];
}

export function getEvolution(typeId, totalStamps) {
  const type = getCharacterType(typeId);
  const level = getLevel(totalStamps);
  return { ...type.evolution[level - 1], level };
}
