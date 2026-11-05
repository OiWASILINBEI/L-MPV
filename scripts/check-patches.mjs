/**
 * 编译前自检：确认汉化版补丁的「挂点」还在。
 *
 * 汉化版对上游代码的改动依赖少量接入点（比如 main.tsx 里的一行 import、
 * App.tsx 里的 .video-area 容器）。上游作者改版时这些接入点可能被改掉，
 * 一旦改掉，我们的功能会静默失效。这个脚本让编译直接失败并说明原因，
 * 而不是悄悄发布一个坏版本。
 *
 * 用法：node scripts/check-patches.mjs   （在仓库根目录执行）
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

/** 读取仓库内文件内容，不存在则记一条失败。 */
function readFile(relativePath) {
  const absolutePath = join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`缺少文件：${relativePath}`);
    return null;
  }
  return readFileSync(absolutePath, "utf8");
}

/** 要求文件里包含指定内容。 */
function requirePattern(relativePath, content, pattern, reason) {
  if (content === null) return;
  if (!pattern.test(content)) {
    failures.push(`${relativePath} 里找不到${reason}（匹配 ${pattern}）`);
  }
}

/** 要求文件里不能出现指定内容。 */
function forbidPattern(relativePath, content, pattern, reason) {
  if (content === null) return;
  if (pattern.test(content)) {
    failures.push(`${relativePath} 里仍然存在${reason}（匹配 ${pattern}）`);
  }
}

// 1) 我们自己的补丁文件必须在
const entry = readFile("src/zh-cn/index.ts");
const drag = readFile("src/zh-cn/drag.ts");

requirePattern("src/zh-cn/index.ts", entry, /initVideoAreaWindowDrag/, "拖动补丁的初始化调用");
requirePattern("src/zh-cn/drag.ts", drag, /startDragging/, "窗口拖动调用");

// 2) main.tsx 的接入点
const mainTsx = readFile("src/main.tsx");
requirePattern("src/main.tsx", mainTsx, /import\s+"\.\/zh-cn"/, "汉化补丁入口 import");

// 3) App.tsx 的视频容器必须还在，且不应残留我们已迁走的旧拖动处理
const appTsx = readFile("src/App.tsx");
requirePattern("src/App.tsx", appTsx, /className=\{`video-area /, "视频画面容器 class（.video-area）");
forbidPattern("src/App.tsx", appTsx, /handleVideoMouseDown/, "旧的窗口拖动处理函数（应已迁到 src/zh-cn/drag.ts）");

// 4) 中文语言包必须已注册
const i18nIndex = readFile("src/i18n/index.ts");
requirePattern("src/i18n/index.ts", i18nIndex, /from\s+"\.\/locales\/zh"/, "简体中文语言包 import");
requirePattern("src/i18n/index.ts", i18nIndex, /\bzh\b/, "简体中文语言包注册");
readFile("src/i18n/locales/zh.ts");

// 5) 时间格式工具的单点实现必须还在
const timeFormat = readFile("src/utils/timeFormatUtils.ts");
requirePattern("src/utils/timeFormatUtils.ts", timeFormat, /getTimeFormatOptions/, "时间格式选项函数");

// 6) Lua 插件资产必须存在（mpv 自动扫 config/scripts/，无需 Rust 显式加载）
readFile("bundled/portable-assets/config/scripts/startup-format-logos.lua");
readFile("bundled/portable-assets/config/scripts/stats.lua");
readFile("bundled/portable-assets/config/script-modules/startup-logo-bounds.lua");
readFile("bundled/portable-assets/config/script-assets/startup-format-logos/runtime/manifest.json");

// 7) stats 右键触发链路：Rust 通用命令 + 前端按钮事件
const playback = readFile("src-tauri/src/commands/playback.rs");
requirePattern("src-tauri/src/commands/playback.rs", playback, /pub fn mpv_command/, "mpv_command 通用命令");
const libRs = readFile("src-tauri/src/lib.rs");
requirePattern("src-tauri/src/lib.rs", libRs, /commands::mpv_command/, "mpv_command 注册");
const playerControls = readFile("src/components/player/PlayerControls.tsx");
requirePattern("src/components/player/PlayerControls.tsx", playerControls, /stats2\/display-stats-toggle/, "文件信息按钮右键触发 stats");

if (failures.length > 0) {
  console.error("❌ 编译前自检未通过：上游改动动到了汉化版的挂点，请先修复再编译。");
  for (const item of failures) {
    console.error(`  - ${item}`);
  }
  process.exit(1);
}

console.log("✅ 编译前自检通过：汉化版挂点齐全。");
