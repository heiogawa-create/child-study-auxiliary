# べんきょうヒント - 子供向け勉強ヒント補助ツール

子供が問題でわからなくなったときに、答えを直接出すのではなく、段階的なヒントを出して自分で考えられるようにサポートするWebアプリです。

## 特徴

- 答えを直接教えず、ヒントで考える力を育てる
- 写真を撮って問題をAIが読み取れる
- 1回につき1つだけヒントを出す（最大3回）
- 小学1〜6年生の算数87単元を学年別に収録
- 各単元40問。開くたびに数値や出題形式が変わる反復ドリル
- 計算だけでなく、図形・測定・変化と関係・データ活用にも対応
- 数値入力、選択問題、時計、表、棒グラフ、折れ線グラフなどに対応
- 問題ごとに答えを直接言わない3段階のローカルヒントを用意
- がんばったらスタンプがもらえるごほうび機能
- 5系統×4段階（全20キャラクター）の進化システム
- スマホ対応のかわいいデザイン

## 算数ドリルの範囲

文部科学省「小学校学習指導要領（平成29年告示）解説 算数編」の4領域を基に、教科書会社による単元名・学習順の違いを吸収して内容別に整理しています。

| 学年 | 単元数 | 1回の出題数 | 主な範囲 |
|------|-------:|------------:|----------|
| 1年 | 12 | 各40問 | 100までの数、たしひき、時計、形、データ |
| 2年 | 12 | 各40問 | 1000までの数、筆算、九九、長さ・かさ、分数 |
| 3年 | 15 | 各40問 | かけ算・わり算、小数・分数、円、棒グラフ |
| 4年 | 16 | 各40問 | 億・兆、概数、小数・分数、角、面積、折れ線グラフ |
| 5年 | 16 | 各40問 | 小数・分数、割合、平均、面積・体積、円周率 |
| 6年 | 16 | 各40問 | 分数計算、比・比例、速さ、円・柱体、統計、場合の数 |

合計87単元・1周3,480問です。問題はローカルで自動生成されるため、同じ単元を繰り返しても新しい40問セットになります。

## キャラクター進化

1問正解ごとにスタンプが1つ増え、20・60・150スタンプで進化します。キャラクターを変更してもスタンプ数とレベルは引き継がれます。

| タイプ | レベル1 | レベル2 | レベル3 | レベル4 |
|--------|----------|----------|----------|----------|
| ようせい | ピコ | ココ | キラ | ソラ |
| フクロウ | ホゥ | ウィズ | セージ | グラン |
| ロボット | ビット | バイト | ギガ | テラ |
| どうぶつ | ミケ | タマ | レオ | キング |
| ほしのせいれい | ルナ | ステラ | ノヴァ | コスモ |

## ローカルでの起動方法

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動（フロントエンドのみ）
npm run dev

# 本番モードで起動（API含む）
npm run build
npm start
```

開発サーバー: `http://localhost:5173`
本番サーバー: `http://localhost:3000`

### Netlifyのプレビュー

`netlify.toml` で `npm run build` と `dist` 配信を設定済みです。算数ドリルとローカルヒントは静的配信だけで動きます。写真・自由入力のAIヒント（`/api/hint`）まで使う本番環境は、下記のRender構成を使用してください。

## Renderへのデプロイ方法

### 方法1: render.yamlで自動セットアップ

1. このリポジトリをGitHubにプッシュ
2. [Render](https://render.com/)にログイン
3. 「New」→「Blueprint」→ このリポジトリを選択
4. `render.yaml` が自動で読み込まれる
5. 環境変数 `ANTHROPIC_API_KEY` を設定して「Apply」

### 方法2: 手動セットアップ

1. Renderで「New」→「Web Service」
2. GitHubリポジトリを接続
3. 以下を設定:

| 項目 | 値 |
|------|-----|
| **Runtime** | Node |
| **Build command** | `npm install && npm run build` |
| **Start command** | `node server.mjs` |

4. Environment から `ANTHROPIC_API_KEY` を追加

## 環境変数の設定方法

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | Anthropic APIキー | はい |
| `PORT` | サーバーポート（Renderが自動設定） | いいえ |

### ローカル

`.env.example` をコピーして `.env` を作成してください。

```bash
cp .env.example .env
# .env に ANTHROPIC_API_KEY を記入
```

### Render

Renderの管理画面 → Environment → Environment Variables から設定してください。

## AI APIの仕組み

```
フロント (React)
  ↓ POST /api/hint（写真+テキスト）
サーバー (server.mjs)
  ↓ Claude API呼び出し（マルチモーダル対応）
Anthropic Claude
  ↓ ヒントを返す（答えは絶対に出さない）
フロント
  ↓ ヒントを表示
```

APIキー未設定の場合はフォールバックの仮ヒントを返します。

## プロジェクト構成

```
server.mjs                       # Expressサーバー（API + 静的配信）
render.yaml                      # Renderデプロイ設定
netlify.toml                     # Netlifyビルド・静的プレビュー設定
public/characters/               # 5タイプ×4段階の進化WebP画像
src/
├── main.jsx                     # エントリーポイント
├── App.jsx                      # メインアプリ（画面遷移管理）
├── index.css                    # グローバルスタイル
├── components/
│   ├── TeacherCharacter.jsx     # 先生キャラクター（SVG）
│   ├── CharacterAvatar.jsx      # 5タイプ×4段階の進化表示
│   ├── SubjectButton.jsx        # 教科選択ボタン
│   ├── ActionButton.jsx         # 汎用ボタン
│   └── PhotoCapture.jsx         # 写真撮影コンポーネント
├── data/
│   ├── units.js                 # 1〜6年生・87単元の学習内容
│   └── characters.js            # キャラクター名・進化条件
├── pages/
│   ├── HomePage.jsx             # ホーム画面
│   ├── InputPage.jsx            # 問題入力画面（写真+テキスト）
│   ├── HintPage.jsx             # ヒント表示画面
│   ├── GradeSelectPage.jsx      # 1〜6年生選択
│   ├── UnitSelectPage.jsx       # 単元選択
│   ├── QuizPage.jsx             # 40問ドリル・図表・ローカルヒント
│   └── RewardPage.jsx           # 進化ロードマップ・スタンプ画面
├── services/
│   ├── hintService.js           # フロント側AI API呼び出し
│   └── problemGenerator.js      # 87単元の問題生成・採点
└── hooks/
    └── useStamps.js             # スタンプ管理フック
```

## 技術スタック

- Vite + React（フロントエンド）
- Express（APIサーバー）
- Anthropic Claude API（AI ヒント生成・画像読み取り）
- デプロイ先: Render（Web Service）
