<h1 align="center">WinPilot</h1>

<p align="center">
  動いている画面そのものを原本とし、<br />
  デザインとコードがずれないよう繋ぎ止めるコマース運用プラットフォームです。<br />
  顧客画面・運用管理・社内コンソールが、ひとつの用語集とひとつのデザイントークンを共有します。
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
- **画面のそばに文書を置く** — 設計文書はアプリの中にあり、URL で開けます（`/ia`、`/path`）。文書を直さずに画面だけ直せば、すぐに露見します。
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
├── apps/
│   ├── b2c-client-a/       顧客画面 · テンプレート A (3310)
│   ├── b2c-admin/          運用管理 (3301)
│   └── internal-admin/     社内向け顧客管理コンソール (3302)
│
├── packages/
│   ├── spec/               機能レジストリ · 用語集 · 命名検査器
│   ├── tokens/             デザイントークン (theme.css) — 全アプリ唯一の出所
│   ├── store/              保存された値 — 管理画面と顧客画面が共に読むひと組
│   ├── ui/                 アプリ間で共有する UI プリミティブ
│   ├── client-content/     顧客画面のコンテンツ契約 — テンプレート A~F が共有
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

データは `packages/store` の一か所にしかありません。管理画面の `lib/data/*` はそれを再エクスポートするだけで、顧客画面は `client-content` を通して同じ値を読みます — シードを二組持てば、管理画面で見たものと顧客画面が食い違い、そこからどちらが正しいのか分からなくなります。

## 実行方法

### 準備

```bash
# Node 20 以上、pnpm 9 以上
pnpm install
```

### 開発サーバー

```bash
pnpm dev:client      # 顧客画面テンプレート A   http://localhost:3310
pnpm dev:admin       # 運用管理                http://localhost:3301
pnpm dev:internal    # 社内コンソール          http://localhost:3302
```

### 検査

```bash
pnpm spec:check      # 命名 · ルート · マニフェストの整合検査（エラーがあれば終了コード 1）
pnpm spec:matrix     # 機能 ↔ ビューの対応表を出力
pnpm typecheck       # ワークスペース全体の型検査
pnpm build           # 全体ビルド
```

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

開発サーバーを立ち上げ、URL で直接開きます。

```
http://localhost:3310/docs            文書一覧と画面一覧
http://localhost:3310/ia              情報設計
http://localhost:3310/path            Path 定義書
http://localhost:3310/component       コンポーネント定義書
```
