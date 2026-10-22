# 林鑫祥 · 作品集网站（React + Vite）

AI Agent 开发方向个人作品集，纸白主题 / 青铜单点高光 / 1700px 版心 / PC 优先。

## 跑起来

```powershell
cd 'C:\Users\asus\OneDrive\桌面\作品集\site'
npm install          # 已装好，跳过也行
npm run dev          # http://127.0.0.1:5173
npm run build        # 产物在 dist/，纯静态，可丢任何静态托管
npm run preview      # 预览生产构建 http://127.0.0.1:4173
```

## 目录

```
site/
├─ index.html                 # 入口（favicon / theme-color 内联）
├─ vite.config.js
├─ package.json
├─ public/
│  └─ thumbs/                 # 7 张 1600×1000 SVG 项目缩略图（脚本生成）
├─ scripts/
│  ├─ make_thumbs.py          # 重新生成缩略图：用系统 python 跑
│  └─ shot.mjs                # 用本机 Edge 无头截图到 ../_preview（回归自查用）
└─ src/
   ├─ main.jsx
   ├─ App.jsx                 # Nav + Hero + Experience + Projects + Strengths + Contact
   ├─ data.js                 # ★ 所有文案、数字、项目、联系方式都在这里
   ├─ hooks.js                # useReveal / useCountUp / useScrollProgress / useCopy
   ├─ styles.css              # 全部样式与响应式断点
   └─ components/
      ├─ Nav.jsx  Hero.jsx  HeroBackground.jsx
      ├─ Experience.jsx  Projects.jsx  Strengths.jsx  Contact.jsx
```

## 改内容的三个入口

1. **文案与数字** → `src/data.js`。`profile`（姓名/角色/大标题/联系方式）、`stats`（首页数据条）、`timeline`（经历）、`projects`（主推 3 个）、`moreProjects`（04–07）、`strengths`（能力卡）、`navItems`。
2. **项目配图** → 真实截图在 `..\data\*.png`，已复制成 `public\thumbs\01-zhenxiao.png` … `07-viz.png` 并接到 `data.js`。换图就覆盖同名文件，不用改代码。旧的 `*.svg` 示意图仍留在目录里做备份，没有引用。
3. **视频背景** → 放一个 `public/media/hero.mp4`，页面加载时会自动 HEAD 探测并切换成视频背景；没有就用内置 3D 场景。

## 配色（纸白主题）

