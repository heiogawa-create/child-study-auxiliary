# べんきょうヒント - 子供向け勉強ヒント補助ツール

子供が問題でわからなくなったときに、答えを直接出すのではなく、段階的なヒントを出して自分で考えられるようにサポートするWebアプリです。

## 特徴

- 答えを直接教えず、ヒントで考える力を育てる
- 写真を撮って問題をAIが読み取れる
- 1回につき1つだけヒントを出す（最大3回）
- 小学1〜6年生の算数87単元を学年別に収録
- こくご（1〜6年・25単元）、りか（3〜6年・16単元）、しゃかい（3〜6年・17単元）のドリルも収録
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

## こくご・りか・しゃかいのドリル範囲

いずれも学習指導要領の学年別の内容に合わせ、1単元40問の選択式ドリルです。

| 教科 | 学年 | 内容 |
|------|------|------|
| こくご | 1〜6年 | 学年別配当漢字の読み書き、ひらがな・カタカナ、はんたい言葉、助詞、主語述語、ローマ字、ことわざ・慣用句、熟語の組み立て、敬語、和語・漢語・外来語、四字熟語、類義語・対義語 |
| りか | 3〜6年 | こん虫と植物、光・じしゃく・電気、季節と生き物、月と星、水のすがた、発芽と成長、生命のたんじょう、天気と流れる水、もののとけ方、燃焼、人の体、大地のつくり、水よう液・てこ・発電 |
| しゃかい | 3〜6年 | 地図記号、はたらく人、くらしを守る、昔のくらし、都道府県、水とごみ、防災、伝統、国土と気候、食料生産、工業と貿易、情報と環境、憲法と政治、日本の歴史、世界の中の日本 |

りか・しゃかいは学習指導要領どおり3年生から始まるため、1・2年生は選択できません。

### 漢字の収録範囲

「かん字の よみかた／かきかた」単元は、学年別漢字配当表の配当漢字をほぼ全て収録しています（1年80字・2年160字・3年200字・4年201字・5年197字・6年177字、合計1015字）。学年をひらくたびに、その学年の配当漢字からランダムに出題されます。4年生は音訓表つきの配当表を照合して修正済みです。

※ 5・6年生の一部は公開情報をもとに作成したもので、公式の音訓表と1件ずつ照合できていません。学年境界の数文字については実際の配当学年と前後している可能性があります。誤りに気づいた場合はお知らせください。

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
npm install
cp .env.example .env
cp .dev.vars.example .dev.vars
npm run dev
```

`npm run preview` で、ビルド済みのCloudflare Workerをローカル確認できます。秘密情報を入れた `.env` と `.dev.vars` はGitへ追加しないでください。

## 料金と無料範囲

- 小学1年生の算数は無料
- 小学2〜6年生の算数、こくご・りか・しゃかいのドリル、写真・自由入力AIヒントは月額480円
- 最初の100名は月額300円。キャンペーン中に登録した方は、契約を継続している間ずっと300円
- 紹介リンク経由の会員が月額決済を完了するたび、紹介者へ毎月100円
- 紹介報酬は月末締め、翌月7日までにPayPayで手動送金

## Neonのセットアップ

1. NeonプロジェクトでAuthを有効にし、メール確認を有効にします。
2. Neon SQL Editorで [`database/schema.sql`](database/schema.sql) を実行します。
3. Neon Auth URLを、Worker変数 `NEON_AUTH_URL` に設定します（フロントは `/api/config` 経由で実行時に取得するため、再ビルドは不要です）。
4. ビルド変数 `VITE_NEON_AUTH_URL` の設定は任意です。設定した場合はビルド時に埋め込まれ、`/api/config` より優先されます。
5. Configuration画面に表示されたJWKS URLを、そのまま `NEON_AUTH_JWKS_URL` に設定します。通常は `<NEON_AUTH_URL>/.well-known/jwks.json` です。
6. Neon接続文字列をWorkerの暗号化されたSecret `DATABASE_URL` に設定します。

会員メールはNeon Authを正として、紹介リンクの紐付けは初回登録時に一度だけ保存します。自己紹介や後からの紹介者変更はできません。

## Stripeのセットアップ

Stripeはテストモードで次の順に作成し、テスト決済を通してから本番モードにも同じ構成を作ります。

1. 商品「べんきょうヒント プレミアム」を作成します。
2. 月額480円・JPYの継続Priceを作成し、IDを `STRIPE_PRICE_ID_MONTHLY_480` に設定します。
3. クーポンを次の内容で作成し、IDを `STRIPE_FOUNDERS_COUPON_ID` に設定します。
   - 180円引き
   - 通貨 JPY
   - 期間 Forever（継続中ずっと）
   - 最大利用回数 100
4. Customer Portalで解約・支払方法変更を許可します。
5. Webhook送信先を `https://child-study-auxiliary.heiogawa.workers.dev/api/stripe/webhook` にします。
6. 次のイベントを登録します。
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `credit_note.created`
   - `charge.refunded`
   - `charge.dispute.created`
