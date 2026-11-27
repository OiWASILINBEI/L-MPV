import React, { useEffect, useState } from "react";
import {
  Volume2,
  Subtitles,
  Camera,
  Sparkles,
  AlertCircle,
  Info,
  RotateCw,
  Maximize,
  Repeat,
  Activity,
  Languages,
  Film,
  Sun,
  Play,
  Pause,
  Shuffle,
  Pin,
  Clock,
  Flame,
  Layout,
  SlidersHorizontal,
} from "lucide-react";
import { SpeedIcon } from "./controls/SpeedIcon";
import {
  type ControlBarStyle,
  getSavedControlBarStyle,
} from "../../theme/controlBarStyle";
import type { HudIconType } from "../../hooks/useOsd";

/**
 * Пропсы для компонента футуристичного Glass HUD в левом верхнем углу.
 */
export interface GlassHudProps {
  /** Текст активного уведомления или null */
  osdText: string | null;
  /** Явный тип иконки (не зависит от локали текста) */
  osdIcon?: HudIconType | null;
  /** Флаг анимации затухания сообщения */
  isOsdClosing: boolean;
  /** Флаг состояния ошибки */
  isOsdError: boolean;
}

/**
 * Возвращает векторную иконку Lucide по явному типу уведомления (независимо от языка).
 */
function renderHudIconByType(icon: HudIconType): React.ReactNode {
  switch (icon) {
    case "error":
      return <AlertCircle size={18} className="glass-hud__icon glass-hud__icon--error" />;
    case "audio":
      return <Volume2 size={18} className="glass-hud__icon glass-hud__icon--accent" />;
    case "subtitles":
      return <Subtitles size={18} className="glass-hud__icon glass-hud__icon--accent" />;
    case "speed":
      return <SpeedIcon size={18} className="glass-hud__icon glass-hud__icon--accent" />;
    case "screenshot":
      return <Camera size={18} className="glass-hud__icon glass-hud__icon--accent" />;
    case "frame":
      return <Film size={18} className="glass-hud__icon glass-hud__icon--accent" />;
    case "rotate":
      return <RotateCw size={18} className="glass-hud__icon glass-hud__icon--accent" />;
    case "zoom":
      return <Maximize size={18} className="glass-hud__icon glass-hud__icon--accent" />;
    case "repeat":
      return <Repeat size={18} className="glass-hud__icon glass-hud__icon--accent" />;
    case "visualizer":
      return <Activity size={18} className="glass-hud__icon glass-hud__icon--accent" />;
    case "ambient":
      return <Sun size={18} className="glass-hud__icon glass-hud__icon--accent" />;
    case "language":
      return <Languages size={18} className="glass-hud__icon glass-hud__icon--accent" />;
    case "sparkles":
      return <Sparkles size={18} className="glass-hud__icon glass-hud__icon--accent" />;
    case "info":
    default:
      return <Info size={18} className="glass-hud__icon" />;
  }
}

/**
 * Определение наиболее подходящей иконки для OSD-сообщения:
 * приоритетно по явному типу `icon`, с fallback-определением по содержимому.
 */
