// 文部科学省「小学校学習指導要領（平成29年告示）算数編」の
// 4領域（数と計算・図形・測定/変化と関係・データの活用）を基にした単元データ。
// 教科書会社によって単元名や学習順は異なるため、アプリでは内容別に整理している。

export const DEFAULT_QUESTION_COUNT = 40;

export const GRADES = [
  { id: 'g1', name: '１ねんせい', shortName: '1年' },
  { id: 'g2', name: '２ねんせい', shortName: '2年' },
  { id: 'g3', name: '３ねんせい', shortName: '3年' },
  { id: 'g4', name: '４ねんせい', shortName: '4年' },
  { id: 'g5', name: '５ねんせい', shortName: '5年' },
  { id: 'g6', name: '６ねんせい', shortName: '6年' },
];

const unit = (id, name, type, icon, domain, skills, questionCount = DEFAULT_QUESTION_COUNT) => ({
  id,
  name,
  type,
  icon,
  domain,
  skills,
  questionCount,
});

export const UNITS = {
  さんすう: {
    g1: [
      unit('g1-num10', '10までの かず', 'g1Number10', '🔟', 'かずと けいさん', 'かぞえる・ならべる・くらべる'),
      unit('g1-add10', '10までの たしざん', 'g1Addition10', '➕', 'かずと けいさん', 'たしざん・□に入る数'),
      unit('g1-sub10', '10までの ひきざん', 'g1Subtraction10', '➖', 'かずと けいさん', 'ひきざん・のこりはいくつ'),
      unit('g1-num20', '20までの かず', 'g1Number20', '🔢', 'かずと けいさん', '10といくつ・数のならび'),
      unit('g1-carry', 'くりあがりの たしざん', 'g1CarryAddition', '🧮', 'かずと けいさん', '10をつくってたす'),
      unit('g1-borrow', 'くりさがりの ひきざん', 'g1BorrowSubtraction', '🧮', 'かずと けいさん', '10からひいて考える'),
      unit('g1-num100', '100までの かず', 'g1Number100', '💯', 'かずと けいさん', '十のくらい・一のくらい・大小'),
      unit('g1-measure', 'おおきさくらべ', 'g1CompareMeasures', '📏', 'そくてい', 'ながさ・かさ・ひろさをくらべる'),
      unit('g1-clock', 'とけい（なんじ・なんじはん）', 'g1Clock', '🕐', 'そくてい', '時刻をよむ'),
      unit('g1-shapes', 'かたちあそび', 'g1Shapes', '🔷', 'ずけい', 'まる・さんかく・しかく・かたちづくり'),
      unit('g1-position', 'ものの いち', 'g1Position', '🧸', 'ずけい', 'まえ・うしろ・みぎ・ひだり・なんばんめ'),
      unit('g1-data', 'かずを しらべよう', 'g1Data', '📊', 'データ', 'えの数を数えてくらべる'),
    ],
    g2: [
      unit('g2-num1000', '1000までの 数', 'g2Number1000', '🔢', '数と計算', '位取り・大小・数の構成'),
      unit('g2-addsub2', '2けたの たし算・ひき算', 'g2AddSub2Digit', '🧮', '数と計算', '筆算・くり上がり・くり下がり'),
      unit('g2-addsub3', '3けたの たし算・ひき算', 'g2AddSub3Digit', '✏️', '数と計算', '簡単な3けたの計算'),
      unit('g2-mul-meaning', 'かけ算の いみ', 'g2MultiplicationMeaning', '🍪', '数と計算', '同じ数ずつ・いくつ分'),
      unit('g2-times', '九九（1〜9のだん）', 'g2TimesTables', '✖️', '数と計算', '九九・□に入る数'),
      unit('g2-length', '長さ（mm・cm・m）', 'g2Length', '📏', '測定', '単位換算・長さの計算'),
      unit('g2-volume', 'かさ（mL・dL・L）', 'g2Volume', '🥛', '測定', '単位換算・かさの計算'),
      unit('g2-time', '時こくと 時間', 'g2Time', '⏰', '測定', '何時何分・時間の長さ'),
      unit('g2-shapes', '三角形と 四角形', 'g2Shapes', '🔶', '図形', '直角・長方形・正方形・直角三角形'),
      unit('g2-fractions', '分数の はじめ', 'g2Fractions', '🍕', '数と計算', '1/2・1/3・1/4など'),
      unit('g2-data', 'ひょうと グラフ', 'g2Data', '📊', 'データの活用', '分類・表・簡単なグラフ'),
      unit('g2-word', '2年生の 文章問題', 'g2WordProblems', '📝', '活用', 'たし算・ひき算・かけ算'),
    ],
    g3: [
      unit('g3-large', '大きな数（万まで）', 'g3LargeNumbers', '🔢', '数と計算', '一万・位取り・大小'),
      unit('g3-addsub', '3けた・4けたの たし算とひき算', 'g3AddSub', '🧮', '数と計算', '筆算・見積もり'),
      unit('g3-mul', '2けた・3けたを かける計算', 'g3Multiplication', '✖️', '数と計算', '何十・何百×1けた・筆算'),
      unit('g3-div', 'わり算', 'g3Division', '➗', '数と計算', '九九を使うわり算'),
      unit('g3-remainder', 'あまりのある わり算', 'g3Remainder', '🧺', '数と計算', '商とあまり・文章問題'),
      unit('g3-decimal', '小数（0.1の位）', 'g3Decimals', '🔸', '数と計算', '小数の意味・大小・たしひき'),
      unit('g3-fraction', '分数', 'g3Fractions', '🍰', '数と計算', '分数の意味・大小・簡単なたしひき'),
      unit('g3-length', '長い長さ（km）', 'g3Length', '🛣️', '測定', 'mとkm・道のり'),
      unit('g3-weight', '重さ（g・kg・t）', 'g3Weight', '⚖️', '測定', '単位換算・重さの計算'),
      unit('g3-time', '時間と 時こく', 'g3Time', '⏱️', '測定', '秒・分・時間・経過時間'),
      unit('g3-triangle', '三角形と 角', 'g3Triangles', '📐', '図形', '二等辺三角形・正三角形・角'),
      unit('g3-circle', '円と 球', 'g3CircleSphere', '⚪', '図形', '中心・半径・直径・球'),
      unit('g3-data', '表と 棒グラフ', 'g3Data', '📊', 'データの活用', '読み取り・比較・二次元の表'),
      unit('g3-unknown', '□を使った 式', 'g3Unknown', '🔲', '数と計算', '未知の数を求める'),
      unit('g3-word', '3年生の 文章問題', 'g3WordProblems', '📝', '活用', 'かけ算・わり算・単位'),
    ],
    g4: [
      unit('g4-large', '大きな数（億・兆）', 'g4LargeNumbers', '🌏', '数と計算', '億・兆・10倍・1/10'),
      unit('g4-round', 'がい数と 見積もり', 'g4Rounding', '🎯', '数と計算', '四捨五入・和や差の見積もり'),
      unit('g4-muldiv', 'かけ算と わり算の 筆算', 'g4MulDiv', '🧮', '数と計算', '2けたをかける・1けたでわる'),
      unit('g4-longdiv', '2けたで わるわり算', 'g4LongDivision', '➗', '数と計算', '商の見当・あまり'),
      unit('g4-dec-addsub', '小数の たし算・ひき算', 'g4DecimalAddSub', '🔸', '数と計算', '小数第2位までの計算'),
      unit('g4-dec-muldiv', '小数×整数・小数÷整数', 'g4DecimalMulDiv', '✖️', '数と計算', '小数と整数の計算'),
      unit('g4-fraction', '同じ分母の 分数計算', 'g4Fractions', '🍕', '数と計算', '真分数・仮分数・帯分数・たしひき'),
      unit('g4-angle', '角の 大きさ', 'g4Angles', '📐', '図形', '度・分度器・回転の角'),
      unit('g4-lines', '垂直と 平行', 'g4Lines', '📏', '図形', '直線の関係・距離'),
      unit('g4-quadrilateral', 'いろいろな 四角形', 'g4Quadrilaterals', '🔷', '図形', '台形・平行四辺形・ひし形'),
      unit('g4-area', '面積', 'g4Area', '⬜', '図形', '長方形・正方形の面積'),
      unit('g4-area-units', '面積の 単位', 'g4AreaUnits', '🗺️', '測定', 'cm²・m²・a・ha・km²'),
      unit('g4-cuboid', '直方体と 立方体', 'g4Cuboid', '🧊', '図形', '面・辺・頂点・位置関係'),
      unit('g4-relation', '変わり方と 割合のはじめ', 'g4Relations', '📈', '変化と関係', '伴って変わる量・何倍'),
      unit('g4-linegraph', '折れ線グラフ', 'g4LineGraphs', '📉', 'データの活用', '変化・差・グラフの読み取り'),
      unit('g4-table', '整理のしかた（2次元の表）', 'g4Tables', '🗂️', 'データの活用', '2つの観点で分類する'),
    ],
    g5: [
      unit('g5-properties', '倍数と 約数', 'g5NumberProperties', '🔢', '数と計算', '公倍数・公約数・偶数・奇数'),
      unit('g5-dec-mul', '小数の かけ算', 'g5DecimalMultiply', '✖️', '数と計算', '小数×小数・積の大きさ'),
      unit('g5-dec-div', '小数の わり算', 'g5DecimalDivide', '➗', '数と計算', '小数÷小数・あまり・概数'),
      unit('g5-frac-equivalent', '分数の 大きさと 通分・約分', 'g5FractionEquivalent', '🍰', '数と計算', '等しい分数・通分・約分・大小'),
      unit('g5-frac-addsub', '分母のちがう 分数のたしひき', 'g5FractionAddSub', '🧮', '数と計算', '通分して計算する'),
      unit('g5-average', '平均', 'g5Average', '⚖️', '変化と関係', '平均を求める・合計を逆算する'),
      unit('g5-perunit', '単位量あたりの 大きさ', 'g5PerUnit', '👥', '変化と関係', '人口密度・混みぐあい・1個あたり'),
      unit('g5-percent', '割合と 百分率', 'g5Percent', '％', '変化と関係', '割合・百分率・歩合'),
      unit('g5-proportion', '比例', 'g5Proportion', '📈', '変化と関係', '表・式・比例の関係'),
      unit('g5-polygon-area', '三角形・四角形の 面積', 'g5PolygonArea', '📐', '図形', '三角形・平行四辺形・台形・ひし形'),
      unit('g5-volume', '体積', 'g5Volume', '🧊', '図形', '直方体・立方体・容積'),
      unit('g5-congruence', '合同な 図形', 'g5Congruence', '🧩', '図形', '対応する辺・角・作図'),
      unit('g5-polygons', '正多角形と 円', 'g5RegularPolygons', '⬡', '図形', '正多角形・中心角'),
      unit('g5-circle', '円周と 円周率', 'g5CirclePi', '⭕', '図形', '直径・円周・円周率3.14'),
      unit('g5-data', '帯グラフと 円グラフ', 'g5DataGraphs', '🥧', 'データの活用', '割合の読み取り・比較'),
      unit('g5-word', '5年生の 文章問題', 'g5WordProblems', '📝', '活用', '小数・分数・割合・面積'),
    ],
    g6: [
      unit('g6-frac-mul', '分数の かけ算', 'g6FractionMultiply', '✖️', '数と計算', '分数×整数・分数×分数'),
      unit('g6-frac-div', '分数の わり算', 'g6FractionDivide', '➗', '数と計算', '分数÷整数・分数÷分数'),
      unit('g6-mixed', '分数・小数の まじった計算', 'g6MixedCalculations', '🧮', '数と計算', '分数と小数の変換・計算の順序'),
      unit('g6-ratio', '比', 'g6Ratio', '⚖️', '変化と関係', '比の値・等しい比・配分'),
      unit('g6-proportion', '比例', 'g6Proportion', '📈', '変化と関係', '式・表・グラフ・比例配分'),
      unit('g6-inverse', '反比例', 'g6InverseProportion', '📉', '変化と関係', '積が一定になる関係'),
      unit('g6-speed', '速さ', 'g6Speed', '🚲', '変化と関係', '速さ・道のり・時間'),
      unit('g6-circle-area', '円の 面積', 'g6CircleArea', '⭕', '図形', '半径×半径×3.14'),
      unit('g6-solid-volume', '角柱・円柱の 体積', 'g6SolidVolume', '🥫', '図形', '底面積×高さ'),
      unit('g6-symmetry', '対称な 図形', 'g6Symmetry', '🦋', '図形', '線対称・点対称・対応点'),
      unit('g6-scale', '拡大図・縮図と 縮尺', 'g6Scale', '🗺️', '図形', '拡大・縮小・地図の縮尺'),
      unit('g6-algebra', '文字を使った 式', 'g6Algebra', '𝑥', '数と計算', 'x・yで関係を表す・値を求める'),
      unit('g6-statistics', 'データの 調べ方', 'g6Statistics', '📊', 'データの活用', '平均値・中央値・最頻値・範囲'),
      unit('g6-histogram', '度数分布表と 柱状グラフ', 'g6Histogram', '📶', 'データの活用', '階級・度数・分布の特徴'),
      unit('g6-combinations', '並べ方と 組み合わせ', 'g6Combinations', '🎲', 'データの活用', '起こり得る場合を整理する'),
      unit('g6-word', '6年生の 総合文章問題', 'g6WordProblems', '📝', '活用', '分数・比・速さ・体積'),
    ],
  },
};

export function getUnits(subject, gradeId) {
  return UNITS[subject]?.[gradeId] || [];
}

export function getCurriculumSummary(subject = 'さんすう') {
  return GRADES.map((grade) => ({
    ...grade,
    unitCount: getUnits(subject, grade.id).length,
    questionCount: getUnits(subject, grade.id).reduce((sum, item) => sum + item.questionCount, 0),
  }));
}
