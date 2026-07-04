// 学年・単元データ（さんすう１ねんせい）

export const GRADES = [
  { id: 'g1', name: '１ねんせい', available: true },
  { id: 'g2', name: '２ねんせい', available: false },
  { id: 'g3', name: '３ねんせい', available: false },
];

export const UNITS = {
  さんすう: {
    g1: [
      { id: 'num10', name: '10までのかず', type: 'numberRecognition10', icon: '🔟' },
      { id: 'add10', name: 'たしざん', type: 'addition10', icon: '➕' },
      { id: 'sub10', name: 'ひきざん', type: 'subtraction10', icon: '➖' },
      { id: 'num20', name: '20までのかず', type: 'numberRecognition20', icon: '🔢' },
      { id: 'addsub20', name: '10よりおおきいたしざん、ひきざん', type: 'addSub20', icon: '🧮' },
      { id: 'num100', name: '100までのかず', type: 'numberRecognition100', icon: '💯' },
      { id: 'addsub100', name: '100までのたしざん、ひきざん', type: 'addSub100', icon: '🧮' },
      { id: 'clock', name: 'とけいをよむ', type: 'clock', icon: '🕐' },
      { id: 'wordproblem', name: 'たしざん、ひきざんのぶんしょうだい', type: 'wordProblem', icon: '📝' },
    ],
  },
};

export function getUnits(subject, gradeId) {
  return UNITS[subject]?.[gradeId] || [];
}
