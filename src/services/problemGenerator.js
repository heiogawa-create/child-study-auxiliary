// 小学1〜6年生の算数ドリル問題をローカルで生成・採点する。
// 同じ単元を開き直すたびに数値と出題形式が変わるため、継続して反復できる。

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

function clean(value, digits = 6) {
  return Number(Number(value).toFixed(digits));
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

function fraction(numerator, denominator) {
  const divisor = gcd(numerator, denominator);
  const n = numerator / divisor;
  const d = denominator / divisor;
  return d === 1 ? `${n}` : `${n}/${d}`;
}

function numberHints(label) {
  return [
    `${label}で つかう きまりを おもいだそう。`,
    'わかっている数を、式や図にしてみよう。',
    '計算したあと、もとの問題にあうか たしかめよう。',
  ];
}

function choiceHints(label) {
  return [
    `${label}の ことばの意味を ひとつずつ たしかめよう。`,
    'あてはまらないものを 先にけしてみよう。',
    '図や具体的な数に おきかえて考えてみよう。',
  ];
}

function numberQuestion(unitLabel, prompt, answer, options = {}) {
  return {
    kind: 'number',
    unitLabel,
    prompt,
    answer: clean(answer),
    visual: options.visual || null,
    answerSuffix: options.answerSuffix || '',
    explanation: options.explanation || '',
    hints: options.hints || numberHints(unitLabel),
  };
}

function choiceQuestion(unitLabel, prompt, answer, choices, options = {}) {
  const normalizedAnswer = String(answer);
  const distractors = [...new Set(choices.map(String).filter((choice) => choice !== normalizedAnswer))];
  const normalizedChoices = shuffle([normalizedAnswer, ...shuffle(distractors).slice(0, 3)]);
  return {
    kind: 'choice',
    unitLabel,
    prompt,
    answer: normalizedAnswer,
    choices: normalizedChoices,
    visual: options.visual || null,
    explanation: options.explanation || '',
    hints: options.hints || choiceHints(unitLabel),
  };
}

function numericChoices(answer, step = 1) {
  const values = [answer, clean(answer + step), clean(answer - step), clean(answer + step * 2)];
  return [...new Set(values.filter((value) => value >= 0).map(String))];
}

const COUNT_EMOJI = ['🍎', '🍓', '⭐', '🎈', '🐟', '🍩', '🌷', '🐞'];

function genCount(max = 10) {
  const count = randInt(1, max);
  return numberQuestion('かずを かぞえる', 'いくつ ありますか？', count, {
    visual: { type: 'count', emoji: pick(COUNT_EMOJI), count },
    hints: ['ひとつずつ ゆびで おいながら かぞえよう。', '5こずつに わけると かぞえやすいよ。', 'さいごに もういちど たしかめよう。'],
  });
}

function genSequence(min, max, steps = [1, 2, 5, 10]) {
  const usableSteps = steps.filter((step) => max - min >= step * 3);
  const step = pick(usableSteps.length ? usableSteps : [1]);
  const start = randInt(min, max - step * 3);
  const seq = [start, start + step, start + step * 2, start + step * 3];
  const blankIndex = randInt(0, 3);
  return numberQuestion('かずの ならび', '□に あう かずを かいてね。', seq[blankIndex], {
    visual: { type: 'sequence', seq, blankIndex },
    hints: ['となりの数が いくつずつ かわるか 見よう。', '右へいくと たすのかな、ひくのかな。', 'わかるところから じゅんに たどろう。'],
  });
}

function genComparison(min, max, label = '数の 大小') {
  const a = randInt(min, max);
  const b = Math.random() < 0.15 ? a : randInt(min, max);
  const answer = a === b ? '＝' : a > b ? '＞' : '＜';
  return choiceQuestion(label, `${a} □ ${b}　□に入る きごうは？`, answer, ['＞', '＜', '＝'], {
    hints: ['左と右の数を それぞれ よく見よう。', '大きいほうに きごうの口がひらくよ。', '同じ大きさなら「＝」だよ。'],
  });
}

function genPlaceValue(min, max, placeValues, label = '位取り') {
  const value = randInt(min, max);
  const [placeName, placeValue] = pick(placeValues.filter(([, place]) => place <= max));
  const digit = Math.floor(value / placeValue) % 10;
  return numberQuestion(label, `${value.toLocaleString('ja-JP')} の ${placeName}の数字は？`, digit, {
    explanation: `${placeName}は右から ${Math.log10(placeValue) + 1}けためです。`,
  });
}

function genAddition(maxSum, options = {}) {
  const min = options.min || 0;
  let a;
  let b;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    a = randInt(min, Math.max(min, maxSum - 1));
    b = randInt(options.allowZero ? 0 : 1, Math.max(1, maxSum - a));
    const carry = (a % 10) + (b % 10) >= 10;
    if (options.forceCarry == null || carry === options.forceCarry) break;
  }
  return numberQuestion(options.label || 'たし算', `${a} ＋ ${b} ＝ ？`, a + b);
}

function genSubtraction(maxValue, options = {}) {
  let a;
  let b;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    a = randInt(options.minValue || 2, maxValue);
    b = randInt(options.allowZero ? 0 : 1, a);
    const borrow = (a % 10) < (b % 10);
    if (options.forceBorrow == null || borrow === options.forceBorrow) break;
  }
  return numberQuestion(options.label || 'ひき算', `${a} － ${b} ＝ ？`, a - b);
}

function genIntegerAddSub(minOperand, maxOperand, label = 'たし算・ひき算') {
  const a = randInt(minOperand, maxOperand);
  const b = randInt(minOperand, maxOperand);
  if (Math.random() < 0.5) return numberQuestion(label, `${a} ＋ ${b} ＝ ？`, a + b);
  const larger = Math.max(a, b);
  const smaller = Math.min(a, b);
  return numberQuestion(label, `${larger} － ${smaller} ＝ ？`, larger - smaller);
}

function genMissingNumber(max = 20, operation = 'add') {
  if (operation === 'add') {
    const a = randInt(1, max - 1);
    const b = randInt(1, max - a);
    return numberQuestion('□に入る数', `${a} ＋ □ ＝ ${a + b}`, b);
  }
  const whole = randInt(2, max);
  const part = randInt(1, whole);
  return numberQuestion('□に入る数', `${whole} － □ ＝ ${whole - part}`, part);
}

function genMakeTen() {
  const part = randInt(1, 9);
  return numberQuestion('数の分け方', `10は ${part}と いくつ？`, 10 - part);
}

function genMissingMultiplication() {
  const a = randInt(1, 9);
  const b = randInt(1, 9);
  return numberQuestion('九九の□', `${a} × □ ＝ ${a * b}`, b);
}

