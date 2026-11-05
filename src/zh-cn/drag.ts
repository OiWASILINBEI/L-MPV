/**
 * L-MPV 汉化版补丁：拖动视频画面移动窗口。
 *
 * 实现方式：在 document 上做事件委托，不依赖 App.tsx 里的 React 回调，
 * 这样上游作者改动 App.tsx 时不会把这段逻辑冲掉。
 *
 * 行为与原版一致：
 * - 只有左键、只有落在 .video-area 上才生效；
 * - 位移超过 6 像素才判定为拖动，避免误触；
 * - 全屏状态下禁用（向 Tauri 后端查询当前是否全屏）；
 * - 拖动结束后吞掉随后的一次 click，避免误触发暂停 / 双击全屏。
 */
import { getCurrentWindow } from "@tauri-apps/api/window";

/** 判定为拖动所需的最小位移（像素）。 */
const DRAG_THRESHOLD_PX = 6;
/** 拖动结束后吞掉 click 的时间窗口（毫秒）。 */
const CLICK_SUPPRESS_MS = 800;

type DragSession = {
  startX: number;
  startY: number;
  /** 是否已经真正开始拖动。 */
  started: boolean;
  /** 是否允许拖动（查询全屏状态完成前先禁止）。 */
  allowDrag: boolean;
};

/**
 * 启动「拖动视频画面移动窗口」补丁，返回清理函数。
 */
export function initVideoAreaWindowDrag(): () => void {
  let session: DragSession | null = null;
  let suppressClickUntil = 0;
  let checkToken = 0;

  const reset = () => {
    session = null;
  };

  const onMouseDown = (event: MouseEvent) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    const area = target?.closest?.(".video-area");
    if (!area) return;

    const token = ++checkToken;
    const current: DragSession = {
      startX: event.clientX,
      startY: event.clientY,
      started: false,
      allowDrag: false,
    };
    session = current;

    getCurrentWindow()
      .isFullscreen()
      .then((isFullscreen) => {
        if (token === checkToken && session === current) {
          current.allowDrag = !isFullscreen;
        }
      })
      .catch((error) => {
        // 查询失败时按「非全屏」处理，保证拖动功能可用
        console.error("[zh-cn] 查询全屏状态失败：", error);
        if (token === checkToken && session === current) {
          current.allowDrag = true;
        }
      });
  };

  const onMouseMove = (event: MouseEvent) => {
    const current = session;
    if (!current || current.started) return;
    // 左键已经松开：本次按下作废
    if ((event.buttons & 1) === 0) {
      reset();
      return;
    }
    if (!current.allowDrag) return;
    if (Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < DRAG_THRESHOLD_PX) {
      return;
    }
    current.started = true;
    suppressClickUntil = performance.now() + CLICK_SUPPRESS_MS;
    getCurrentWindow().startDragging().catch((error) => {
      console.error("[zh-cn] 拖动窗口失败：", error);
    });
  };

  // 在捕获阶段吞掉拖动结束后的那一次 click，避免触发 App.tsx 里的暂停 / 全屏逻辑。
  const onClickCapture = (event: MouseEvent) => {
    if (performance.now() >= suppressClickUntil) return;
    suppressClickUntil = 0;
    event.stopPropagation();
    event.preventDefault();
  };

  document.addEventListener("mousedown", onMouseDown, true);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", reset);
  window.addEventListener("blur", reset);
  document.addEventListener("click", onClickCapture, true);

  return () => {
    document.removeEventListener("mousedown", onMouseDown, true);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", reset);
    window.removeEventListener("blur", reset);
    document.removeEventListener("click", onClickCapture, true);
    session = null;
  };
}
