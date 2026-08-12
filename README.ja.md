<h1 align="center">WinPilot</h1>

<p align="center">
  動いている画面そのものを原本とし、<br />
  デザインとコードがずれないよう繋ぎ止める運用プラットフォームです。<br />
  コマース・IR・外食フランチャイズという三つの製品の顧客画面と運用コンソール、そして社内コンソールまで<br />
  七つのアプリが、ひとつの用語集とひとつのデザイントークンを共有します。
</p>

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm&logoColor=white" />
</p>

<p align="center">
  <a href="./README.md">한국어</a> ·
  <a href="./README.en.md">English</a> ·
  <a href="./README.zh.md">中文</a> ·
  <strong>日本語</strong>
</p>

---

## 背景

デザインとコードは、はじめは同じに見えていても静かに枝分かれします。分かれ目はたいていレイアウトではなく**言葉**です。顧客画面で `product` と呼んでいたものを管理画面で `item` と呼び始めた時点で、二つの実装を機械的に突き合わせる手立ては失われます。そこから先は「どちらが正しいのか」を毎回人が判断することになります。

Figma とコードを手で合わせるやり方も同じ壁にぶつかります。静的解析でコードからデザインを取り出すには、`lab()` の色、`calc()` の行高、グリフ単位のフォントフォールバック、空白の畳み込みまで、ブラウザのレイアウトエンジンを作り直す必要があります。そうして得た値は結局、実際の画面とは異なります。

このリポジトリは逆の方向を選びました。**動いている画面が原本です。** ブラウザが計算した値をそのまま読み取って中間表現（UIR）にし、それを元に Figma を描きます。そして名前がずれることは、人の注意ではなく検査器が防ぎます。

## 目的

- **名前をひとつに保つ** — 機能・エンティティ・ルート・コンポーネント名・i18n キー・テスト ID・Figma フレーム名は、すべてひとつのレジストリから導かれます。そこを通さなかった名前は `pnpm spec:check` が捕まえます。
- **デザインをひとつに保つ** — 色・余白・フォント・モーションは `@winpilot/tokens` の一か所にあり、すべてのアプリがそこから受け取ります。アプリが自前の色を宣言した瞬間、デザインシステムは二重になります。
- **画面のそばに文書を置く** — 設計文書はアプリの中にあり、URL で開けます（`/docs/ia`、`/docs/path`）。七つのアプリが同じ十四の文書ルートを持ち、画面ひとつが文書ひとつです。文書を直さずに画面だけ直せば、`pnpm docs:check` が捕まえます。
- **テンプレートは複数、でも分岐させない** — 顧客画面のテンプレートは配置だけが異なり、値・文言・ルート・スロット名はすべてひとつの契約（`@winpilot/client-content`）から来ます。

## 使用言語とライブラリ

| 区分 | 採用 | 備考 |
| --- | --- | --- |
| 言語 | TypeScript 5.7 | `strict`、全パッケージ共通の設定 |
| フレームワーク | Next.js 16（App Router）· React 19 | サーバーコンポーネントが既定 |
| スタイル | Tailwind CSS 4 | CSS-first の `@theme`、トークンは CSS 変数へコンパイル |
| フォント | Pretendard · JetBrains Mono | すべて自前ホスティング — 総称ファミリーは Figma に存在しません |
| パッケージ | pnpm workspace | アプリ・パッケージ・ツールをひとつのリポジトリに |
| 検証 | Zod · Playwright · pngjs | スキーマ・キャプチャ・ピクセル比較 |
| 実行 | tsx · esbuild | ツールスクリプトと Figma プラグインのバンドル |

チャート・Markdown・アイコンは**ライブラリを使わず自前で描いています。** 多くのチャートライブラリは canvas に描きますが、canvas はピクセルの塊であり、抽出器は一枚の画像としてしか受け取れません。SVG 要素は本物の DOM ノードなのでベクターとして復元され、軸の目盛りやラベルもテキストのまま残ります。

## ディレクトリ

```
WinPilot-Product/
├── apps/                                     製品三つ ×（顧客画面 + 運用コンソール）+ 社内
│   ├── b2c-client-a/       コマース顧客画面 · テンプレート A (3310)
│   ├── b2c-admin/          コマース運用コンソール (3301)
│   ├── ir-client-a/        IR サイト · テンプレート A (3304)
│   ├── ir-admin/           IR 運用コンソール (3303)
│   ├── fnb-client-a/       外食ブランドサイト · テンプレート A (3305)
│   ├── fnb-admin/          外食ブランド運用コンソール (3306)
│   └── internal-admin/     社内向け顧客管理コンソール (3302)
│
├── packages/
│   ├── spec/               機能レジストリ · 用語集 · 命名検査器
│   ├── tokens/             デザイントークン (theme.css) — 全アプリ唯一の出所
│   ├── store/              保存された値 — 管理画面と顧客画面が共に読むひと組
│   ├── ui/                 アプリ間で共有する UI プリミティブ
│   ├── docs/               文書ルートが使う部品 — 読み込み (fs) と描画を入口から分離
│   ├── client-content/     顧客画面のコンテンツ契約 — テンプレート A~F が共有
│   ├── geo/                行政区画のジオメトリ — 地図画面が共に読む
│   └── uir/                UI 中間表現スキーマ · 許容誤差の定義
│
├── tools/
│   ├── extractor/          動いている画面 → UIR（Playwright）
│   └── verifier/           数値 · ピクセルの二段検証
│
├── figma-plugin/           UIR → Figma ノード
└── docs/
    ├── spec/               Path · 命名規則 · フロー · IA · コンポーネント · デザインシステム · 機能 · 非機能
    └── architecture/       パイプライン設計
```