function getHudIcon(
  text: string,
  isError: boolean,
  icon?: HudIconType | null
): React.ReactNode {
  if (isError) {
    return renderHudIconByType("error");
  }
  if (icon) {
    return renderHudIconByType(icon);
  }
  const lower = text.toLowerCase();
  const has = (...words: string[]) => words.some((w) => lower.includes(w));

  if (has("按钮「")) {
    return <SlidersHorizontal size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (
    has(
      "ошибка",
      "error",
      "fail",
      "не удалось",
      "не найден",
      // 中文错误提示（简体中文汉化）
      "错误",
      "出错",
      "失败",
      "未找到",
      "无法",
      "不可用"
    )
  ) {
    return <AlertCircle size={18} className="glass-hud__icon glass-hud__icon--error" />;
  }
  if (
    has(
      "аудио",
      "audio",
      "звук",
      "sound",
      "громкост",
      // 中文音量/音频提示（简体中文汉化）
      "音量",
      "静音",
      "音轨",
      "音频",
      "声音"
    )
  ) {
    return <Volume2 size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (
    has(
      "субтитр",
      "sub",
      "subtitle",
      // 中文字幕提示（简体中文汉化）
      "字幕"
    )
  ) {
    return <Subtitles size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (
    has(
      "скорост",
      "speed",
      // 中文倍速提示（简体中文汉化）
      "播放速度",
      "倍速"
    ) ||
    /^\d+(\.\d+)?x$/.test(lower.trim())
  ) {
    return <SpeedIcon size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (/^播放$/.test(text.trim())) {
    return <Play size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (/^暂停$/.test(text.trim())) {
    return <Pause size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (has("随机播放", "shuffle")) {
    return <Shuffle size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (
    has(
      "скриншот",
      "screenshot",
      // 中文截图/帧提示（简体中文汉化）
      "截图",
      "帧"
    )
  ) {
    return <Camera size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (
    has(
      "кадр",
      "frame",
      // 中文章节/正在播放提示（简体中文汉化）
      "章节",
      "正在播放"
    ) ||
    /^\d+\s*\/\s*\d+$/.test(lower.trim())
  ) {
    return <Film size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (
    has(
      "поворот",
      "rotation",
      "rotate",
      // 中文旋转提示（简体中文汉化）
      "旋转"
    )
  ) {
    return <RotateCw size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (
    has(
      "зум",
      "zoom",
      "масштаб",
      // 中文缩放提示（简体中文汉化）
      "缩放"
    )
  ) {
    return <Maximize size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (
    has(
      "повтор",
      "repeat",
      "loop",
      // 中文循环提示（简体中文汉化）
      "循环",
      "重复"
    )
  ) {
    return <Repeat size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (
    has(
      "визуализатор",
      "visualizer",
      // 中文可视化提示（简体中文汉化）
      "可视化"
    )
  ) {
    return <Activity size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (has("热力图", "heatmap")) {
    return <Flame size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (
    has(
      "blur",
      "ambient",
      // 中文环境光提示（简体中文汉化）
      "环境光",
      "模糊"
    )
  ) {
    return <Sun size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (
    has(
      "язык",
      "language",
      // 中文语言提示（简体中文汉化）
      "语言"
    )
  ) {
    return <Languages size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (has("控制栏样式")) {
    return <Layout size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (
    has(
      "upscal",
      "апскейл",
      "4k ai",
      "пресет",
      "стиль",
      "preset",
      "тема",
      // 中文超分/预设提示（简体中文汉化）
      "超分",
      "预设",
      "风格",
      "样式",
      "主题"
    )
  ) {
    return <Sparkles size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (has("置顶", "always on top", "pin")) {
    return <Pin size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (has("时间：", "格式：", "time:", "format:")) {
    return <Clock size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  return <Info size={18} className="glass-hud__icon" />;
}

/**
 * Футуристичный Glass HUD:
 * Парящий стеклянный бейдж (Glass Capsule) в левом верхнем углу для всех системных уведомлений.
 */
export const GlassHud: React.FC<GlassHudProps> = ({
  osdText,
  osdIcon,
  isOsdClosing,
  isOsdError,
}) => {
  const [controlBarStyle, setControlBarStyle] = useState<ControlBarStyle>(() =>
    getSavedControlBarStyle()
  );

  useEffect(() => {
    const syncStyle = () => setControlBarStyle(getSavedControlBarStyle());
    window.addEventListener("l-mpv-settings-changed", syncStyle);
    window.addEventListener("l-mpv-control-bar-style-changed", syncStyle);
    window.addEventListener("l-mpv-player-theme-changed", syncStyle);
    window.addEventListener("storage", syncStyle);
    return () => {
      window.removeEventListener("l-mpv-settings-changed", syncStyle);
      window.removeEventListener("l-mpv-control-bar-style-changed", syncStyle);
      window.removeEventListener("l-mpv-player-theme-changed", syncStyle);
      window.removeEventListener("storage", syncStyle);
    };
  }, []);

  if (!osdText) return null;

  const isMultiline = osdText.includes("\n");

  return (
    <div
      className={`glass-hud-pill glass-hud-pill--${controlBarStyle} ${
        isMultiline ? "glass-hud-pill--multiline" : ""
      } ${
        isOsdError ? "glass-hud-pill--error" : ""
      } ${isOsdClosing ? "glass-hud-pill--closing" : ""}`}
      role={isOsdError ? "alert" : "status"}
      aria-live={isOsdError ? "assertive" : "polite"}
    >
      <div className="glass-hud-pill__icon-slot">
        {getHudIcon(osdText, isOsdError, osdIcon)}
      </div>
      <div className="glass-hud-pill__content">
        <span className="glass-hud-pill__text">{osdText}</span>
      </div>
    </div>
  );
};