function genMultiplication(aMin, aMax, bMin, bMax, label = 'かけ算') {
  const a = randInt(aMin, aMax);
  const b = randInt(bMin, bMax);
  return numberQuestion(label, `${a} × ${b} ＝ ？`, a * b);
}

function genDivision(divisorMin, divisorMax, quotientMin, quotientMax, allowRemainder = false, label = 'わり算') {
  const divisor = randInt(divisorMin, divisorMax);
  const quotient = randInt(quotientMin, quotientMax);
  const remainder = allowRemainder ? randInt(0, divisor - 1) : 0;
  const dividend = divisor * quotient + remainder;
  if (allowRemainder) {
    return choiceQuestion(label, `${dividend} ÷ ${divisor} の 商とあまりは？`, `${quotient} あまり ${remainder}`, [
      `${quotient + 1} あまり ${remainder}`,
      `${quotient} あまり ${Math.min(divisor - 1, remainder + 1)}`,
      `${Math.max(0, quotient - 1)} あまり ${remainder}`,
    ]);
  }
  return numberQuestion(label, `${dividend} ÷ ${divisor} ＝ ？`, quotient);
}

function genDecimalAddSub(maxWhole = 20, digits = 1) {
  const scale = 10 ** digits;
  const a = randInt(1, maxWhole * scale) / scale;
  const b = randInt(1, maxWhole * scale) / scale;
  if (Math.random() < 0.5) return numberQuestion('小数の計算', `${a} ＋ ${b} ＝ ？`, clean(a + b));
  const larger = Math.max(a, b);
  const smaller = Math.min(a, b);
  return numberQuestion('小数の計算', `${larger} － ${smaller} ＝ ？`, clean(larger - smaller));
}

function genFractionSameDenominator(maxDenominator = 12, operation = pick(['add', 'sub'])) {
  const denominator = randInt(2, maxDenominator);
  let a = randInt(1, denominator - 1);
  let b = randInt(1, denominator - 1);
  if (operation === 'sub' && b > a) [a, b] = [b, a];
  const result = operation === 'add' ? fraction(a + b, denominator) : fraction(a - b, denominator);
  const sign = operation === 'add' ? '＋' : '－';
  return choiceQuestion('分数の計算', `${a}/${denominator} ${sign} ${b}/${denominator} ＝ ？`, result, [
    fraction(Math.abs(a + (operation === 'add' ? b : -b)) + 1, denominator),
    fraction(Math.max(0, Math.abs(a + (operation === 'add' ? b : -b)) - 1), denominator),
    fraction(Math.abs(a + (operation === 'add' ? b : -b)), denominator + 1),
  ]);
}

function genFractionDifferentDenominator(operation = pick(['add', 'sub'])) {
  let d1 = pick([2, 3, 4, 5, 6, 8, 10]);
  let d2 = pick([2, 3, 4, 5, 6, 8, 10]);
  if (d1 === d2) d2 = d2 === 10 ? 5 : d2 + 1;
  let n1 = randInt(1, d1 - 1);
  let n2 = randInt(1, d2 - 1);
  if (operation === 'sub' && n1 / d1 < n2 / d2) {
    [n1, n2] = [n2, n1];
    [d1, d2] = [d2, d1];
  }
  const common = lcm(d1, d2);
  const resultNumerator = n1 * (common / d1) + (operation === 'add' ? 1 : -1) * n2 * (common / d2);
  const result = fraction(resultNumerator, common);
  const sign = operation === 'add' ? '＋' : '－';
  return choiceQuestion('分数の計算', `${n1}/${d1} ${sign} ${n2}/${d2} ＝ ？`, result, [
    fraction(Math.abs(n1 + (operation === 'add' ? n2 : -n2)), d1 + d2),
    fraction(Math.abs(resultNumerator) + 1, common),
    fraction(Math.max(0, Math.abs(resultNumerator) - 1), common),
  ]);
}

function genClock(minutes = [0, 30]) {
  const hour = randInt(1, 12);
  const minute = pick(minutes);
  return {
    kind: 'clock',
    unitLabel: 'とけい',
    prompt: 'なんじ なんぷん ですか？',
    visual: { type: 'clock', hour, minute },
    answer: { hour, minute },
    explanation: '',
    hints: ['みじかいはりで「なんじ」か見よう。', 'ながいはりは、1の数字で5ふん すすむよ。', 'みじかいはりが数字のあいだなら、まだ前の時こくだよ。'],
  };
}

function genElapsedTime(maxMinutes = 120) {
  const startHour = randInt(7, 18);
  const startMinute = pick([0, 10, 15, 20, 30, 40, 45, 50]);
  const duration = pick([10, 15, 20, 30, 40, 45, 60, 75, 90].filter((n) => n <= maxMinutes));
  const total = startHour * 60 + startMinute + duration;
  const endHour = Math.floor(total / 60);
  const endMinute = total % 60;
  return numberQuestion('時間の長さ', `${startHour}時${String(startMinute).padStart(2, '0')}分から ${endHour}時${String(endMinute).padStart(2, '0')}分まで、何分ですか？`, duration, { answerSuffix: '分' });
}

function genMinutesToSeconds() {
  const minutes = randInt(2, 10);
  return numberQuestion('時間の単位', `${minutes}分は 何秒？`, minutes * 60, { answerSuffix: '秒' });
}

function genSimpleWordProblem(max = 100, operations = ['add', 'sub']) {
  const operation = pick(operations);
  if (operation === 'mul') {
    const each = randInt(2, Math.min(12, max));
    const groups = randInt(2, 9);
    return numberQuestion('文章問題', `1ふくろに あめが ${each}こずつ 入っています。${groups}ふくろでは 何こですか？`, each * groups, { answerSuffix: 'こ' });
  }
  if (operation === 'div') {
    const divisor = randInt(2, 9);
    const quotient = randInt(2, 12);
    return numberQuestion('文章問題', `${divisor * quotient}まいの カードを ${divisor}人で 同じ数ずつ分けます。1人ぶんは 何まいですか？`, quotient, { answerSuffix: 'まい' });
  }
  if (operation === 'add') {
    const a = randInt(2, Math.max(2, max - 2));
    const b = randInt(1, Math.max(1, max - a));
    return numberQuestion('文章問題', `本が ${a}さつ あります。あとから ${b}さつ ふえました。ぜんぶで 何さつですか？`, a + b, { answerSuffix: 'さつ' });
  }
  const a = randInt(2, max);
  const b = randInt(1, a);
  return numberQuestion('文章問題', `どんぐりが ${a}こ あります。${b}こ つかいました。のこりは 何こですか？`, a - b, { answerSuffix: 'こ' });
}