7. Stripe Secret Keyを `STRIPE_SECRET_KEY`、Webhook署名Secretを `STRIPE_WEBHOOK_SECRET` に設定します。

先着人数はStripeクーポンの最大利用回数でも制限するため、100人目付近の同時申込にも対応します。`invoice.paid` 1件につき紹介報酬100円を一度だけ記録し、Webhookの重複送信では増えません。

## Cloudflare Workerの設定

WorkerのSettings → Variables and Secretsに次を設定します。実際のキーをIssueやチャットへ貼らないでください。

| 変数 | 種類 | 内容 |
|---|---|---|
| `VITE_NEON_AUTH_URL` | Build variable | Neon Auth URL（フロントへ公開） |
| `DATABASE_URL` | Secret | Neon接続文字列 |
| `NEON_AUTH_URL` | Variable | Neon Auth URL |
| `NEON_AUTH_JWKS_URL` | Variable | Neon Auth JWT検証用JWKS URL |
| `STRIPE_SECRET_KEY` | Secret | Stripe Secret Key |
| `STRIPE_WEBHOOK_SECRET` | Secret | Stripe Webhook署名Secret |
| `STRIPE_PRICE_ID_MONTHLY_480` | Variable | 月額480円Price ID |
| `STRIPE_FOUNDERS_COUPON_ID` | Variable | 先着100名クーポンID |
| `ADMIN_EMAILS` | Variable | 精算画面を開けるメール。複数はカンマ区切り |
| `ANTHROPIC_API_KEY` | Secret | 写真・自由入力AIヒント用 |
| `ANTHROPIC_MODEL` | Variable | 任意。未指定時は既定モデル |

`wrangler.jsonc` のCronは毎日00:05（日本時間）に起動し、毎月1日だけ前月分を締めます。精算画面を開いた場合も過去月は締め処理されます。運用手順と利用者向け文案は [`docs/referral-program.md`](docs/referral-program.md) にあります。

## 動作確認

```bash
npm run build
npm run preview
```

Stripe CLIまたはStripe DashboardからテストWebhookを送り、次を確認します。

- 1〜100人目は300円、101人目以降は480円でCheckoutが作られる
- 同じ `invoice.paid` を再送しても紹介報酬は1件のまま
- 未払い・返金・チャージバックが報酬対象にならない
- 管理者以外は月末精算APIを開けない
- 「送金済みにする」でメール、件数、金額、日時が保存される

## プロジェクト構成

```
worker/index.js                  # Cloudflare Worker API / Stripe Webhook / 月末Cron
database/schema.sql             # Neonテーブル・集計View・精算Function
docs/referral-program.md        # 紹介制度の表示文案と月次運用
public/characters/               # 5タイプ×4段階の進化WebP画像
src/
├── main.jsx                     # エントリーポイント
├── App.jsx                      # メインアプリ（画面遷移管理）
├── context/AccountContext.jsx   # Neon Auth・会員状態・学習同期
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
│   ├── RewardPage.jsx           # 進化ロードマップ・スタンプ画面
│   └── AccountPage.jsx          # Stripe申込・紹介実績・管理者精算
├── services/
│   ├── authClient.js            # Neon Authクライアント
│   ├── hintService.js           # フロント側AI API呼び出し
│   └── problemGenerator.js      # 87単元の問題生成・採点
└── hooks/
    └── useStamps.js             # スタンプ管理フック
```

## 技術スタック

- Vite + React（フロントエンド）
- Cloudflare Workers（API・静的配信・月末Cron）
- Neon Postgres / Neon Auth（会員・学習・紹介実績）
- Stripe Checkout / Billing（継続課金・先着100名割引）
- Anthropic Claude API（AI ヒント生成・画像読み取り）
- PayPay（紹介報酬の手動送金）
