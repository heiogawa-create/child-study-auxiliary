// 単元ごとの問題を自動生成するロジック（AIを使わずローカルで生成・採点）

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

const COUNT_EMOJI = ['🍎', '🍓', '⭐', '🎈', '🐟', '🍩'];

function genNumberRecognition(min, max) {
  const count = randInt(min, max);
  return {
    kind: 'number',
    unitLabel: 'かずをかぞえよう',
    prompt: 'いくつ ありますか？',
    visual: { type: 'count', emoji: pick(COUNT_EMOJI), count },
    answer: count,
  };
}

function genSequence(min, max, step) {
  const start = randInt(min, max - step * 3);
  const seq = [start, start + step, start + step * 2, start + step * 3];
  const blankIndex = randInt(0, 3);
  return {
    kind: 'number',
    unitLabel: 'かずのならび',
    prompt: '□に あう かずを かいてね',
    visual: { type: 'sequence', seq, blankIndex },
    answer: seq[blankIndex],
  };
}

function genAddition(maxSum, minOperand = 1) {
  const a = randInt(minOperand, maxSum - 1);
  const b = randInt(1, maxSum - a);
  return {
    kind: 'number',
    unitLabel: 'たしざん',
    prompt: `${a} ＋ ${b} ＝ ？`,
    visual: null,
    answer: a + b,
  };
}

function genSubtraction(maxValue, minValue = 2) {
  const a = randInt(minValue, maxValue);
  const b = randInt(1, a);
  return {
    kind: 'number',
    unitLabel: 'ひきざん',
    prompt: `${a} － ${b} ＝ ？`,
    visual: null,
    answer: a - b,
  };
}

function genAddSub(min, max) {
  const isAdd = Math.random() < 0.5;
  if (isAdd) {
    const a = randInt(min, max - 1);
    const b = randInt(1, max - a);
    return { kind: 'number', unitLabel: 'たしざん', prompt: `${a} ＋ ${b} ＝ ？`, visual: null, answer: a + b };
  }
  const a = randInt(min + 1, max);
  const b = randInt(1, a);
  return { kind: 'number', unitLabel: 'ひきざん', prompt: `${a} － ${b} ＝ ？`, visual: null, answer: a - b };
}

function genClock() {
  const hour = randInt(1, 12);
  const minute = pick([0, 15, 30, 45]);
  return {
    kind: 'clock',
    unitLabel: 'とけいをよもう',
    prompt: 'なんじなんぷんかな？',
    visual: { type: 'clock', hour, minute },
    answer: { hour, minute },
  };
}

const WORD_PROBLEM_TEMPLATES = [
  {
    op: 'add',
    make: (a, b) => `こうえんに こどもが ${a}にん いました。あとから ${b}にん きました。ぜんぶで なんにんに なりましたか？`,
  },
  {
    op: 'add',
    make: (a, b) => `りんごが ${a}こ ありました。おかあさんが ${b}こ かってきました。ぜんぶで なんこに なりましたか？`,
  },
  {
    op: 'add',
    make: (a, b) => `えんぴつを ${a}ほん もっています。ともだちから ${b}ほん もらいました。ぜんぶで なんぼんに なりましたか？`,
  },
  {
    op: 'sub',
    make: (a, b) => `あめが ${a}こ ありました。${b}こ たべました。のこりは なんこですか？`,
  },
  {
    op: 'sub',
    make: (a, b) => `とりが ${a}わ いました。${b}わ とんでいきました。のこりは なんわですか？`,
  },
  {
    op: 'sub',
    make: (a, b) => `みかんが ${a}こ ありました。${b}こ おともだちに あげました。のこりは なんこですか？`,
  },
];

function genWordProblem() {
  const template = pick(WORD_PROBLEM_TEMPLATES);
  let a, b, answer;
  if (template.op === 'add') {
    a = randInt(2, 12);
    b = randInt(1, 20 - a > 8 ? 8 : Math.max(1, 20 - a));
    answer = a + b;
  } else {
    a = randInt(5, 18);
    b = randInt(1, a);
    answer = a - b;
  }
  return {
    kind: 'number',
    unitLabel: 'ぶんしょうだい',
    prompt: template.make(a, b),
    visual: null,
    answer,
  };
}

const GENERATORS = {
  numberRecognition10: () => genNumberRecognition(1, 10),
  addition10: () => genAddition(10),
  subtraction10: () => genSubtraction(10),
  numberRecognition20: () => genSequence(1, 20, pick([1, 1, 2])),
  addSub20: () => genAddSub(10, 20),
  numberRecognition100: () => genSequence(1, 100, pick([1, 10])),
  addSub100: () => genAddSub(20, 100),
  clock: () => genClock(),
  wordProblem: () => genWordProblem(),
};

export function generateProblemSet(unitType, count = 20) {
  const generator = GENERATORS[unitType] || GENERATORS.addition10;
  const problems = [];
  for (let i = 0; i < count; i++) {
    problems.push({ id: i, ...generator() });
  }
  return problems;
}

export function checkAnswer(question, userInput) {
  if (question.kind === 'clock') {
    const hour = Number(userInput.hour);
    const minute = Number(userInput.minute);
    return hour === question.answer.hour && minute === question.answer.minute;
  }
  const value = Number(userInput);
  if (Number.isNaN(value)) return false;
  return value === question.answer;
}
