# べんきょうヒント - 子供向け勉強ヒント補助ツール

子供が問題でわからなくなったときに、答えを直接出すのではなく、段階的なヒントを出して自分で考えられるようにサポートするWebアプリです。

## 特徴

- 答えを直接教えず、ヒントで考える力を育てる
- 写真を撮って問題をAIが読み取れる
- 1回につき1つだけヒントを出す（最大3回）
- 6歳〜小学生低学年でもわかるやさしい言葉
- がんばったらスタンプがもらえるごほうび機能
- スマホ対応のかわいいデザイン

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
src/
├── main.jsx                     # エントリーポイント
├── App.jsx                      # メインアプリ（画面遷移管理）
├── index.css                    # グローバルスタイル
├── components/
│   ├── TeacherCharacter.jsx     # 先生キャラクター（SVG）
│   ├── SubjectButton.jsx        # 教科選択ボタン
│   ├── ActionButton.jsx         # 汎用ボタン
│   └── PhotoCapture.jsx         # 写真撮影コンポーネント
├── pages/
│   ├── HomePage.jsx             # ホーム画面
│   ├── InputPage.jsx            # 問題入力画面（写真+テキスト）
│   ├── HintPage.jsx             # ヒント表示画面
│   └── RewardPage.jsx           # ごほうびスタンプ画面
├── services/
│   └── hintService.js           # フロント側API呼び出し
└── hooks/
    └── useStamps.js             # スタンプ管理フック
```

## 技術スタック

- Vite + React（フロントエンド）
- Express（APIサーバー）
- Anthropic Claude API（AI ヒント生成・画像読み取り）
- デプロイ先: Render（Web Service）