function genUnitConversion(conversions, label) {
  const item = pick(conversions);
  const multiplier = randInt(1, item.maxMultiplier || 9);
  const source = item.source * multiplier;
  const answer = item.target * multiplier;
  return numberQuestion(label, `${source}${item.from} ＝ 何${item.to}？`, answer, { answerSuffix: item.to });
}

function genBarData(label = 'グラフの読み取り', line = false) {
  const names = line ? ['月', '火', '水', '木'] : shuffle(['赤', '青', '黄', '緑']).slice(0, 4);
  const values = names.map(() => randInt(2, 12));
  const maxIndex = values.indexOf(Math.max(...values));
  const minIndex = values.indexOf(Math.min(...values));
  const visual = { type: line ? 'lineChart' : 'barChart', bars: names.map((name, index) => ({ label: name, value: values[index] })) };
  if (Math.random() < 0.5) {
    return choiceQuestion(label, 'いちばん 数が多いのは どれですか？', names[maxIndex], names, { visual });
  }
  return numberQuestion(label, `いちばん多いものと 少ないものの差は いくつですか？`, values[maxIndex] - values[minIndex], { visual });
}

function genTableData() {
  const a = randInt(3, 12);
  const b = randInt(3, 12);
  const c = randInt(3, 12);
  const d = randInt(3, 12);
  const visual = {
    type: 'table',
    headers: ['しゅるい', '男', '女'],
    rows: [['犬がすき', a, b], ['ねこがすき', c, d]],
  };
  if (Math.random() < 0.5) return numberQuestion('表の読み取り', '犬がすきな人は、ぜんぶで何人ですか？', a + b, { answerSuffix: '人', visual });
  return numberQuestion('表の読み取り', 'ねこがすきな女の人は、何人ですか？', d, { answerSuffix: '人', visual });
}

const SHAPE_QUESTIONS_G1 = [
  ['まっすぐな辺が3本ある かたちは？', 'さんかく', ['まる', 'しかく', 'さんかく']],
  ['まっすぐな辺が4本ある かたちは？', 'しかく', ['まる', 'しかく', 'さんかく']],
  ['ころがりやすく、かどがない かたちは？', 'まる', ['まる', 'しかく', 'さんかく']],
  ['つつのような かたちは？', 'えんちゅう', ['はこ', 'たま', 'えんちゅう']],
  ['どこから見ても まるい かたちは？', 'たま', ['はこ', 'たま', 'えんちゅう']],
];

const SHAPE_QUESTIONS_G2 = [
  ['4つの角が ぜんぶ直角で、4つの辺が同じ図形は？', '正方形', ['正方形', '長方形', '三角形']],
  ['4つの角が ぜんぶ直角の四角形は？', '長方形', ['台形', '長方形', '二等辺三角形']],
  ['直角が1つある三角形は？', '直角三角形', ['正三角形', '直角三角形', '四角形']],
  ['三角形の辺は何本？', '3本', ['2本', '3本', '4本']],
  ['四角形の頂点は何こ？', '4こ', ['3こ', '4こ', '5こ']],
];

function genConcept(label, pool) {
  const [prompt, answer, choices] = pick(pool);
  return choiceQuestion(label, prompt, answer, choices);
}

function genPosition() {
  const items = shuffle(['🚗', '🚌', '🚲', '🚒', '🚕']);
  const index = randInt(0, items.length - 1);
  return choiceQuestion('ものの いち', `ひだりから ${index + 1}ばんめは どれ？`, items[index], items, {
    visual: { type: 'itemRow', items },
    hints: ['ひだりのはしを 見つけよう。', 'ひだりから「1、2、3…」と数えよう。', 'えらんだものの前に いくつあるか たしかめよう。'],
  });
}

function genCompareBars() {
  const values = [randInt(3, 10), randInt(3, 10), randInt(3, 10)];
  const labels = ['あか', 'あお', 'きいろ'];
  const maxIndex = values.indexOf(Math.max(...values));
  return choiceQuestion('おおきさくらべ', 'いちばん ながいのは どれ？', labels[maxIndex], labels, {
    visual: { type: 'lengthBars', bars: labels.map((label, index) => ({ label, value: values[index] })) },
  });
}

function genPictograph() {
  const labels = ['りんご', 'みかん', 'いちご'];
  const emojis = ['🍎', '🍊', '🍓'];
  const values = labels.map(() => randInt(1, 8));
  const maxIndex = values.indexOf(Math.max(...values));
  const visual = { type: 'pictograph', items: labels.map((label, index) => ({ label, emoji: emojis[index], count: values[index] })) };
  if (Math.random() < 0.5) return choiceQuestion('かずしらべ', 'いちばん おおいのは どれ？', labels[maxIndex], labels, { visual });
  const index = randInt(0, 2);
  return numberQuestion('かずしらべ', `${labels[index]}は いくつ ありますか？`, values[index], { visual });
}

function genMultiplicationMeaning() {
  const each = randInt(2, 9);
  const groups = randInt(2, 6);
  if (Math.random() < 0.5) return numberQuestion('かけ算の いみ', `${each}こずつの まとまりが ${groups}こ。ぜんぶで 何こ？`, each * groups, { answerSuffix: 'こ' });
  return choiceQuestion('かけ算の いみ', `${each} ＋ ${each} ＋ ${each} を かけ算で表すと？`, `${each}×3`, [`3×${each}`, `${each}+3`, `${each}×${each}`]);
}

function genUnitFraction(maxDenominator = 8) {
  const denominator = randInt(2, maxDenominator);
  return choiceQuestion('分数の いみ', `同じ大きさに ${denominator}こに分けた 1こ分は？`, `1/${denominator}`, [`${denominator}/1`, `1/${denominator + 1}`, `${Math.max(1, denominator - 1)}/${denominator}`]);
}

function genRemainderWordProblem() {
  const seats = randInt(3, 8);
  const quotient = randInt(2, 9);
  const remainder = randInt(1, seats - 1);
  const people = seats * quotient + remainder;
  return numberQuestion('あまりのある文章問題', `${people}人が、1台に ${seats}人ずつ 車に乗ります。車は少なくとも何台いりますか？`, quotient + 1, { answerSuffix: '台' });
}

function genDecimalComparison() {
  const a = randInt(1, 99) / 10;
  const b = randInt(1, 99) / 10;
  const answer = a === b ? '＝' : a > b ? '＞' : '＜';
  return choiceQuestion('小数の 大小', `${a} □ ${b}`, answer, ['＞', '＜', '＝']);
}

function genFractionComparison() {
  const denominator = randInt(3, 12);
  const a = randInt(1, denominator - 1);
  const b = randInt(1, denominator - 1);
  const answer = a === b ? '＝' : a > b ? '＞' : '＜';
  return choiceQuestion('分数の 大小', `${a}/${denominator} □ ${b}/${denominator}`, answer, ['＞', '＜', '＝']);
}

