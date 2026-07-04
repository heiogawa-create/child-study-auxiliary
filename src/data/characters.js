// キャラクタータイプと進化レベルの定義
// レベルアップ条件: スタンプの合計数

export const LEVEL_THRESHOLDS = [0, 5, 15, 30];

export const LEVELS = [
  { level: 1, label: 'レベル1', minStamps: 0 },
  { level: 2, label: 'レベル2', minStamps: 5 },
  { level: 3, label: 'レベル3', minStamps: 15 },
  { level: 4, label: 'レベル4', minStamps: 30 },
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
