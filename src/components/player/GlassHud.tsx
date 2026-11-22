import React from "react";
import {
  Volume2,
  Subtitles,
  Zap,
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
} from "lucide-react";

/**
 * Пропсы для компонента футуристичного Glass HUD в левом верхнем углу.
 */
export interface GlassHudProps {
  /** Текст активного уведомления или null */
  osdText: string | null;
  /** Флаг анимации затухания сообщения */
  isOsdClosing: boolean;
  /** Флаг состояния ошибки */
  isOsdError: boolean;
}

/**
 * Определение наиболее подходящей иконки для OSD-сообщения на основе его содержания.
 *
 * @param text Текст OSD-сообщения
 * @param isError Флаг ошибки
 * @returns ReactNode с соответствующей векторной иконкой Lucide
 */
function getHudIcon(text: string, isError: boolean): React.ReactNode {
  if (isError) {
    return <AlertCircle size={18} className="glass-hud__icon glass-hud__icon--error" />;
  }
  const lower = text.toLowerCase();
  const has = (...words: string[]) => words.some((w) => lower.includes(w));

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
    return <Zap size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (/^播放$/.test(text.trim())) {
    return <Play size={18} className="glass-hud__icon glass-hud__icon--accent" />;
  }
  if (/^暂停$/.test(text.trim())) {
    return <Pause size={18} className="glass-hud__icon glass-hud__icon--accent" />;
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
  return <Info size={18} className="glass-hud__icon" />;
}

/**
 * Футуристичный Glass HUD:
 * Парящий стеклянный бейдж (Glass Capsule) в левом верхнем углу для всех системных уведомлений.
 */
export const GlassHud: React.FC<GlassHudProps> = ({
  osdText,
  isOsdClosing,
  isOsdError,
}) => {
  if (!osdText) return null;

  const isMultiline = osdText.includes("\n");

  return (
    <div
      className={`glass-hud-pill ${isMultiline ? "glass-hud-pill--multiline" : ""} ${
        isOsdError ? "glass-hud-pill--error" : ""
      } ${isOsdClosing ? "glass-hud-pill--closing" : ""}`}
      role={isOsdError ? "alert" : "status"}
      aria-live={isOsdError ? "assertive" : "polite"}
    >
      <div className="glass-hud-pill__icon-slot">
        {getHudIcon(osdText, isOsdError)}
      </div>
      <div className="glass-hud-pill__content">
        <span className="glass-hud-pill__text">{osdText}</span>
      </div>
    </div>
  );
};
