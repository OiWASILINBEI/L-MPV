/**
 * L-MPV 汉化版补丁入口（挂点文件）。
 *
 * main.tsx 里只保留一行 `import "./zh-cn";` 作为接入点，
 * 具体功能都放在本目录内，尽量少改动上游文件。
 * 编译前 scripts/check-patches.mjs 会校验这些挂点是否仍然有效。
 */
import { initVideoAreaWindowDrag } from "./drag";

// 模块加载即生效：用事件委托，视频区域还没渲染也没关系
initVideoAreaWindowDrag();