function genMetricConversion(kind) {
  const tables = {
    length2: [
      { source: 1, from: 'cm', target: 10, to: 'mm' },
      { source: 1, from: 'm', target: 100, to: 'cm', maxMultiplier: 5 },
    ],
    volume2: [
      { source: 1, from: 'L', target: 10, to: 'dL', maxMultiplier: 8 },
      { source: 1, from: 'dL', target: 100, to: 'mL', maxMultiplier: 8 },
      { source: 1, from: 'L', target: 1000, to: 'mL', maxMultiplier: 5 },
    ],
    length3: [{ source: 1, from: 'km', target: 1000, to: 'm', maxMultiplier: 9 }],
    weight3: [
      { source: 1, from: 'kg', target: 1000, to: 'g', maxMultiplier: 9 },
      { source: 1, from: 't', target: 1000, to: 'kg', maxMultiplier: 5 },
    ],
  };
  return genUnitConversion(tables[kind], '単位の へんかん');
}

function genTriangleConcept() {
  return genConcept('三角形と角', [
    ['3つの辺の長さがすべて同じ三角形は？', '正三角形', ['正三角形', '二等辺三角形', '直角三角形']],
    ['2つの辺の長さが同じ三角形は？', '二等辺三角形', ['正方形', '二等辺三角形', '台形']],
    ['正三角形の3つの角の大きさは？', 'すべて同じ', ['すべて同じ', 'すべてちがう', '1つだけ直角']],
    ['角をつくる2本の直線を何といいますか？', '辺', ['辺', '中心', '直径']],
  ]);
}

function genCircleSphere() {
  if (Math.random() < 0.5) {
    const radius = randInt(1, 20);
    return numberQuestion('円', `半径が ${radius}cmの円の直径は 何cm？`, radius * 2, { answerSuffix: 'cm' });
  }
  return genConcept('円と球', [
    ['円の中心から円周までの長さを何といいますか？', '半径', ['半径', '直径', '円周']],
    ['円の中心を通り、円周から円周まで結んだ線は？', '直径', ['半径', '直径', '弦']],
    ['球をどの向きに切っても、切り口は何になりますか？', '円', ['円', '三角形', '正方形']],
  ]);
}

function genUnknown(max = 100) {
  const operation = pick(['add', 'sub', 'mul', 'div']);
  if (operation === 'add') return genMissingNumber(max, 'add');
  if (operation === 'sub') return genMissingNumber(max, 'sub');
  const a = randInt(2, 9);
  const x = randInt(2, 12);
  if (operation === 'mul') return numberQuestion('□を使った式', `${a} × □ ＝ ${a * x}`, x);
  return numberQuestion('□を使った式', `${a * x} ÷ □ ＝ ${x}`, a);
}

function genRounding() {
  const value = randInt(100, 99999);
  const place = pick([10, 100, 1000]);
  const rounded = Math.round(value / place) * place;
  const name = place === 10 ? '十' : place === 100 ? '百' : '千';
  return numberQuestion('がい数', `${value.toLocaleString('ja-JP')} を ${name}の位までの がい数にすると？`, rounded);
}

function genDecimalMulDivInteger() {
  const integer = randInt(2, 12);
  const base = randInt(2, 99) / 10;
  if (Math.random() < 0.5) return numberQuestion('小数と整数の計算', `${base} × ${integer} ＝ ？`, clean(base * integer));
  const dividend = clean(base * integer);
  return numberQuestion('小数と整数の計算', `${dividend} ÷ ${integer} ＝ ？`, base);
}

function genAngle() {
  const mode = randInt(0, 2);
  if (mode === 0) {
    const angle = randInt(1, 17) * 10;
    return numberQuestion('角の大きさ', `一直線の角は180°です。${angle}°と あわせて180°になる角は？`, 180 - angle, { answerSuffix: '°' });
  }
  if (mode === 1) {
    const angle = randInt(1, 8) * 10;
    return numberQuestion('角の大きさ', `直角90°から ${angle}°をひくと？`, 90 - angle, { answerSuffix: '°' });
  }
  return choiceQuestion('角の大きさ', '1回転の角の大きさは？', '360°', ['90°', '180°', '270°', '360°']);
}

function genLinesConcept() {
  return genConcept('垂直と平行', [
    ['2本の直線が直角に交わる関係を何といいますか？', '垂直', ['垂直', '平行', '合同']],
    ['どこまでのばしても交わらない2本の直線は？', '平行', ['垂直', '平行', '対角線']],
    ['平行な2本の直線の間の長さは？', 'どこでも同じ', ['どこでも同じ', 'だんだん長くなる', 'だんだん短くなる']],
  ]);
}

function genQuadrilateral() {
  return genConcept('四角形', [
    ['1組の向かい合う辺が平行な四角形は？', '台形', ['台形', 'ひし形', '正方形']],
    ['2組の向かい合う辺が平行な四角形は？', '平行四辺形', ['台形', '平行四辺形', '三角形']],
    ['4つの辺の長さがすべて同じ四角形は？', 'ひし形', ['長方形', '台形', 'ひし形']],
    ['四角形で、向かい合う頂点を結ぶ線は？', '対角線', ['対角線', '直径', '半径']],
  ]);
}

function genRectangleArea() {
  const width = randInt(2, 25);
  const height = randInt(2, 20);
  if (Math.random() < 0.25) return numberQuestion('面積', `1辺が ${width}cmの正方形の面積は？`, width * width, { answerSuffix: 'cm²' });
  return numberQuestion('面積', `たて ${height}cm、横 ${width}cmの長方形の面積は？`, width * height, { answerSuffix: 'cm²' });
}

function genAreaUnits() {
  const conversion = pick([
    [1, 'm²', 10000, 'cm²'],
    [1, 'a', 100, 'm²'],
    [1, 'ha', 100, 'a'],
    [1, 'km²', 100, 'ha'],
  ]);
  const multiplier = randInt(1, 8);
  return numberQuestion('面積の単位', `${conversion[0] * multiplier}${conversion[1]} ＝ 何${conversion[3]}？`, conversion[2] * multiplier, { answerSuffix: conversion[3] });
}

function genCuboidConcept() {
  return genConcept('直方体と立方体', [
    ['直方体の面は何こ？', '6こ', ['4こ', '6こ', '8こ', '12こ']],
    ['直方体の辺は何本？', '12本', ['6本', '8本', '12本']],
    ['直方体の頂点は何こ？', '8こ', ['6こ', '8こ', '12こ']],
    ['立方体の6つの面の形は？', '正方形', ['正方形', '長方形だけ', '三角形']],
  ]);
}

