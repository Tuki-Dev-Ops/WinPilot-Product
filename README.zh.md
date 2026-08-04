<h1 align="center">WinPilot</h1>

<p align="center">
  以「正在运行的页面」为唯一事实来源，<br />
  让设计与代码不再各走各路的电商运营平台。<br />
  顾客页面、运营后台、内部控制台共用一套术语表与一套设计令牌。
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
  <strong>中文</strong> ·
  <a href="./README.ja.md">日本語</a>
</p>

---

## 背景

设计与代码起初看着一致，随后会悄悄分岔。分岔往往不是从布局开始，而是从**用词**开始。顾客页面叫 `product`，后台却开始叫 `item`，两边的实现就再也无法机械配对，此后每次都得靠人判断「哪一边才对」。

手工同步 Figma 与代码也是同样的困境。要用静态分析从代码里还原设计，等于重新实现一遍浏览器的排版引擎：`lab()` 颜色、`calc()` 行高、字形级字体回退、空白折叠。即便做出来，结果仍与真实页面不同。

本仓库选了相反的方向。**正在运行的页面就是原本。** 直接读取浏览器算好的值，转成中间表示（UIR），再据此绘制 Figma。而名称是否走样，由检查器把关，不依赖任何人的注意力。

## 目的

- **一物一名** —— 功能、实体、路由、组件名、i18n 键、测试 ID、Figma 画板名全部由同一份注册表派生。没走这条路的名字会被 `pnpm spec:check` 拦下。
- **设计只有一份** —— 颜色、间距、字体、动效集中在 `@winpilot/tokens`，所有应用都从这里取用。应用一旦自行声明颜色，设计系统就变成了两套。
- **文档贴着页面放** —— 设计文档就在应用内部，可用网址直接打开（`/ia`、`/path`）。只改页面不改文档，立刻会暴露出来。
- **多套模板，但不分岔** —— 顾客页面模板只在布局上不同，取值、文案、路由、插槽名都来自同一份契约（`@winpilot/client-content`）。

## 使用语言与库

| 分类 | 选用 | 说明 |
| --- | --- | --- |
| 语言 | TypeScript 5.7 | `strict`，各包共用同一份配置 |
| 框架 | Next.js 16（App Router）· React 19 | 默认使用服务端组件 |
| 样式 | Tailwind CSS 4 | CSS-first `@theme`，令牌编译为 CSS 变量 |
| 字体 | Pretendard · JetBrains Mono | 全部自托管 —— 通用字体族在 Figma 中并不存在 |
| 包管理 | pnpm workspace | 应用、包、工具集中在一个仓库 |
| 校验 | Zod · Playwright · pngjs | 模式校验、截图、像素比对 |
| 运行 | tsx · esbuild | 工具脚本与 Figma 插件打包 |

图表、Markdown、图标**不引第三方库，直接手写**。多数图表库绘制到 canvas，而 canvas 是一整块像素，抽取器只能当作一张图接收。SVG 元素是真正的 DOM 节点，能还原为矢量，坐标轴刻度也仍是文本。

## 目录

```
WinPilot-Product/
├── apps/
│   ├── b2c-client-a/       顾客页面 · 模板 A (3310)
│   ├── b2c-admin/          运营后台 (3301)
│   └── internal-admin/     内部客户管理控制台 (3302)
│
├── packages/
│   ├── spec/               功能注册表 · 术语表 · 命名检查器
│   ├── tokens/             设计令牌 (theme.css) —— 所有应用的唯一来源
│   ├── store/              已保存的数据 —— 后台与顾客页面共读的同一份
│   ├── ui/                 各应用共享的 UI 基础组件
│   ├── client-content/     顾客页面内容契约 —— 模板 A~F 共用
│   └── uir/                UI 中间表示模式 · 容差定义
│
├── tools/
│   ├── extractor/          运行中的页面 → UIR（Playwright）
│   └── verifier/           数值 · 像素两段校验
│
├── figma-plugin/           UIR → Figma 节点
└── docs/
    ├── spec/               路径 · 命名规范 · 流程 · IA · 组件 · 设计系统 · 功能 · 非功能
    └── architecture/       流水线设计
```

每个应用各自持有 `pages.manifest.ts`。Figma 页面的序号与名称只在那一个文件里决定。

数据只存在于 `packages/store`。后台的 `lib/data/*` 仅做再导出，顾客页面则经由 `client-content` 读取同一份值 —— 若保留两份种子数据，后台所见与顾客页面就会不同，届时无从判断哪一边为准。

## 运行方法

### 准备

```bash
# Node 20 以上，pnpm 9 以上
pnpm install
```

### 开发服务器

```bash
pnpm dev:client      # 顾客页面模板 A   http://localhost:3310
pnpm dev:admin       # 运营后台        http://localhost:3301
pnpm dev:internal    # 内部控制台      http://localhost:3302
```

### 检查

```bash
pnpm spec:check      # 命名 · 路由 · 清单一致性检查（有错误则以状态码 1 退出）
pnpm spec:matrix     # 输出功能 ↔ 视图对照表
pnpm typecheck       # 整个工作区类型检查
pnpm build           # 全量构建
```

### 设计同步

```bash
pnpm ssot:tokens                    # 将令牌导出为 UIR 格式
pnpm ssot:extract --app b2c-admin   # 截取运行中的页面并生成 UIR
pnpm ssot:verify                    # 数值（ε=1e-4）与像素两段校验
pnpm ssot:selftest                  # 校验器自检（7 个场景）

pnpm figma:build                    # 打包 Figma 插件
```

`ssot:extract` 需要开发服务器处于运行状态。产物落在 `artifacts/`，不纳入提交。

### 查看文档

启动开发服务器后用网址直接打开。

```
http://localhost:3310/docs            文档目录与页面清单
http://localhost:3310/ia              信息架构
http://localhost:3310/path            路径定义书
http://localhost:3310/component       组件定义书
```
