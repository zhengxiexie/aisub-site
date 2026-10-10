# Ailyre 网站技术栈深度分析

## 🎯 核心发现

### 技术架构

**Ailyre 使用纯静态架构：**
- ❌ 无 React、Vue、Next.js 等框架
- ✅ 原生 HTML5 + CSS3 + Vanilla JavaScript
- ✅ 模块化加载（每个功能独立 JS/CSS 文件）
- ✅ 版本管理（查询字符串版本戳）

### 配色方案

```css
/* Ailyre 主色调 */
--lyre-blue:   #263879  /* 深蓝色 - 竖琴主体 */
--robot-gold:  #bb8749  /* 金色 - 机器人 */
--bg-light:    #f0f4f7  /* 浅灰蓝 - 浅色背景 */

/* AISub 原有色 */
--accent:      #6B73F2  /* 主紫色 */
--accent-2:    #9E66F2  /* 辅紫色 */

/* 融合策略 */
保留 AISub 的紫色系（品牌识别）
+ 引入 Ailyre 的金色点缀（温暖感）
+ 借鉴深蓝色用于辅助元素
```

## 📐 设计元素对比

### 1. 背景系统

#### Ailyre
```html
<div class="ambient ambient-one"></div>    <!-- 环境光 1 -->
<div class="ambient ambient-two"></div>    <!-- 环境光 2 -->
<div class="edge-orbits">                 <!-- 边缘轨道 SVG -->
```

**特点：**
- 双层环境光渐变
- SVG 椭圆轨道装饰
- 静态+动态结合

#### AISub（重构后）
```html
<div class="aurora">              <!-- 极光效果 -->
  <span></span>                   <!-- 3 层渐变球 -->
  <span></span>
  <span></span>
</div>
<div class="grid-tex"></div>     <!-- 网格纹理 -->
```

**特点：**
- 三层渐变球体飘移动画
- 径向渐变网格遮罩
- 更有科技感

### 2. 交互组件

#### Ailyre 核心交互

1. **可拖拽机器人**
   - 拖拽时发出音效
   - 碰撞边界弹回
   - 拖拽距离触发「眩晕」

2. **拨弦系统**
   - 三根琴弦独立音符
   - SVG 路径动画
   - 音频反馈

3. **播放器控制**
   - 点击 Logo 播放音乐
   - 音量滑块
   - 静音开关

4. **思想泡泡**
   - 随机出现中英文句子
   - Canvas 烟花效果
   - 朗读功能

5. **花园种植**
   - 点击种下灵感种子
   - 最多 12 颗
   - 视觉反馈动画

#### AISub 保留/新增

✅ **保留：**
- 滚动渐入动画
- 导航栏滚动效果
- 语言切换下拉菜单
- 主题切换按钮
- 图片灯箱放大

🆕 **新增：**
- 背景光晕动画
- 网格纹理层
- 导航栏模糊背景（backdrop-filter）
- 卡片悬停 3D 提升效果

## 🎨 CSS 架构对比

### Ailyre 的文件结构

```
/styles.css                 # 主样式入口
/extensions.css             # 扩展组件
/lyre-music.js/css          # 音乐播放器
/lyre-scroll.js/css         # 滚动导航
/robot.js/css               # 机器人交互
/string-play.js/css         # 拨弦系统
/readability.css            # 可读性优化
/composition.css            # 布局系统
/site-header.js/css         # 站点头部
/bubble-type.css            # 思想气泡
/showcase.css               # 项目展示
/mobile-home.css            # 移动端首页
/rss-links.js/css           # RSS 链接
/email-suggestion.js/css    # 邮件建议
```

**模块化原则：**
- 每个功能独立文件
- JS 和 CSS 配对
- 版本戳缓存管理

### AISub（重构后）

```
/assets/css/
  ├── tokens.css            # 设计令牌（变量定义）
  ├── base.css              # 基础重置
  ├── backgrounds.css       # 背景动画
  ├── components.css        # UI 组件库
  ├── navigation.css        # 导航专用
  └── style.css             # 主样式

/assets/js/
  ├── navigation.js         # 导航交互
  ├── reveal.js             # 渐入动画
  ├── i18n.js               # 国际化
  └── main.js               # 主逻辑
```

## 🔍 关键技术细节

### 1. 版本管理

**Ailyre 方案：**
```html
<link rel="stylesheet" href="/styles.css?v=20261009T152445Z">
<meta name="ailyre-version" content="20261009T152445Z">
```

- 时间戳格式：ISO 8601 风格
- 全站统一版本号
- 可追踪部署时间

**AISub 可以采用：**
```bash
# 在 GitHub Actions 中自动注入
VERSION=$(date -u +"%Y%m%dT%H%M%SZ")
sed -i "s/style.css/style.css?v=$VERSION/g" index.html
```

### 2. 国际化实现

**Ailyre 方案：**
```html
<h1><span id="title-one">Small sparks.</span></h1>
<button id="lang-toggle">文/A</button>

<script src="/i18n.js"></script>
```

**AISub 方案：**
```html
<h1 data-i18n="hero.title"></h1>

<script src="assets/js/i18n.js"></script>
<script src="assets/js/locales/zh-Hans.js"></script>
```