function genProportionBasic(label = '変わり方') {
  const rate = randInt(2, 12);
  const x = randInt(2, 20);
  if (Math.random() < 0.5) return numberQuestion(label, `1こ ${rate}円のおかしを xこ買います。x＝${x}のとき、代金は何円？`, rate * x, { answerSuffix: '円' });
  const y = rate * x;
  return numberQuestion(label, `y＝${rate}×x です。y＝${y}のとき、xは？`, x);
}

function genTwoWayTable() {
  return genTableData();
}

function divisorsOf(value) {
  const result = [];
  for (let i = 1; i <= value; i += 1) if (value % i === 0) result.push(i);
  return result;
}

function genNumberProperties() {
  const mode = randInt(0, 3);
  if (mode === 0) {
    const value = randInt(2, 50);
    return choiceQuestion('倍数と約数', `${value}の約数は どれ？`, pick(divisorsOf(value)).toString(), numericChoices(randInt(1, value), 1));
  }
  if (mode === 1) {
    const a = randInt(2, 12);
    const b = randInt(2, 12);
    return numberQuestion('最小公倍数', `${a}と${b}の最小公倍数は？`, lcm(a, b));
  }
  if (mode === 2) {
    const a = randInt(4, 30);
    const b = randInt(4, 30);
    return numberQuestion('最大公約数', `${a}と${b}の最大公約数は？`, gcd(a, b));
  }
  const value = randInt(1, 100);
  return choiceQuestion('偶数と奇数', `${value}は偶数？ 奇数？`, value % 2 === 0 ? '偶数' : '奇数', ['偶数', '奇数']);
}

function genDecimalMultiply() {
  const a = randInt(2, 999) / 10;
  const b = randInt(2, 99) / 10;
  return numberQuestion('小数のかけ算', `${a} × ${b} ＝ ？`, clean(a * b));
}

function genDecimalDivide() {
  const divisor = randInt(2, 50) / 10;
  const quotient = randInt(2, 200) / 10;
  const dividend = clean(divisor * quotient);
  return numberQuestion('小数のわり算', `${dividend} ÷ ${divisor} ＝ ？`, quotient);
}

function genFractionEquivalent() {
  const denominator = randInt(2, 12);
  const numerator = randInt(1, denominator - 1);
  const multiplier = randInt(2, 6);
  if (Math.random() < 0.5) {
    return numberQuestion('等しい分数', `${numerator}/${denominator} ＝ ${numerator * multiplier}/□　□は？`, denominator * multiplier);
  }
  const d2 = pick([3, 4, 5, 6, 8, 10, 12]);
  const n2 = randInt(1, d2 - 1);
  const left = numerator * d2;
  const right = n2 * denominator;
  const answer = left === right ? '＝' : left > right ? '＞' : '＜';
  return choiceQuestion('分数の大小', `${numerator}/${denominator} □ ${n2}/${d2}`, answer, ['＞', '＜', '＝']);
}

function genAverage() {
  const count = randInt(3, 6);
  const average = randInt(5, 30);
  const values = [];
  let remaining = average * count;
  for (let index = 0; index < count - 1; index += 1) {
    const slotsLeft = count - index - 1;
    const min = Math.max(1, remaining - (average + 5) * slotsLeft);
    const max = Math.min(average + 5, remaining - slotsLeft);
    const value = randInt(min, Math.max(min, max));
    values.push(value);
    remaining -= value;
  }
  values.push(remaining);
  return numberQuestion('平均', `${values.join('、')} の平均は？`, average);
}

function genPerUnit() {
  const people = randInt(2, 8);
  const perPerson = randInt(3, 15);
  const total = people * perPerson;
  return numberQuestion('単位量あたり', `${total}このボールを ${people}人で同じ数ずつ分けます。1人あたり何こ？`, perPerson, { answerSuffix: 'こ' });
}

function genPercent() {
  const base = pick([100, 200, 400, 500, 800, 1000]);
  const percent = pick([5, 10, 20, 25, 40, 50, 75]);
  if (Math.random() < 0.5) return numberQuestion('割合と百分率', `${base}の ${percent}% は？`, base * percent / 100);
  const part = base * percent / 100;
  return numberQuestion('割合と百分率', `${base}のうち ${part}は 何%？`, percent, { answerSuffix: '%' });
}

function genPolygonArea() {
  const shape = pick(['triangle', 'parallelogram', 'trapezoid', 'rhombus']);
  const height = randInt(2, 15);
  if (shape === 'triangle') {
    const base = randInt(2, 20) * 2;
    return numberQuestion('三角形の面積', `底辺 ${base}cm、高さ ${height}cmの三角形の面積は？`, base * height / 2, { answerSuffix: 'cm²' });
  }
  if (shape === 'parallelogram') {
    const base = randInt(2, 20);
    return numberQuestion('平行四辺形の面積', `底辺 ${base}cm、高さ ${height}cmの平行四辺形の面積は？`, base * height, { answerSuffix: 'cm²' });
  }
  if (shape === 'trapezoid') {
    const upper = randInt(2, 10);
    const lower = randInt(upper + 1, 18);
    const evenHeight = height % 2 === 0 ? height : height + 1;
    return numberQuestion('台形の面積', `上底 ${upper}cm、下底 ${lower}cm、高さ ${evenHeight}cmの台形の面積は？`, (upper + lower) * evenHeight / 2, { answerSuffix: 'cm²' });
  }
  const d1 = randInt(2, 12) * 2;
  const d2 = randInt(2, 12);
  return numberQuestion('ひし形の面積', `対角線が ${d1}cmと ${d2}cmのひし形の面積は？`, d1 * d2 / 2, { answerSuffix: 'cm²' });
}

function genVolume() {
  const a = randInt(2, 15);
  const b = randInt(2, 12);
  const c = randInt(2, 10);
  return numberQuestion('直方体の体積', `たて ${a}cm、横 ${b}cm、高さ ${c}cmの直方体の体積は？`, a * b * c, { answerSuffix: 'cm³' });
}

function genCongruence() {
  return genConcept('合同な図形', [
    ['形も大きさも同じ2つの図形を何といいますか？', '合同', ['合同', '対称', '相似']],
    ['合同な図形で重なる頂点を何といいますか？', '対応する頂点', ['対応する頂点', '中心', '対称の軸']],
    ['合同な図形の対応する辺の長さは？', '等しい', ['等しい', '2倍', '半分']],
    ['合同な図形の対応する角の大きさは？', '等しい', ['等しい', 'すべて90°', 'すべてちがう']],
  ]);
}

function genRegularPolygon() {
  if (Math.random() < 0.5) {
    const sides = pick([3, 4, 5, 6, 8, 10]);
    return choiceQuestion('正多角形', `辺が${sides}本で、辺と角がすべて等しい図形は？`, `正${sides}角形`, [`${sides}角形`, `正${sides}角形`, `正${sides + 1}角形`]);
  }
  const sides = pick([3, 4, 5, 6, 8, 10]);
  return numberQuestion('正多角形', `正${sides}角形の中心角は 何度？`, 360 / sides, { answerSuffix: '°' });
}

