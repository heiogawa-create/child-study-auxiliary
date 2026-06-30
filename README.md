# べんきょうヒント - 子供向け勉強ヒント補助ツール

子供が問題でわからなくなったときに、答えを直接出すのではなく、段階的なヒントを出して自分で考えられるようにサポートするWebアプリです。

## 特徴

- 答えを直接教えず、ヒントで考える力を育てる
- 1回につき1つだけヒントを出す（最大3回）
- 6歳〜小学生低学年でもわかるやさしい言葉
- がんばったらスタンプがもらえるごほうび機能
- スマホ対応のかわいいデザイン

## ローカルでの起動方法

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

## Netlifyへのデプロイ方法

### 方法1: GitHubリポジトリから自動デプロイ

1. このリポジトリをGitHubにプッシュ
2. [Netlify](https://app.netlify.com/)にログイン
3. 「Add new site」→「Import an existing project」
4. GitHubリポジトリを選択
5. 以下の設定を確認して「Deploy」

### 方法2: CLIからデプロイ

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### ビルド設定

| 項目 | 値 |
|------|-----|
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |

これらの設定は `netlify.toml` にも記載済みです。

## 環境変数の設定方法

現在はAI API未接続のため、仮のヒントが表示されます。
AI APIを接続する場合は、以下の環境変数を設定してください。

| 変数名 | 説明 |
|--------|------|
| `VITE_AI_API_KEY` | AI APIのキー |
| `VITE_AI_API_URL` | AI APIのエンドポイントURL |

### ローカル

`.env.example` をコピーして `.env` を作成してください。

```bash
cp .env.example .env
```

### Netlify

Netlifyの管理画面 → Site settings → Environment variables から設定してください。

## AI APIを後から接続する場所

`src/services/hintService.js` の `generateHint` 関数内のコメントアウト部分を差し替えてください。

```
src/services/hintService.js  ← ヒント生成のメイン関数
├── SYSTEM_PROMPT           ← AIに送るシステムプロンプト
├── MOCK_HINTS              ← 仮のヒントデータ（API接続後は不要）
└── generateHint()          ← この関数の中身を差し替える
```

## プロジェクト構成

```
src/
├── main.jsx                 # エントリーポイント
├── App.jsx                  # メインアプリ（画面遷移管理）
├── index.css                # グローバルスタイル
├── components/
│   ├── TeacherCharacter.jsx # 先生キャラクター（SVG）
│   ├── SubjectButton.jsx    # 教科選択ボタン
│   └── ActionButton.jsx     # 汎用ボタン
├── pages/
│   ├── HomePage.jsx         # ホーム画面
│   ├── InputPage.jsx        # 問題入力画面
│   ├── HintPage.jsx         # ヒント表示画面
│   └── RewardPage.jsx       # ごほうびスタンプ画面
├── services/
│   └── hintService.js       # ヒント生成サービス（AI API接続場所）
└── hooks/
    └── useStamps.js         # スタンプ管理フック
```

## 技術スタック

- Vite + React
- デプロイ先: Netlify（静的サイト）