各アプリはそれぞれの `pages.manifest.ts` を持ちます。Figma ページの順番と名前は、その一つのファイルだけで決まります。

製品ごとに**顧客画面と運用コンソールがひと組**です。同じ資源を両側で扱うため、片側にしかない機能は抜け落ちを疑い、`pnpm spec:check` がその組を数えます。社内コンソールは顧客企業を管理する別の製品なので、組む相手がありません。

データは `packages/store` の一か所にしかありません。管理画面の `lib/data/*` はそれを再エクスポートするだけで、顧客画面は `client-content` を通して同じ値を読みます — シードを二組持てば、管理画面で見たものと顧客画面が食い違い、そこからどちらが正しいのか分からなくなります。

## 実行方法

### 準備

```bash
# Node 20 以上、pnpm 9 以上
pnpm install
```

### 開発サーバー

```bash
pnpm dev:client      # コマース顧客画面        http://localhost:3310
pnpm dev:admin       # コマース運用コンソール  http://localhost:3301
pnpm dev:ir          # IR サイト               http://localhost:3304
pnpm dev:ir-admin    # IR 運用コンソール       http://localhost:3303
pnpm dev:fnb         # 外食ブランドサイト      http://localhost:3305
pnpm dev:fnb-admin   # 外食運用コンソール      http://localhost:3306
pnpm dev:internal    # 社内コンソール          http://localhost:3302
```

`pnpm -r dev` で一度に立ち上げることはしません — ひとつが落ちると残りも一緒に落ち、どれが先に落ちたのかログに残らないからです。

### 検査

```bash
pnpm spec:check      # 命名 · ルート · マニフェストの整合（エラーがあれば終了コード 1）
pnpm spec:matrix     # 機能 ↔ ビューの対応表を出力
pnpm sync:check      # レジストリのコンポーネント名が実ファイルでも同じ名前か
pnpm docs:check      # 画面 ↔ 文書 — IA · フロー · 機能仕様が欠けた画面を数える
pnpm docs:build      # 原本（lib/screen-specs.ts）から機能・非機能仕様を展開
pnpm overflow:check  # 四つの幅で横あふれを計測（開発サーバーの起動が必要）
pnpm typecheck       # ワークスペース全体の型検査
pnpm build           # 全体ビルド
```

検査器を複数持つのは、それぞれが**別の種類のずれ**を見ているからです。`spec:check` はレジストリの中の規則しか見ないため、登録だけしておいて別の名前でファイルを作っても通ってしまいます — その隙間を `sync:check` が捕まえます。画面をひとつ増やすときに手を入れる場所は四つ（マニフェスト · IA · フロー · 仕様）あり、ひとつ抜けてもアプリは平然と動いてしまうので `docs:check` が数えます。

### デザイン同期

```bash
pnpm ssot:tokens                    # トークンを UIR 形式で書き出す
pnpm ssot:extract --app b2c-admin   # 動いている画面をキャプチャして UIR を生成
pnpm ssot:verify                    # 数値（ε=1e-4）とピクセルの二段検証
pnpm ssot:selftest                  # 検証器の自己テスト（7 シナリオ）

pnpm figma:build                    # Figma プラグインをバンドル
```

`ssot:extract` は開発サーバーが起動している必要があります。生成物は `artifacts/` に置かれ、コミットしません。

### 文書を読む

開発サーバーを立ち上げ、URL で直接開きます。**七つのアプリが同じルートを持ちます** — 以下はコマース顧客画面（3310）の例で、ポートを変えれば残りの六つも同じです。

```
http://localhost:3310/docs                     概要 — 文書の系統と画面一覧
http://localhost:3310/docs/ia                  IA — 全体図と画面ごとの図
http://localhost:3310/docs/flow-chart          フロー図 — ジャーニーと画面ごとの流れ
http://localhost:3310/docs/fsd                 機能仕様書 — 画面ひとつが文書ひとつ
http://localhost:3310/docs/nfs                 非機能仕様書 — ポリシーひとつが文書ひとつ
http://localhost:3310/docs/page-view           画面ごとに三つの幅のキャプチャ
http://localhost:3310/docs/components          コンポーネント定義書
http://localhost:3310/docs/design-system       デザインシステム
http://localhost:3310/docs/path                Path 定義書
http://localhost:3310/docs/coding-conventions  命名規則定義書
http://localhost:3310/docs/admin-mapping       管理画面連携 — どの値がどこから来るか
http://localhost:3310/docs/prompt              この文書群を作り直すときのプロンプト
```

社内コンソールだけは、最後から二番目が `/docs/deployment-mapping` です — そのコンソールで決めた値は、顧客画面ではなく**顧客企業のデプロイ**へ向かいます。

機能・非機能仕様は**生成物**です。原本は各アプリの `lib/screen-specs.ts` にあり、`pnpm docs:build` が展開します — 手で書けば画面を直したときに文書だけが残り、残された文書はやがて嘘になります。
