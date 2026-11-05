import { formatTime } from "./timeUtils";
import type { Locale } from "../i18n/types";
import { getEffectiveLocale } from "../i18n";

/**
 * Режимы отображения времени воспроизведения видео в плеере L-MPV:
 * - "elapsed_total": Прошедшее время / Общая длительность (Стандарт)
 * - "elapsed_remaining": Прошедшее время / Оставшееся время с минусом
 * - "remaining_only": Только оставшееся время до конца видео
 * - "finish_time": Расчетное время завершения фильма по системным часам
 */
export type TimeFormatMode = "elapsed_total" | "elapsed_remaining" | "remaining_only" | "finish_time";

export const TIME_FORMAT_STORAGE_KEY = "l-mpv-time-format";
export const DEFAULT_TIME_FORMAT: TimeFormatMode = "elapsed_total";

export interface TimeFormatOption {
  id: TimeFormatMode;
  label: string;
  desc: string;
  example: string;
}

/** Локализованные подписи режимов отображения времени. */
const TIME_FORMAT_COPY: Record<
  Locale,
  Record<TimeFormatMode, Omit<TimeFormatOption, "id">>
> = {
  ru: {
    elapsed_total: {
      label: "Прошедшее / Общее",
      desc: "Стандартное отображение",
      example: "00:15 / 24:00",
    },
    elapsed_remaining: {
      label: "Прошедшее / Оставшееся",
      desc: "С минусом до конца",
      example: "00:15 / -23:45",
    },
    remaining_only: {
      label: "Только обратный отсчет",
      desc: "Сколько осталось до конца",
      example: "-23:45",
    },
    finish_time: {
      label: "Время окончания фильма",
      desc: "По часам Windows с учётом скорости",
      example: "Конец в 22:15",
    },
  },
  en: {
    elapsed_total: {
      label: "Elapsed / Total",
      desc: "Standard display",
      example: "00:15 / 24:00",
    },
    elapsed_remaining: {
      label: "Elapsed / Remaining",
      desc: "Remaining time with a minus sign",
      example: "00:15 / -23:45",
    },
    remaining_only: {
      label: "Remaining only",
      desc: "How much time is left until the end",
      example: "-23:45",
    },
    finish_time: {
      label: "Estimated finish time",
      desc: "Windows clock adjusted for playback speed",
      example: "Ends at 22:15",
    },
  },
  zh: {
    elapsed_total: {
      label: "已播 / 总时长",
      desc: "标准显示方式",
      example: "00:15 / 24:00",
    },
    elapsed_remaining: {
      label: "已播 / 剩余",
      desc: "剩余时间带负号",
      example: "00:15 / -23:45",
    },
    remaining_only: {
      label: "仅剩余时间",
      desc: "距离播放结束还有多久",
      example: "-23:45",
    },
    finish_time: {
      label: "预计结束时间",
      desc: "按系统时钟并考虑播放速度",
      example: "结束于 22:15",
    },
  },
};

const TIME_FORMAT_MODES: TimeFormatMode[] = [
  "elapsed_total",
  "elapsed_remaining",
  "remaining_only",
  "finish_time",
];

/**
 * Получение списка режимов отображения времени с подписями на нужном языке.
 * Без аргумента используется текущая локаль плеера.
 */
export function getTimeFormatOptions(locale?: Locale): TimeFormatOption[] {
  const activeLocale = locale ?? getEffectiveLocale();
  const copy = TIME_FORMAT_COPY[activeLocale] || TIME_FORMAT_COPY.ru;
  return TIME_FORMAT_MODES.map((id) => ({ id, ...copy[id] }));
}

/**
 * Чтение сохранённого формата времени из localStorage с валидацией.
 */
export function getSavedTimeFormat(): TimeFormatMode {
  try {
    const saved = localStorage.getItem(TIME_FORMAT_STORAGE_KEY);
    if (
      saved === "elapsed_total" ||
      saved === "elapsed_remaining" ||
      saved === "remaining_only" ||
      saved === "finish_time"
    ) {
      return saved;
    }
  } catch (e) {
    console.error("Ошибка чтения формата времени из localStorage:", e);
  }
  return DEFAULT_TIME_FORMAT;
}

/**
 * Сохранение выбранного формата времени в localStorage и глобальная синхронизация.
 */
export function saveTimeFormat(format: TimeFormatMode): void {
  try {
    localStorage.setItem(TIME_FORMAT_STORAGE_KEY, format);
  } catch (e) {
    console.error("Ошибка сохранения формата времени в localStorage:", e);
  }
  window.dispatchEvent(new Event("l-mpv-settings-changed"));
}

/**
 * Получение следующего формата времени для циклического переключения по клику.
 */
export function getNextTimeFormat(current: TimeFormatMode): TimeFormatMode {
  const modes: TimeFormatMode[] = [
    "elapsed_total",
    "elapsed_remaining",
    "remaining_only",
    "finish_time",
  ];
  const idx = modes.indexOf(current);
  if (idx === -1) return "elapsed_total";
  return modes[(idx + 1) % modes.length];
}

/**
 * Форматирование строкового представления времени на основе текущей позиции, длительности и режима.
 */
export function formatTimeByMode(
  position: number,
  duration: number,
  mode: TimeFormatMode,
  speed: number = 1.0,
  locale?: Locale
): { full: string; compact: string } {
  const posSec = Math.max(0, position);
  const durSec = Math.max(0, duration);
  const remSec = Math.max(0, durSec - posSec);

  switch (mode) {
    case "elapsed_remaining": {
      const full = `${formatTime(posSec)} / -${formatTime(remSec)}`;
      const compact = formatTime(posSec);
      return { full, compact };
    }
    case "remaining_only": {
      const full = `-${formatTime(remSec)}`;
      const compact = `-${formatTime(remSec)}`;
      return { full, compact };
    }
    case "finish_time": {
      if (durSec <= 0) {
        return {
          full: formatTime(posSec),
          compact: formatTime(posSec),
        };
      }
      const effectiveSpeed = speed > 0 ? speed : 1.0;
      const finishMs = Date.now() + (remSec / effectiveSpeed) * 1000;
      const finishDate = new Date(finishMs);
      const hours = finishDate.getHours().toString().padStart(2, "0");
      const minutes = finishDate.getMinutes().toString().padStart(2, "0");
      const activeLocale = locale ?? getEffectiveLocale();
      const prefix = activeLocale === "ru" ? "Конец в" : activeLocale === "zh" ? "结束于" : "Ends at";
      const full = `${prefix} ${hours}:${minutes} (${formatTime(posSec)})`;
      const compact = `~${hours}:${minutes}`;
      return { full, compact };
    }
    case "elapsed_total":
    default: {
      const full = `${formatTime(posSec)} / ${formatTime(durSec)}`;
      const compact = formatTime(posSec);
      return { full, compact };
    }
  }
}
