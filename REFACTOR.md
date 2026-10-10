# AISub 网站重构 - Ailyre 设计风格

## 📋 重构概述

本次重构受 [Ailyre.com](https://www.ailyre.com/) 启发，提升了网站的视觉层次和交互体验。

## 🎨 设计改进

### 1. 配色系统
- **保留原有主色**：#6B73F2（主紫）、#9E66F2（辅紫）
- **新增 Ailyre 配色**：
  - `--accent-warm: #bb8749`（金色点缀）
  - `--accent-blue: #263879`（深蓝）
- **增强光晕效果**：
  - `--accent-glow`：主色光晕
  - `--warm-glow`：暖色光晕

### 2. 背景动画层
- **Aurora 光晕**：三层渐变球体漂浮动画
- **网格纹理**：径向渐变遮罩的点阵背景
- **深度感**：多层叠加营造空间感

### 3. 模块化架构

```
assets/css/
├── tokens.css       # 设计令牌（颜色、字体、间距）
├── base.css         # 基础样式重置
├── backgrounds.css  # 背景动画效果
├── components.css   # UI 组件库
├── navigation.css   # 导航栏样式
└── style.css        # 主样式文件
```

### 4. 交互增强

**新增 JavaScript 模块：**
- `reveal.js`：滚动渐入动画（Intersection Observer）
- `navigation.js`：导航栏滚动效果、移动端菜单、语言切换

**特性：**
- 滚动时导航栏添加 `scrolled` 类
- 移动端汉堡菜单
- 语言下拉菜单点击外部关闭

## 🔍 技术栈分析

### Ailyre 网站特点

1. **纯静态架构**：无框架依赖，原生 HTML/CSS/JS
2. **模块化 CSS**：每个功能独立样式文件
3. **版本管理**：资源文件带版本戳（`?v=20261009T152445Z`）
4. **国际化**：`data-i18n` 属性 + JS 动态翻译
5. **交互丰富**：
   - 可拖拽元素
   - 音频反馈
   - 拨弦动画
   - Canvas 烟花效果
   - SVG 动画路径

### AISub 网站现状

**已实现：**
- ✅ 纯静态部署
- ✅ 多语言支持（8 种语言）
- ✅ GitHub Issues 作为 CMS
- ✅ GitHub API 自动同步版本
- ✅ 深浅色主题自适应

**本次新增：**
- ✅ 背景光晕动画
- ✅ 网格纹理层
- ✅ 滚动渐入效果
- ✅ 导航栏增强交互
- ✅ 模块化 CSS 架构
- ✅ Ailyre 风格配色

## 📊 对比分析

| 特性 | Ailyre | AISub（重构前）| AISub（重构后）|
|------|--------|----------------|----------------|
| 框架 | 无 | 无 | 无 |
| 背景动画 | ✅ 多层 | ✅ 基础 | ✅ 增强 |
| 模块化 CSS | ✅ | ❌ 单文件 | ✅ 6 个模块 |
| 交互脚本 | ✅ 10+ | ✅ 2 个 | ✅ 4 个 |
| 配色系统 | 深蓝+金 | 紫色系 | 紫+金+深蓝 |
| 国际化 | ✅ 中英 | ✅ 8 语言 | ✅ 8 语言 |
| 滚动动画 | ✅ 侧边栏 | ❌ | ✅ 渐入 |

## 🚀 使用方法

### 本地预览

```bash
python3 -m http.server 8899
# 访问 http://localhost:8899
```

### 主题切换

网站自动跟随系统主题，也可手动切换：

```javascript
// 深色模式
document.documentElement.setAttribute('data-theme', 'dark');

// 浅色模式
document.documentElement.setAttribute('data-theme', 'light');

// 跟随系统
document.documentElement.removeAttribute('data-theme');
```

## 🎯 未来优化方向

### 短期（可选）

1. **微交互增强**
   - 按钮悬停声音反馈
   - Logo 点击彩蛋
   - 下载按钮进度动画

2. **性能优化**
   - CSS 压缩合并
   - 图片懒加载
   - 关键 CSS 内联

3. **辅助功能**
   - 键盘导航优化
   - 屏幕阅读器支持
   - 动效暂停开关

### 长期（灵感）

1. **交互创新**
   - 类似 Ailyre 的拖拽机器人
   - Canvas 粒子效果
   - WebGL 3D 背景

2. **内容系统**
   - Markdown 文章系统
   - 标签筛选
   - 搜索功能

3. **工具集成**
   - 在线字幕预览
   - API 密钥测试工具
   - 使用统计仪表盘

## 📝 设计原则

参考 Ailyre 的核心设计理念：

1. **克制**：不过度设计，每个元素都有目的
2. **呼吸感**：留白充足，视觉层次清晰
3. **细节**：微动画、过渡、光影营造质感
4. **性能**：轻量级，无框架依赖
5. **可访问性**：语义化 HTML，ARIA 标签

## 🔗 相关资源

- [Ailyre 官网](https://www.ailyre.com/)
- [AISub GitHub](https://github.com/zhengxiexie/aisub)
- [GitHub Pages](https://zhengxiexie.github.io/aisub-site/)

---

**重构完成时间**：2026-10-10  
**技术栈**：HTML5 + CSS3 + Vanilla JS  
**设计灵感**：Ailyre.com  
**维护者**：@zhengxiexie
