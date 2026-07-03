// ヒント生成サービス
// Netlify Function経由でAnthropic Claude APIを呼び出す
// API未接続時は仮のヒントを返す（フォールバック）

// 教科ごとの仮ヒント（APIエラー時のフォールバック）
const FALLBACK_HINTS = {
  さんすう: [
    'すごいね！まず、もんだいにでてくる「すうじ」をぜんぶみつけてみよう！',
    'いいかんじ！つぎは「なにをすればいいか」をかんがえてみよう。たしざん？ひきざん？',
    'もうすこし！ゆびやおはじきをつかって、じっさいにかぞえてみよう！',
  ],
  こくご: [
    'よくがんばっているね！まず、ぶんしょうをゆっくりよんでみよう！',
    'いいかんがえだね！「だれが」「なにをした」をさがしてみよう！',
    'もうすこし！わからないことばのまえとあとをよんでみよう！',
  ],
  えいご: [
    'すごい！まず、しっている「ことば」をさがしてみよう！',
    'いいね！えいごを「おと」にしてよんでみよう！',
    'もうすこし！にほんごでかんがえてから、えいごにしてみよう！',
  ],
  りか: [
    'りかのもんだい、すごいね！まず「もの」をよくかんさつしてみよう！',
    'いいかんがえ！「なぜそうなるの？」ってかんがえてみよう！',
    'もうすこし！えにかいてかんがえてみよう！',
  ],
  そのほか: [
    'もんだいにチャレンジしてえらい！なにをきいているか、じぶんのことばでいってみよう！',
    'いいかんがえだね！もんだいをちいさくわけて、ひとつずつかんがえてみよう！',
    'もうすこし！にているもんだいをまえにやったことない？おもいだしてみよう！',
  ],
};

/**
 * ヒントを生成する関数
 * Netlify Function（/api/hint）経由でClaude APIを呼び出す
 * APIが使えない場合はフォールバックの仮ヒントを返す
 *
 * @param {string} subject - 教科名
 * @param {string} question - 問題の内容（テキスト）
 * @param {string} thinking - 子供がどこまで考えたか
 * @param {number} hintLevel - ヒントのレベル（0から始まる）
 * @param {string|null} photo - 写真のBase64データURL（あれば）
 * @returns {Promise<string>} ヒントの文字列
 */
export async function generateHint(subject, question, thinking, hintLevel, photo = null) {
  try {
    const response = await fetch('/api/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, question, thinking, hintLevel, photo }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.hint;
  } catch (error) {
    console.warn('AI API unavailable, using fallback hints:', error.message);
    return getFallbackHint(subject, hintLevel);
  }
}

function getFallbackHint(subject, hintLevel) {
  const hints = FALLBACK_HINTS[subject] || FALLBACK_HINTS['そのほか'];
  const clampedLevel = Math.min(hintLevel, hints.length - 1);
  return hints[clampedLevel];
}
