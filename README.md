# AISub 官网

AISub 产品的介绍站点。纯静态，零依赖，直接跑在 GitHub Pages 上。

## 本地预览

```bash
python3 -m http.server 8899
# 打开 http://localhost:8899
```

## 目录结构

```
.
├── index.html              # 单页官网（Hero / 痛点 / 原理 / 亮点 / 截图 / 下载 / 日志 / FAQ）
├── privacy.html            # 隐私政策
├── terms.html              # 服务条款
├── assets/
│   ├── css/style.css       # 设计令牌 + 全部样式（深浅色自适应）
│   ├── js/main.js          # GitHub API + Issues CMS + 交互
│   ├── logo.png
│   └── screenshots/        # 真实界面截图
├── capture.sh              # 自动截取 AISub 运行界面
├── tools/
│   ├── make-og.js           # 生成 1200x630 的 OG 卡片
│   └── og-template.html     # 卡片设计稿（复用官网设计令牌）
├── .github/workflows/deploy.yml
```

## 两个「动态」特性

**1. 下载区自动同步版本号**

页面直接请求 GitHub API 的 latest release，所以发完新版本官网自动显示新版本号和文件大小，
无需改代码。

**2. 更新日志用 Issues 当 CMS**

在 [aisub 仓库](https://github.com/zhengxiexie/aisub/issues) 新建一个带 `post` 标签的 Issue，
它就会自动出现在官网的「更新日志」区。**不用重新部署，推 Issue 即发布。**

- 标题 = 文章标题
- 正文首段 = 摘要（可用 `<!-- more -->` 手动截断）
- 其他标签 = 分类（`post` 和 `公告` 会被忽略）
- 标题以 `[置顶]` 或 `pinned:` 开头 = 置顶

示例：

```
[置顶] AISub 2.1.0 发布
标签: post, changelog

本次新增目录级删除与单行输入框...
<!-- more -->
这里是正文其余部分。
```

## 换截图

```bash
./capture.sh          # 需要终端有「屏幕录制」权限
```

或手动截图后覆盖 `assets/screenshots/` 下的同名文件。

## 社交卡片（OG image）

分享到 X / Reddit / HN 时，链接卡片用的是 `assets/og-image.png`（1200x630）。
改文案后重新生成：

```bash
node tools/make-og.js
```

脚本直接渲染 `tools/og-template.html`，里面复用了官网的色板令牌，
所以卡片和站点视觉自动保持一致。改文案就改模板，别手改 PNG。

脚本会在截图前断言「无元素超出 1200x630 画布」，避免文字被平台裁掉却没人发现。

## 配色

严格对齐 App 的 `Theme.swift`：

| 用途 | 值 | 来源 |
|---|---|---|
| 主色 | `#6B73F2` | `Color(0.42, 0.45, 0.95)` |
| 辅色 | `#9E66F2` | `Color(0.62, 0.40, 0.95)` |

## 部署

推送到 `main` 分支即自动部署（GitHub Actions → GitHub Pages）。

首次需要在仓库 Settings → Pages → Source 选择 **GitHub Actions**。