function genCirclePi() {
  const diameter = randInt(2, 30);
  if (Math.random() < 0.25) return choiceQuestion('円周率', '円周率は、およそいくつを使いますか？', '3.14', ['2.14', '3.14', '3.41', '4.13']);
  return numberQuestion('円周', `直径 ${diameter}cmの円の円周は？（円周率3.14）`, clean(diameter * 3.14), { answerSuffix: 'cm' });
}

function genDataGraphs() {
  const total = pick([100, 200, 400, 500]);
  const percent = pick([10, 20, 25, 30, 40, 50]);
  return numberQuestion('割合のグラフ', `全体が ${total}人で、${percent}%が「はい」と答えました。「はい」は何人？`, total * percent / 100, { answerSuffix: '人' });
}

function genFractionMultiply() {
  const n1 = randInt(1, 9);
  const d1 = randInt(n1 + 1, 12);
  const n2 = randInt(1, 9);
  const d2 = randInt(n2 + 1, 12);
  const answer = fraction(n1 * n2, d1 * d2);
  return choiceQuestion('分数のかけ算', `${n1}/${d1} × ${n2}/${d2} ＝ ？`, answer, [
    fraction(n1 + n2, d1 + d2),
    fraction(n1 * n2, d1 + d2),
    fraction(n1 + n2, d1 * d2),
  ]);
}

function genFractionDivide() {
  const n1 = randInt(1, 9);
  const d1 = randInt(n1 + 1, 12);
  const n2 = randInt(1, 9);
  const d2 = randInt(n2 + 1, 12);
  const answer = fraction(n1 * d2, d1 * n2);
  return choiceQuestion('分数のわり算', `${n1}/${d1} ÷ ${n2}/${d2} ＝ ？`, answer, [
    fraction(n1 * n2, d1 * d2),
    fraction(n1 * d1, n2 * d2),
    fraction(n1 * d2, d1 + n2),
  ]);
}

function genMixedCalculation() {
  const denominator = pick([2, 4, 5, 10]);
  const numerator = randInt(1, denominator - 1);
  const decimal = numerator / denominator;
  const add = randInt(1, 9) / 10;
  return numberQuestion('分数と小数', `${fraction(numerator, denominator)} ＋ ${add} ＝ ？（小数で）`, clean(decimal + add));
}

function genRatio() {
  const a = randInt(1, 9);
  const b = randInt(1, 9);
  const multiplier = randInt(2, 8);
  if (Math.random() < 0.5) return numberQuestion('等しい比', `${a}：${b} ＝ ${a * multiplier}：□`, b * multiplier);
  const total = (a + b) * multiplier;
  return numberQuestion('比で分ける', `${total}こを ${a}：${b} に分けます。小さいほう（同じときは片方）は何こ？`, Math.min(a, b) * multiplier, { answerSuffix: 'こ' });
}

function genInverseProportion() {
  const constant = pick([24, 36, 48, 60, 72, 96, 120]);
  const divisors = divisorsOf(constant).filter((value) => value >= 2 && value <= 12);
  const x = pick(divisors);
  return numberQuestion('反比例', `x×y＝${constant} です。x＝${x}のとき、yは？`, constant / x);
}

function genSpeed() {
  const mode = randInt(0, 2);
  const speed = pick([40, 50, 60, 80, 90, 100]);
  const hours = randInt(2, 5);
  const distance = speed * hours;
  if (mode === 0) return numberQuestion('速さ', `${distance}kmを ${hours}時間で進みました。時速は？`, speed, { answerSuffix: 'km' });
  if (mode === 1) return numberQuestion('道のり', `時速${speed}kmで ${hours}時間進むと、道のりは？`, distance, { answerSuffix: 'km' });
  return numberQuestion('時間', `${distance}kmを時速${speed}kmで進むと、何時間？`, hours, { answerSuffix: '時間' });
}

function genCircleArea() {
  const radius = randInt(1, 20);
  return numberQuestion('円の面積', `半径 ${radius}cmの円の面積は？（円周率3.14）`, clean(radius * radius * 3.14), { answerSuffix: 'cm²' });
}

function genSolidVolume() {
  if (Math.random() < 0.5) {
    const base = randInt(10, 100);
    const height = randInt(2, 20);
    return numberQuestion('角柱の体積', `底面積 ${base}cm²、高さ ${height}cmの角柱の体積は？`, base * height, { answerSuffix: 'cm³' });
  }
  const radius = randInt(1, 10);
  const height = randInt(2, 15);
  return numberQuestion('円柱の体積', `底面の半径 ${radius}cm、高さ ${height}cmの円柱の体積は？（円周率3.14）`, clean(radius * radius * 3.14 * height), { answerSuffix: 'cm³' });
}

function genSymmetry() {
  return genConcept('対称な図形', [
    ['1本の直線で折るとぴったり重なる図形は？', '線対称', ['線対称', '点対称', '合同でない']],
    ['1つの点を中心に180°回すと重なる図形は？', '点対称', ['線対称', '点対称', '正比例']],
    ['線対称な図形で、折り目になる直線は？', '対称の軸', ['対称の軸', '対称の中心', '直径']],
    ['点対称な図形で、回転の中心になる点は？', '対称の中心', ['対称の軸', '対称の中心', '頂点']],
  ]);
}

function genScale() {
  const scale = pick([2, 3, 4, 5, 10]);
  const original = randInt(2, 20);
  if (Math.random() < 0.5) return numberQuestion('拡大図', `長さ ${original}cmを ${scale}倍に拡大すると？`, original * scale, { answerSuffix: 'cm' });
  const mapCm = randInt(2, 10);
  const denominator = pick([1000, 10000, 25000]);
  const meters = mapCm * denominator / 100;
  return numberQuestion('縮尺', `縮尺1/${denominator}の地図で ${mapCm}cm。実際は何m？`, meters, { answerSuffix: 'm' });
}

