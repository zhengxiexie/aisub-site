#!/bin/bash
# 截取 AISub 真实运行界面 → assets/screenshots/
#
# 前置条件: 给运行本脚本的终端「屏幕录制」权限。
#   系统设置 → 隐私与安全性 → 屏幕录制 → 勾选你使用的终端
#   (Terminal / iTerm / Warp / VSCode 等)
# 授权后需完全退出并重开该App。
#
# 用法:
#   ./capture.sh              # 截主窗口
#   ./capture.sh --all        # 截主窗口 + 若干场景
set -euo pipefail
cd "$(dirname "$0")"

OUT="assets/screenshots"
APP="${AISUB_APP:-/Applications/AISub.app}"

mkdir -p "$OUT"

if [ ! -d "$APP" ]; then
    echo "找不到 $APP"
    echo "先构建或安装 AISub，或用 AISUB_APP=路径 指定。"
    exit 1
fi

# 先确保它在跑
if ! pgrep -x AISub >/dev/null; then
    open -a "$APP"
    sleep 3
fi

echo "==> 将 AISub 置于前台"
osascript <<'APPLESCRIPT' >/dev/null
tell application "AISub" to activate
delay 1.2
APPLESCRIPT

# 宽一点、高一点，截图更好看
osascript <<'APPLESCRIPT' >/dev/null || true
tell application "System Events"
    tell process "AISub"
        set frontmost to true
        try
            set position of window 1 to {120, 90}
            set size of window 1 to {1180, 720}
        end try
    end tell
end tell
APPLESCRIPT

sleep 1.5

shot() {
    # -x 静音; -o 不带阴影
    local out="$1"
    echo "==> 截图 $out"
    if ! screencapture -x -o "$out"; then
        echo "    截图失败：可能缺少屏幕录制权限。"
        echo "    请到 系统设置 → 隐私与安全性 → 屏幕录制 授权后重试。"
        exit 1
    fi
}

if [ "${1:-}" = "--all" ]; then
    shot "$OUT/01-main.png"
    echo "    (其它场景请手动操作到对应界面后重跑，或手动截屏放入此目录)"
else
    shot "$OUT/01-main.png"
fi

echo ""
echo "==> 完成，截图位于：$OUT/"
ls -lh "$OUT" | sed 's/^/    /'

cat <<'TIP'

下一步:
  1. 打开 index.html, 把 <div class="shot-placeholder"> 占位块
     换成 <img src="assets/screenshots/01-main.png" data-zoom alt="...">
  2. 建议截图宽度 ≥ 1400px（Retina 屏直接截原始像素即可）。
TIP