参考 [RhineLabUI](https://github.com/LBEILC/RhineLabUI) 的「莱茵生命终端」观感：暖纸白底 + 近黑墨色 + 青铜单点高光 + 1px hairline。全套颜色只在 `styles.css` 的 `:root` 里：

| 令牌 | 值 | 用在哪 |
| --- | --- | --- |
| `--paper-rgb` | `232, 229, 225` | 底色 `--bg: #e8e5e1`、遮罩、导航毛玻璃 |
| `--ink-rgb` | `18, 20, 14` | 正文 `--fg: #14170f`、所有 hairline / 阴影 |
| `--warm-rgb` | `120, 104, 78` | body 大面积暖灰晕染、首屏柔光 |
| `--acc-rgb` | `166, 125, 72` | 高光 `--acc: #a67d48`（圆点、hover、徽标） |

改了这四行就等于换肤；CSS 里已经没有写死的深色值，`rgba(255,255,255,…)` 全部换成了 `rgba(var(--ink-rgb), …)`。

## 背景与光标

- `src/components/HeroScene.jsx`：**手写 3D 场景，纯 Canvas 2D 手动投影，不引 three.js**。3200 个斐波那契球面点云（墨 → 暖灰 → 青铜渐变）+ 520 颗星尘 + 20 面体细分一次的线框（42 顶点 / 120 边），`source-over` 直接压在纸面上。鼠标视差、滚出首屏时整体放大淡出、离开视口停 rAF、`prefers-reduced-motion` 只画一帧。
  - 想调大小/位置：`size()` 里的 `unit`（球半径，现为 `min(w,h)*0.375/RAD`）、`cx/cy`（球心，`0.795w / 0.46h`）
  - 想调密度/亮度：`buildPoints(...)` 的数量、点云里的 `a`（alpha）与 `r`（半径）、线框的 `rgba(18,20,14, …)` 两段系数
- `src/components/Cursor.jsx`：青铜实心点贴手 + 描边环延迟跟随（lerp 0.17），落到 `a/button/.case/.more-row/.strength/.copy` 上时环放大到 54px、点缩到 4px；触屏或「减少动态效果」下完全不接管（`html.cursor-on` 才会 `cursor: none`）。
- `body` 上有三层低透明度暖色径向渐变（右上 `rgba(120,104,78,.1)`、左上青铜 `.055`、底部 `.08`），`background-attachment: fixed`，滚动时保持不动。

## 主标题悬停弹跳

- `src/components/Chars.jsx`：导出 `Chars`（把标题文本拆成 `<span class="char">`，英文/数字连成一个 token，避免把 `AI` 拆到两行）和 `useBounceHover()`（返回要挂到标题元素上的 ref）。
- 指针进入标题时，每个字按 15–18ms 依次跑一次 WAAPI 关键帧：`translateY(-0.14em) rotate(-1.1deg)` → 回弹 +0.015em → 归零，`cubic-bezier(.32,1.42,.52,1)`，锁 1 次防重入。
- 已接入 5 处：Hero `<h1>`、`#profile h2`、`#work h2`、`#capabilities h2`、`#contact h2`。想加新标题：`<h2 ref={titleRef}><Chars text="…" /></h2>`，组件里 `const titleRef = useBounceHover()`。
- 拆字后每个 `.char` 是 `inline-block`，长标题换行不会吞掉空格；`prefers-reduced-motion` 下不挂监听。

## Rhine 三特征（档案盒 / 解密文字 / 滚动数字）

这三个是「借一点」的强特征，都有强度旋钮，觉得过了就往下调。

- **解密文字** `src/components/DecryptText.jsx`
  - 用法：`<DecryptText text="…" />`，可选 `speed`（每字毫秒，默认 26）、`hold`（起始停顿，默认 220）
  - 首次进入视口（IntersectionObserver threshold .2）时逐字揭示，未揭示位从中文常用字池 + 符号池随机取字，直接写 `textContent` 不走 React 重渲染，完成后落终稿
  - 已接入 5 处：Hero `.hero__lede`、`#profile` / `#work` / `#capabilities` 的 lede、案例区导语
  - 太吵就调 `speed={12}`；`prefers-reduced-motion` 下直接出终稿
- **滚动数字** `src/components/RollingNumber.jsx`
  - 用法：`<RollingNumber value={7} suffix="万" active={shown} />`
  - 每位数字是一列 `0–9`，用 `translateY(-N em)` 停到目标位，错峰 `stagger`（默认 70ms），缓动 `cubic-bezier(.22,1.16,.3,1)`
  - 已接入「经历」四格数据（`Experience.jsx` 的 `Stat`），不再用 `useCountUp`
  - 想更慢改 CSS `.rollnum__strip` 的 `transition: transform 1.15s`；想改错峰传 `stagger`
- **档案盒** `#work` 的 `.case`
  - 玻璃纸面：`repeating-linear-gradient` 纸纹（ink .02 / 8px）+ 顶部白高光 + 底部纸色收边 + `inset` 细线
  - 四角括角由 `Projects.jsx` 里的 `<span className="case__ticks"><i/>×4</span>` 提供，inset 9px、臂长 14px，样式在 CSS `.case__ticks`
  - 顶部青铜封条 `.case::before`（112×2px 渐变），编号 `.case__num` 做成档案标签（纸底 + 青铜字 + 0.22em 字距）
  - hover：边框转青铜 .34 + 上抬 2px（reduced-motion 下不抬）

> `.case` 必须是 `position: relative`，否则括角和封条会跑到最近的定位祖先上（这个坑踩过一次，表现为「加了 CSS 但啥也看不见」）。

## 案例详解弹层

- 卡片的「查看案例详解」和左侧截图都是 `<button>`，点了在当前页打开 `.detail` 弹层，**不跳二级页、不改 hash、不刷新**。
- 内容来自 `src/data.js` 里每个项目的 `detail` 字段：`role` / `period` / `stack` / `blocks[]`（每条 `{ t, p }`）/ `metrics[]`（`[标签, 值]` 二元组）。想加一节就往后 push 一个 block。
- 组件是 `src/components/CaseDetail.jsx`：点遮罩、按 Esc、点右上「关闭 ESC」都能退；打开时锁 `body` 滚动，关闭还原；`role="dialog" aria-modal="true"`。
- 再加案例时不需要动弹层代码，只要在 `projects` 里补 `detail`，`blocks` 缺省也不会报错（`CaseDetail` 里有兜底）。
- 想要真正的二级页（可分享链接、可被搜索引擎单独收录）就得引入路由：把 `Projects` 拆成列表页 + `/work/:id` 详情页，`detail` 数据不用改。

## 弹层里的视频（短片 / 长演示两种模式）

- 项目 02（企业年报 RAG）的弹层左侧是 `<video>`，卡片列表仍然用静态 PNG（两张分开，不互相拖慢首屏）。
- `detail.video` 支持两种写法，也兼容纯字符串（等于 `{ src }`）：

```js
// A. 循环短片（6–15 秒），自动播、静音、循环、无控件
video: { src: '/media/02-rag.webm', duration: 9, caption: '无声循环演示' }

// B. 长演示（1–10 分钟），不自动播，点播放条才开始，带时长标签
video: { src: '/media/02-rag.mp4', poster: '/thumbs/02-rag.png', duration: 372, autoplay: false, caption: '产品演示' }
```

- 判定规则在 `src/components/CaseDetail.jsx`：`duration > 30` 或 `autoplay === false` → 长视频模式（`controls`、不 `loop`、不 `autoPlay`、`preload="metadata"`）。
- `onError` 一律退回静态图，文件丢了不会白屏。
- 换成自己的录屏：文件丢进 `site\public\media\`，改 `detail.video.src`；`.mp4`（H.264）和 `.webm` 浏览器都认。
- 封面不用 ffmpeg：`node scripts/poster-from-video.mjs "http://127.0.0.1:5173/media/02-rag.mp4" public/media/02-rag-poster.png 86`（无头 Edge seek 到第 86 秒抽一帧）。**URL 模式必须先落到同源页面**，否则 `about:blank` 是不透明源，媒体会被拦并报 `video decode failed`。
- 批量抽帧比对：`node scripts/frames.mjs http://127.0.0.1:5173/media/02-rag.mp4 ../_preview/f02 8,16,24,40,56,72,86`（一次开浏览器，按秒数出多张 PNG）。
- 读时长/分辨率/有无音轨（不装 ffmpeg）：`node scripts/probe-mp4.mjs public/media/01-zhenxiao.mp4`。

### 现有两个真机录屏（2026-10 接入）

| 项目 | 文件 | 时长 | 体积 | 音轨 | 形态 |
| --- | --- | --- | --- | --- | --- |
| 01 诊小通 | `public\media\01-zhenxiao.mp4` | 2:32 | 31.8 MB | 有（播放时 `muted`） | 深色衬底 + contain（取景会漂，不能裁） |
| 02 企业年报 RAG | `public\media\02-rag.mp4` | 0:30 | 1.7 MB | 有（播放时 `muted`） | `bleed: true` → 裁掉黑边满幅 |

- **录屏是整屏桌面**，开头带浏览器标签栏（含个人标签页）、末尾带任务栏。所以：
  - 封面（poster）用 PIL 裁成只剩应用区域（1904×846 / 1888×862），再存成 `*-poster.png`；
  - 播放时用 `.detail__shot--wide video { aspect-ratio: 2.25; object-fit: cover; object-position: 50% 33% }` 裁掉上下，只露出应用本身——**改录屏比例或换了机器分辨率就要重调这两个值**。
- 文件自带音轨删不掉（本机无 ffmpeg），但 `<video muted>` 保证浏览器里完全无声。
- 47 MB 那条首屏不下载（`preload="metadata"`），点播放才开始拉；真要瘦身得靠 HandBrake 重压或重录短版。

- 录制分镜、码率、体积控制、剪辑要点：见 [docs\录案例视频.md](docs\录案例视频.md)。

## 现在的占位项（必须替换）

- 邮箱 `linxinxiang@example.com`、GitHub `github.com/linxinxiang`、电话 `138-0000-0000`
- 经历时间线里的组织名与时间区间需按实际投递口径核对

## 已内置的克制设计约定

- 圆角只有 2–4px，线宽 1px，`--line: rgba(18,20,14,.16)`；高光色全局只有一个青铜 `#a67d48`
- 数字统一 tabular-nums；英文/编号统一 mono + 0.16em 字距
- 入场只做一次 translateY + opacity（`.reveal`，IntersectionObserver），不做循环动画
- `prefers-reduced-motion` 下所有动画降级为直出
- 0 依赖 UI 库（无 Tailwind / 无组件库），只依赖 react + react-dom
- `#work` 下方 04–07 行（`.more-row`）的缩略图是 `width:100% + aspect-ratio:16/9`，跟着栅格列宽走；不要写死像素宽，否则 ≤1180px 会溢出压到标题
