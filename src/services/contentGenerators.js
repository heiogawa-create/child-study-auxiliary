// こくご・りか・しゃかいの問題生成。
// データは src/data/ の各バンクに置き、ここでは選択問題への変換だけを行う。

import {
  KANJI_WORDS,
  KATAKANA_WORDS,
  ROMAJI_WORDS,
  ANTONYM_G1,
  PARTICLE_G1,
  VOCAB_G2,
  SUBJECT_PREDICATE_G2,
  KOTOWAZA_G3,
  JUKUGO_G4,
  JUKUGO_CATEGORIES,
  IDIOM_G4,
  KEIGO_G5,
  WORD_ORIGIN_G5,
  YOJIJUKUGO_G6,
  SYNONYM_G6,
} from '../data/kokugoBank';
import { RIKA_BANKS } from '../data/rikaBank';
import { SHAKAI_BANKS, PREFECTURES, LANDLOCKED_PREFECTURES } from '../data/shakaiBank';

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(items) {
  return items[randInt(0, items.length - 1)];
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function choiceQuestion(unitLabel, prompt, answer, distractors, hints, explanation = '') {
  const normalizedAnswer = String(answer);
  const uniqueDistractors = [...new Set(distractors.map(String))]
    .filter((choice) => choice !== normalizedAnswer);
  const choices = shuffle([normalizedAnswer, ...shuffle(uniqueDistractors).slice(0, 3)]);
  return {
    kind: 'choice',
    unitLabel,
    prompt,
    answer: normalizedAnswer,
    choices,
    visual: null,
    explanation,
    hints,
  };
}

const FACT_HINTS = [
  '問題文の キーワードに 注目しよう。',
  'あきらかに ちがう 選択肢を 先に けしてみよう。',
  '教科書や 授業で 習ったことを 思い出してみよう。',
];

const KANJI_READ_HINTS = [
  '一文字ずつ ゆっくり 見てみよう。',
  'その漢字を つかう 別の ことばを 思いうかべてみよう。',
  '文の 中で つかうと どう 読むかな。',
];

const KANJI_WRITE_HINTS = [
  'ことばの 意味を 思いうかべてみよう。',
  '漢字の 部首（へんや つくり）に 注目しよう。',
  'にた形の 漢字と くらべて たしかめよう。',
];

// バンク（[問題, 正解, 誤答...] の配列）から1問つくる
function bankGenerator(label, rows, hints = FACT_HINTS) {
  return () => {
    const [prompt, answer, ...wrong] = pick(rows);
    return choiceQuestion(label, prompt, answer, wrong, hints);
  };
}

// 漢字の読み：他の言葉の読みを誤答にする
function kanjiReadGenerator(label, entries) {
  return () => {
    const [word, reading] = pick(entries);
    const distractors = shuffle(entries)
      .map((entry) => entry[1])
      .filter((candidate) => candidate !== reading);
    return choiceQuestion(label, `「${word}」は なんと 読むかな？`, reading, distractors, KANJI_READ_HINTS);
  };
}

// 漢字の書き：他の言葉の漢字を誤答にする
function kanjiWriteGenerator(label, entries) {
  return () => {
    const [word, reading] = pick(entries);
    const distractors = shuffle(entries)
      .filter((entry) => entry[1] !== reading)
      .map((entry) => entry[0]);
    return choiceQuestion(label, `「${reading}」を 漢字で 書くと どれかな？`, word, distractors, KANJI_WRITE_HINTS);
  };
}

// カタカナのまちがい表記をつくる（形の似た文字・小さい字・のばす音）
const KATAKANA_CONFUSIONS = [
  ['ン', 'ソ'], ['ソ', 'ン'], ['シ', 'ツ'], ['ツ', 'シ'],
  ['ッ', 'ツ'], ['ャ', 'ヤ'], ['ュ', 'ユ'], ['ョ', 'ヨ'],
  ['ァ', 'ア'], ['ィ', 'イ'], ['ゥ', 'ウ'], ['ェ', 'エ'], ['ォ', 'オ'],
];

function mutateKatakana(word) {
  const results = new Set();
  for (const [from, to] of KATAKANA_CONFUSIONS) {
    const index = word.indexOf(from);
    if (index >= 0) {
      results.add(word.slice(0, index) + to + word.slice(index + from.length));
    }
  }
  if (word.includes('ー')) {
    results.add(word.replace('ー', ''));
  } else if (word.length >= 2) {
    results.add(`${word}ー`);
  }
  // 文字の入れかえでも誤答をつくる
  if (word.length >= 2) {
    const i = randInt(0, word.length - 2);
    const swapped = word.slice(0, i) + word[i + 1] + word[i] + word.slice(i + 2);
    results.add(swapped);
  }
  results.delete(word);
  return [...results];
}

function kanaGenerator(label) {
  return () => {
    const [hiragana, katakana] = pick(KATAKANA_WORDS);
    const mutations = shuffle(mutateKatakana(katakana));
    const others = shuffle(KATAKANA_WORDS)
      .map((entry) => entry[1])
      .filter((candidate) => candidate !== katakana);
    const distractors = [...mutations, ...others];
    return choiceQuestion(
      label,
      `「${hiragana}」を カタカナで 正しく 書いたのは どれ？`,
      katakana,
      distractors,
      ['一文字ずつ ひらがなと くらべてみよう。', '「ツ」と「シ」、「ソ」と「ン」は 形が にているよ。', 'のばす音は「ー」で 書くよ。'],
    );
  };
}

function romajiGenerator(label) {
  return () => {
    const [kana, correct, ...wrong] = pick(ROMAJI_WORDS);
    const others = shuffle(ROMAJI_WORDS)
      .map((entry) => entry[1])
      .filter((candidate) => candidate !== correct);
    return choiceQuestion(
      label,
      `「${kana}」を ローマ字で 書くと どれかな？`,
      correct,
      [...wrong, ...others],
      ['ローマ字の 表を 思い出そう。', '一音ずつ く切って 考えよう（ね・こ → ne・ko）。', '声に 出して 読んで たしかめよう。'],
    );
  };
}

function antonymGenerator(label) {
  return () => {
    const [word, opposite] = pick(ANTONYM_G1);
    const reversed = Math.random() < 0.5;
    const questionWord = reversed ? opposite : word;
    const answer = reversed ? word : opposite;
    const distractors = shuffle(ANTONYM_G1)
      .map((entry) => (reversed ? entry[0] : entry[1]))
      .filter((candidate) => candidate !== answer && candidate !== questionWord);
    return choiceQuestion(
      label,
      `「${questionWord}」の はんたいの ことばは どれ？`,
      answer,
      distractors,
      ['ことばの いみを 思いうかべよう。', 'それぞれの ことばを 絵に してみよう。', 'ぎゃくの ようすを あらわす ことばを さがそう。'],
    );
  };
}

function particleGenerator(label) {
  return () => {
    const [sentence, answer] = pick(PARTICLE_G1);
    return choiceQuestion(
      label,
      `（　）に 入る ことばは どれ？　${sentence}`,
      answer,
      ['は', 'を', 'へ'],
      ['声に 出して 読んで たしかめよう。', '「どこへ 行く」の ときは「へ」だよ。', '「なにを する」の ときは「を」だよ。'],
    );
  };
}

function jukugoGenerator(label) {
  return () => {
    const [word, category] = pick(JUKUGO_G4);
    return choiceQuestion(
      label,
      `「${word}」は どんな 組み立ての 熟語かな？`,
      category,
      JUKUGO_CATEGORIES.filter((candidate) => candidate !== category),
      ['一字ずつの 意味を 考えよう。', '2つの 字の 意味が にているか 反対か たしかめよう。', '「〜を〜する」と 読めるか ためしてみよう。'],
    );
  };
}

function wordOriginGenerator(label) {
  return () => {
    const [word, category] = pick(WORD_ORIGIN_G5);
    return choiceQuestion(
      label,
      `「${word}」は 和語・漢語・外来語の どれかな？`,
      category,
      ['和語', '漢語', '外来語'].filter((candidate) => candidate !== category),
      ['カタカナで 書く ことばは 外来語が 多いよ。', '音読みの 熟語は 漢語が 多いよ。', 'むかしから 日本に ある ことばは 和語だよ。'],
    );
  };
}

// 都道府県：データから複数の形式で出題する
function samePrefCityName([name, capital]) {
  return capital.startsWith(name.replace(/[都道府県]$/, ''));
}

const CAPITAL_QUIZ_PREFS = PREFECTURES.filter((row) => !samePrefCityName(row));
const REGIONS = [...new Set(PREFECTURES.map((row) => row[2]))];
const COASTAL_PREFS = PREFECTURES
  .map((row) => row[0])
  .filter((name) => !LANDLOCKED_PREFECTURES.includes(name));

function prefectureGenerator(label) {
  const hints = [
    '日本地図を 思いうかべてみよう。',
    'その 都道府県の 有名な ものを 思い出そう。',
    '地方ごとに まとめて おぼえると わかりやすいよ。',
  ];
  return () => {
    const mode = randInt(0, 3);
    if (mode === 0) {
      const [name, capital] = pick(CAPITAL_QUIZ_PREFS);
      const distractors = shuffle(CAPITAL_QUIZ_PREFS)
        .map((row) => row[1])
        .filter((candidate) => candidate !== capital);
      const officeName = name === '北海道' ? '道庁所在地' : '県庁所在地';
      return choiceQuestion(label, `${name}の ${officeName}は どこかな？`, capital, distractors, hints);
    }
    if (mode === 1) {
      const [name, capital, region] = pick(CAPITAL_QUIZ_PREFS);
      const sameRegion = CAPITAL_QUIZ_PREFS.filter((row) => row[0] !== name && row[2] === region);
      const distractors = shuffle([...sameRegion, ...shuffle(PREFECTURES)])
        .map((row) => row[0])
        .filter((candidate) => candidate !== name);
      return choiceQuestion(label, `${capital}は どこの 都道府県の 県庁所在地かな？`, name, distractors, hints);
    }
    if (mode === 2) {
      const [name, , region] = pick(PREFECTURES);
      const distractors = REGIONS.filter((candidate) => candidate !== region);
      return choiceQuestion(label, `${name}は 何地方に あるかな？`, region, distractors, hints);
    }
    const answer = pick(LANDLOCKED_PREFECTURES);
    const distractors = shuffle(COASTAL_PREFS);
    return choiceQuestion(
      label,
      '次のうち、海に 面していない 県は どれかな？',
      answer,
      distractors,
      ['日本地図で 海に 接しているか 見てみよう。', '内陸の 県は 全部で 8つ あるよ。', '山に かこまれた 県を 思いうかべよう。'],
    );
  };
}

export const CONTENT_GENERATORS = {
  // こくご
  jp1KanjiRead: kanjiReadGenerator('かん字の よみかた', KANJI_WORDS.g1),
  jp1KanjiWrite: kanjiWriteGenerator('かん字の かきかた', KANJI_WORDS.g1),
  jp1Kana: kanaGenerator('ひらがなと カタカナ'),
  jp1Antonym: antonymGenerator('はんたいの ことば'),
  jp1Particle: particleGenerator('「は・を・へ」の つかいかた'),
  jp2KanjiRead: kanjiReadGenerator('かん字の 読みかた', KANJI_WORDS.g2),
  jp2KanjiWrite: kanjiWriteGenerator('かん字の 書きかた', KANJI_WORDS.g2),
  jp2Vocab: bankGenerator('はんたいことば・にたことば', VOCAB_G2),
  jp2SubjectPredicate: bankGenerator('しゅごと じゅつご', SUBJECT_PREDICATE_G2, [
    '「だれが」「なにが」に あたる ことばが しゅごだよ。',
    '「どうする」「どんなだ」に あたる ことばが じゅつごだよ。',
    '文を 声に 出して 読んでみよう。',
  ]),
  jp3KanjiRead: kanjiReadGenerator('漢字の 読み方', KANJI_WORDS.g3),
  jp3KanjiWrite: kanjiWriteGenerator('漢字の 書き方', KANJI_WORDS.g3),
  jp3Romaji: romajiGenerator('ローマ字'),
  jp3Kotowaza: bankGenerator('ことわざ・慣用句', KOTOWAZA_G3),
  jp4KanjiRead: kanjiReadGenerator('漢字の 読み方', KANJI_WORDS.g4),
  jp4KanjiWrite: kanjiWriteGenerator('漢字の 書き方', KANJI_WORDS.g4),
  jp4Jukugo: jukugoGenerator('熟語の 組み立て'),
  jp4Idiom: bankGenerator('慣用句・ことわざ', IDIOM_G4),
  jp5KanjiRead: kanjiReadGenerator('漢字の 読み方', KANJI_WORDS.g5),
  jp5KanjiWrite: kanjiWriteGenerator('漢字の 書き方', KANJI_WORDS.g5),
  jp5Keigo: bankGenerator('敬語', KEIGO_G5, [
    '相手の 動作なら 尊敬語、自分の 動作なら けんじょう語だよ。',
    '「です・ます」は ていねい語だよ。',
    'その 言い方を 先生に つかったら 失礼か 考えてみよう。',
  ]),
  jp5WordOrigin: wordOriginGenerator('和語・漢語・外来語'),
  jp6KanjiRead: kanjiReadGenerator('漢字の 読み方', KANJI_WORDS.g6),
  jp6KanjiWrite: kanjiWriteGenerator('漢字の 書き方', KANJI_WORDS.g6),
  jp6Yojijukugo: bankGenerator('四字熟語', YOJIJUKUGO_G6),
  jp6Synonym: bankGenerator('類義語と 対義語', SYNONYM_G6),

  // りか
  sci3Insects: bankGenerator('こん虫と しょくぶつ', RIKA_BANKS.sci3Insects),
  sci3Sun: bankGenerator('かげと 太陽・光', RIKA_BANKS.sci3Sun),
  sci3Magnet: bankGenerator('じしゃくと 電気', RIKA_BANKS.sci3Magnet),
  sci3Force: bankGenerator('風とゴムの力・音・重さ', RIKA_BANKS.sci3Force),
  sci4Seasons: bankGenerator('季節と 生き物', RIKA_BANKS.sci4Seasons),
  sci4Electric: bankGenerator('電気の はたらき', RIKA_BANKS.sci4Electric),
  sci4MoonStars: bankGenerator('月と 星', RIKA_BANKS.sci4MoonStars),
  sci4Matter: bankGenerator('ものの温度と 水のすがた', RIKA_BANKS.sci4Matter),
  sci5Plants: bankGenerator('植物の 発芽と成長', RIKA_BANKS.sci5Plants),
  sci5Life: bankGenerator('メダカと 人のたんじょう', RIKA_BANKS.sci5Life),
  sci5Weather: bankGenerator('天気の変化と 流れる水', RIKA_BANKS.sci5Weather),
  sci5Solution: bankGenerator('もののとけ方・ふりこ・電磁石', RIKA_BANKS.sci5Solution),
  sci6Burning: bankGenerator('ものの 燃え方', RIKA_BANKS.sci6Burning),
  sci6HumanBody: bankGenerator('人の体の つくりとはたらき', RIKA_BANKS.sci6HumanBody),
  sci6EarthSpace: bankGenerator('月と太陽・大地のつくり', RIKA_BANKS.sci6EarthSpace),
  sci6Chemistry: bankGenerator('水よう液・てこ・電気の利用', RIKA_BANKS.sci6Chemistry),

  // しゃかい
  soc3Map: bankGenerator('まちのようすと 地図記号', SHAKAI_BANKS.soc3Map),
  soc3Work: bankGenerator('はたらく人と お店・農家', SHAKAI_BANKS.soc3Work),
  soc3Safety: bankGenerator('くらしを守る', SHAKAI_BANKS.soc3Safety),
  soc3Old: bankGenerator('昔の道具と くらし', SHAKAI_BANKS.soc3Old),
  soc4Prefectures: prefectureGenerator('都道府県と 日本地図'),
  soc4Water: bankGenerator('水・ごみと くらし', SHAKAI_BANKS.soc4Water),
  soc4Disaster: bankGenerator('自然災害に そなえる', SHAKAI_BANKS.soc4Disaster),
  soc4Tradition: bankGenerator('地いきの伝統と 発てん', SHAKAI_BANKS.soc4Tradition),
  soc5Land: bankGenerator('日本の国土と 気候', SHAKAI_BANKS.soc5Land),
  soc5Food: bankGenerator('米づくりと 水産業', SHAKAI_BANKS.soc5Food),
  soc5Industry: bankGenerator('工業生産と 貿易', SHAKAI_BANKS.soc5Industry),
  soc5Info: bankGenerator('情報と 環境', SHAKAI_BANKS.soc5Info),
  soc6Politics: bankGenerator('憲法と 政治', SHAKAI_BANKS.soc6Politics),
  soc6History1: bankGenerator('歴史①（縄文〜室町）', SHAKAI_BANKS.soc6History1),
  soc6History2: bankGenerator('歴史②（戦国〜江戸）', SHAKAI_BANKS.soc6History2),
  soc6History3: bankGenerator('歴史③（明治〜現代）', SHAKAI_BANKS.soc6History3),
  soc6World: bankGenerator('世界の中の 日本', SHAKAI_BANKS.soc6World),
};