- `data-i18n` 属性标记
- JSON 语言包
- LocalStorage 记忆选择

### 3. 性能优化

#### Ailyre 的策略

```html
<!-- 延迟加载非关键 JS -->
<script src="/app.js?v=20261009T152445Z" defer></script>
<script src="/extensions.js?v=20261009T152445Z" defer></script>

<!-- 音频预加载控制 -->
<audio id="ambient-music" preload="none" src="/audio/gymnopedie-no-1.mp3"></audio>
```

#### AISub 可以改进

```html
<!-- 关键 CSS 内联 -->
<style>
  /* tokens.css 的关键部分 */
  :root { --accent: #6B73F2; }
</style>

<!-- 图片懒加载 -->
<img src="placeholder.jpg" data-src="real.jpg" loading="lazy">

<!-- JS 延迟加载 -->
<script src="navigation.js" defer></script>
```

## 🎭 动画技术

### Ailyre 的动画系统

```css
/* 轨道旋转 */
@keyframes orbit-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 飘移动画 */
@keyframes drift {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(30px, -20px, 0); }
}

/* 渐入渐出 */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**动画原则：**
- 使用 `transform` 和 `opacity`（硬件加速）
- `cubic-bezier` 自定义缓动
- `will-change` 提前优化
- `prefers-reduced-motion` 尊重用户偏好

### AISub 的动画

```css
/* 极光飘移 */
@keyframes drift {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to   { transform: translate3d(70px, 80px, 0) scale(1.2); }
}

/* 渐入效果 */
[data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s var(--ease), transform 0.7s var(--ease);
}
[data-reveal].in {
  opacity: 1;
  transform: none;
}
```

## 📱 响应式设计

### Ailyre 的断点

```css
/* 移动端优先 */
@media (min-width: 768px) { /* 平板 */ }
@media (min-width: 1024px) { /* 桌面 */ }
@media (min-width: 1440px) { /* 大屏 */ }

/* 独立移动端样式 */
<link rel="stylesheet" href="/mobile-home.css">
```

### AISub 的断点

```css
@media (max-width: 900px) { /* 平板 */ }
@media (max-width: 780px) { /* 手机横屏 */ }
@media (max-width: 440px) { /* 手机竖屏 */ }
```

**建议改进：** 改用 `min-width` 移动优先策略

## 🎯 可访问性

### Ailyre 的实践

```html
<!-- 跳转链接 -->
<a class="skip-link" href="#main">跳到主要内容</a>

<!-- ARIA 标签 -->
<button aria-label="播放音乐" aria-pressed="false">
<section aria-labelledby="services-title">
<div role="status" aria-live="polite"></div>

<!-- 屏幕阅读器专用 -->
<span class="sr-only">仅供屏幕阅读器</span>

<!-- 装饰性元素隐藏 -->
<div aria-hidden="true">✦✧</div>
```

### AISub 可以补充

```html
<!-- 语义化标签 -->
<main>
<nav aria-label="主导航">
<article>
<aside>

<!-- 焦点管理 -->
<button>关闭</button> <!-- 打开对话框后自动聚焦 -->

<!-- 键盘导航 -->
<div role="menu">
  <a role="menuitem" href="#">选项 1</a>
</div>
```

## 🚀 部署优化

### Ailyre 的 CDN 策略

```html
<!-- Cloudflare 分析 -->
<script src="https://static.cloudflareinsights.com/beacon.min.js">
```

### AISub 的 GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
```

## 📊 性能指标对比

| 指标 | Ailyre 估算 | AISub 当前 | 目标 |
|------|------------|------------|------|
| 首屏时间 | ~1.2s | ~0.8s | ~1.0s |
| 总文件大小 | ~500KB | ~300KB | ~400KB |
| CSS 文件 | 15+ 模块 | 1 个 | 6 个模块 |
| JS 文件 | 15+ 模块 | 2 个 | 4 个模块 |
| 图片优化 | WebP | PNG/JPG | WebP |
| 字体加载 | 系统字体 | 系统字体 | 系统字体 |

## 💡 关键启示

### 从 Ailyre 学到的

1. **克制的交互**
   - 不是每个元素都要动
   - 有意义的交互才保留

2. **模块化思维**
   - 每个功能独立文件
   - 按需加载

3. **细节打磨**
   - 缓动曲线精心调整
   - 颜色过渡自然
   - 间距比例和谐

4. **性能优先**
   - 无框架依赖
   - 延迟加载
   - 硬件加速动画

5. **可访问性**
   - ARIA 标签完善
   - 键盘导航友好
   - 屏幕阅读器支持

### AISub 的差异化

✅ **保持优势：**
- 8 语言国际化（vs Ailyre 2 语言）
- GitHub API 自动化
- Issues CMS 系统

🎯 **聚焦重点：**
- 产品营销网站（vs 个人空间）
- 功能说明为主（vs 交互体验）
- 下载转化优先（vs 探索发现）

---

**分析完成时间：** 2026-10-10  
**参考网站：** https://www.ailyre.com/  
**目标网站：** https://zhengxiexie.github.io/aisub-site/