function genAlgebra() {
  const rate = randInt(2, 15);
  const x = randInt(2, 20);
  if (Math.random() < 0.5) return numberQuestion('文字を使った式', `y＝${rate}×x。x＝${x}のとき yは？`, rate * x);
  const constant = randInt(2, 30);
  return choiceQuestion('文字を使った式', `1こ${rate}円の品をxこ買い、袋代${constant}円を足した代金を表す式は？`, `${rate}×x＋${constant}`, [`${rate}＋x×${constant}`, `${rate}×x＋${constant}`, `${rate}×(${constant}＋x)`]);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function genStatistics() {
  const mode = randInt(0, 3);
  const values = Array.from({ length: pick([5, 7, 9]) }, () => randInt(1, 20));
  if (mode === 0) return numberQuestion('代表値', `${values.join('、')} の平均値は？（小数第1位まで）`, clean(values.reduce((sum, value) => sum + value, 0) / values.length, 1));
  if (mode === 1) return numberQuestion('中央値', `${values.join('、')} の中央値は？`, median(values));
  if (mode === 2) return numberQuestion('範囲', `${values.join('、')} の範囲（最大－最小）は？`, Math.max(...values) - Math.min(...values));
  const uniqueValues = shuffle(Array.from({ length: 20 }, (_, index) => index + 1)).slice(0, 7);
  const repeated = pick(uniqueValues);
  const modeValues = shuffle([...uniqueValues, repeated, repeated]);
  return numberQuestion('最頻値', `${modeValues.join('、')} の最頻値は？`, repeated);
}

function genHistogram() {
  const counts = [randInt(1, 8), randInt(1, 8), randInt(1, 8), randInt(1, 8)];
  const labels = ['0〜9', '10〜19', '20〜29', '30〜39'];
  const maxIndex = counts.indexOf(Math.max(...counts));
  const visual = { type: 'barChart', bars: labels.map((label, index) => ({ label, value: counts[index] })) };
  if (Math.random() < 0.5) return choiceQuestion('度数分布', '度数がいちばん多い階級は？', labels[maxIndex], labels, { visual });
  const index = randInt(0, 3);
  return numberQuestion('度数分布', `${labels[index]}の階級の度数は？`, counts[index], { visual });
}

function genCombinations() {
  if (Math.random() < 0.5) {
    const people = pick([3, 4, 5, 6]);
    return numberQuestion('組み合わせ', `${people}人から2人の係を選ぶ組み合わせは何通り？`, people * (people - 1) / 2, { answerSuffix: '通り' });
  }
  const items = pick([3, 4, 5]);
  let permutations = 1;
  for (let i = 2; i <= items; i += 1) permutations *= i;
  return numberQuestion('並べ方', `${items}人が1列に並ぶ並べ方は何通り？`, permutations, { answerSuffix: '通り' });
}

function genAdvancedWordProblem(grade) {
  if (grade === 5) {
    const mode = randInt(0, 3);
    if (mode === 0) {
      const price = pick([200, 400, 500, 800, 1000]);
      const percent = pick([10, 20, 25, 50]);
      return numberQuestion('割合の文章問題', `${price}円の品物を ${percent}%引きで買います。ねだんは何円？`, price * (100 - percent) / 100, { answerSuffix: '円' });
    }
    if (mode === 1) {
      const base = randInt(4, 20) * 2;
      const height = randInt(2, 15);
      return numberQuestion('面積の文章問題', `底辺${base}m、高さ${height}mの三角形の花だんがあります。面積は？`, base * height / 2, { answerSuffix: 'm²' });
    }
    if (mode === 2) {
      const each = randInt(2, 25) / 10;
      const count = randInt(2, 12);
      return numberQuestion('小数の文章問題', `1本 ${each}mのリボンが ${count}本あります。全部で何m？`, clean(each * count), { answerSuffix: 'm' });
    }
    const average = randInt(5, 20);
    const days = randInt(3, 7);
    return numberQuestion('平均の文章問題', `${days}日間、1日平均${average}ページ読みました。全部で何ページ？`, average * days, { answerSuffix: 'ページ' });
  }

  const mode = randInt(0, 3);
  if (mode === 0) {
    const speed = pick([40, 50, 60, 80]);
    const hours = randInt(2, 5);
    return numberQuestion('速さの文章問題', `時速${speed}kmの車が${hours}時間走りました。道のりは？`, speed * hours, { answerSuffix: 'km' });
  }
  if (mode === 1) {
    const a = randInt(1, 5);
    const b = randInt(a + 1, 8);
    const multiplier = randInt(2, 10);
    return numberQuestion('比の文章問題', `${(a + b) * multiplier}mのロープを ${a}：${b} に分けます。短いほうは何m？`, a * multiplier, { answerSuffix: 'm' });
  }
  if (mode === 2) {
    const radius = randInt(2, 12);
    return numberQuestion('円の文章問題', `半径${radius}mの円形の花だんの面積は？（円周率3.14）`, clean(radius * radius * 3.14), { answerSuffix: 'm²' });
  }
  const baseArea = randInt(10, 80);
  const height = randInt(2, 12);
  return numberQuestion('体積の文章問題', `底面積${baseArea}cm²、高さ${height}cmの角柱の体積は？`, baseArea * height, { answerSuffix: 'cm³' });
}

const GENERATORS = {
  g1Number10: () => pick([() => genCount(10), () => genSequence(0, 10, [1]), () => genComparison(0, 10), genMakeTen])(),
  g1Addition10: () => pick([() => genAddition(10), () => genMissingNumber(10, 'add'), () => genSimpleWordProblem(10, ['add'])])(),
  g1Subtraction10: () => pick([() => genSubtraction(10), () => genMissingNumber(10, 'sub'), () => genSimpleWordProblem(10, ['sub'])])(),
  g1Number20: () => pick([() => genSequence(0, 20, [1, 2]), () => genComparison(0, 20), () => genPlaceValue(10, 20, [['十のくらい', 10], ['一のくらい', 1]], '10といくつ')])(),
  g1CarryAddition: () => genAddition(18, { min: 2, forceCarry: true, label: 'くり上がりのたし算' }),
  g1BorrowSubtraction: () => genSubtraction(18, { minValue: 11, forceBorrow: true, label: 'くり下がりのひき算' }),
  g1Number100: () => pick([() => genSequence(0, 100, [1, 2, 5, 10]), () => genComparison(0, 100), () => genPlaceValue(10, 100, [['十のくらい', 10], ['一のくらい', 1]])])(),
  g1CompareMeasures: genCompareBars,
  g1Clock: () => genClock([0, 30]),
  g1Shapes: () => genConcept('かたち', SHAPE_QUESTIONS_G1),
  g1Position: genPosition,
  g1Data: genPictograph,

  g2Number1000: () => pick([() => genSequence(0, 1000, [1, 10, 100]), () => genComparison(0, 1000), () => genPlaceValue(100, 999, [['百のくらい', 100], ['十のくらい', 10], ['一のくらい', 1]])])(),
  g2AddSub2Digit: () => pick([() => genIntegerAddSub(10, 99, '2けたの計算'), () => genMissingNumber(100, pick(['add', 'sub']))])(),
  g2AddSub3Digit: () => genIntegerAddSub(100, 999, '3けたの計算'),
  g2MultiplicationMeaning: genMultiplicationMeaning,
  g2TimesTables: () => Math.random() < 0.75 ? genMultiplication(1, 9, 1, 9, '九九') : genMissingMultiplication(),
  g2Length: () => genMetricConversion('length2'),
  g2Volume: () => genMetricConversion('volume2'),
  g2Time: () => pick([() => genClock([0, 5, 10, 15, 20, 30, 40, 45, 50, 55]), () => genElapsedTime(90)])(),
  g2Shapes: () => genConcept('三角形と四角形', SHAPE_QUESTIONS_G2),
  g2Fractions: () => genUnitFraction(8),
  g2Data: () => pick([() => genBarData('グラフの読み取り'), genTableData])(),
  g2WordProblems: () => genSimpleWordProblem(100, ['add', 'sub', 'mul']),

  g3LargeNumbers: () => pick([() => genSequence(0, 10000, [10, 100, 1000]), () => genComparison(0, 10000), () => genPlaceValue(1000, 10000, [['千のくらい', 1000], ['百のくらい', 100], ['十のくらい', 10]])])(),
  g3AddSub: () => genIntegerAddSub(100, 9999, '大きな数のたし算・ひき算'),
  g3Multiplication: () => genMultiplication(10, 999, 2, 9, 'かけ算の筆算'),
  g3Division: () => genDivision(2, 9, 1, 12),
  g3Remainder: () => Math.random() < 0.7 ? genDivision(2, 9, 1, 15, true, 'あまりのあるわり算') : genRemainderWordProblem(),
  g3Decimals: () => pick([genDecimalComparison, () => genDecimalAddSub(10, 1)])(),
  g3Fractions: () => pick([genFractionComparison, () => genFractionSameDenominator(10)])(),
  g3Length: () => genMetricConversion('length3'),
  g3Weight: () => genMetricConversion('weight3'),
  g3Time: () => pick([() => genElapsedTime(180), genMinutesToSeconds])(),
  g3Triangles: genTriangleConcept,
  g3CircleSphere: genCircleSphere,
  g3Data: () => pick([() => genBarData('棒グラフ'), genTableData])(),
  g3Unknown: () => genUnknown(200),
  g3WordProblems: () => genSimpleWordProblem(500, ['add', 'sub', 'mul', 'div']),

  g4LargeNumbers: () => pick([() => genComparison(1000000, 9999999999999), () => genPlaceValue(100000000, 9999999999999, [['一兆のくらい', 1000000000000], ['千億のくらい', 100000000000], ['百億のくらい', 10000000000], ['十億のくらい', 1000000000], ['一億のくらい', 100000000], ['千万のくらい', 10000000]])])(),
  g4Rounding: genRounding,
  g4MulDiv: () => Math.random() < 0.55 ? genMultiplication(10, 999, 10, 99, 'かけ算の筆算') : genDivision(2, 9, 10, 999, Math.random() < 0.4, 'わり算の筆算'),
  g4LongDivision: () => genDivision(10, 99, 2, 99, Math.random() < 0.5, '2けたでわるわり算'),
  g4DecimalAddSub: () => genDecimalAddSub(100, 2),
  g4DecimalMulDiv: genDecimalMulDivInteger,
  g4Fractions: () => genFractionSameDenominator(12),
  g4Angles: genAngle,
  g4Lines: genLinesConcept,
  g4Quadrilaterals: genQuadrilateral,
  g4Area: genRectangleArea,
  g4AreaUnits: genAreaUnits,
  g4Cuboid: genCuboidConcept,
  g4Relations: () => genProportionBasic('変わり方と割合'),
  g4LineGraphs: () => genBarData('折れ線グラフ', true),
  g4Tables: genTwoWayTable,

  g5NumberProperties: genNumberProperties,
  g5DecimalMultiply: genDecimalMultiply,
  g5DecimalDivide: genDecimalDivide,
  g5FractionEquivalent: genFractionEquivalent,
  g5FractionAddSub: genFractionDifferentDenominator,
  g5Average: genAverage,
  g5PerUnit: genPerUnit,
  g5Percent: genPercent,
  g5Proportion: () => genProportionBasic('比例'),
  g5PolygonArea: genPolygonArea,
  g5Volume: genVolume,
  g5Congruence: genCongruence,
  g5RegularPolygons: genRegularPolygon,
  g5CirclePi: genCirclePi,
  g5DataGraphs: genDataGraphs,
  g5WordProblems: () => genAdvancedWordProblem(5),

  g6FractionMultiply: genFractionMultiply,
  g6FractionDivide: genFractionDivide,
  g6MixedCalculations: genMixedCalculation,
  g6Ratio: genRatio,
  g6Proportion: () => genProportionBasic('比例'),
  g6InverseProportion: genInverseProportion,
  g6Speed: genSpeed,
  g6CircleArea: genCircleArea,
  g6SolidVolume: genSolidVolume,
  g6Symmetry: genSymmetry,
  g6Scale: genScale,
  g6Algebra: genAlgebra,
  g6Statistics: genStatistics,
  g6Histogram: genHistogram,
  g6Combinations: genCombinations,
  g6WordProblems: () => genAdvancedWordProblem(6),
};

function fingerprint(question) {
  return JSON.stringify([question.kind, question.prompt, question.answer, question.visual]);
}

export function getSupportedUnitTypes() {
  return Object.keys(GENERATORS);
}

export function generateProblemSet(unitType, count = 40) {
  const generator = GENERATORS[unitType];
  if (!generator) throw new Error(`未対応の単元タイプです: ${unitType}`);

  const problems = [];
  const seen = new Set();
  let attempts = 0;
  const maxAttempts = Math.max(count * 30, 300);

  while (problems.length < count && attempts < maxAttempts) {
    const question = generator();
    const key = fingerprint(question);
    attempts += 1;
    if (seen.has(key)) continue;
    seen.add(key);
    problems.push({ id: `${unitType}-${problems.length + 1}-${Math.random().toString(36).slice(2, 8)}`, ...question });
  }

  // 概念問題など組み合わせが少ない単元は、選択肢の並びを変えて規定数まで補う。
  while (problems.length < count) {
    const question = generator();
    problems.push({ id: `${unitType}-${problems.length + 1}-${Math.random().toString(36).slice(2, 8)}`, ...question });
  }

  return problems;
}

export function checkAnswer(question, userInput) {
  if (question.kind === 'clock') {
    const hour = Number(userInput.hour);
    const minute = Number(userInput.minute);
    return hour === question.answer.hour && minute === question.answer.minute;
  }
  if (question.kind === 'choice') return String(userInput).trim() === String(question.answer).trim();
  const value = Number(userInput);
  if (Number.isNaN(value)) return false;
  return Math.abs(value - Number(question.answer)) < 1e-6;
}
