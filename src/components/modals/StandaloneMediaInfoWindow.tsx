import { useMotionAllowed } from "../motion/useMotionAllowed";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, emit } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  FileText,
  X,
  Copy,
  Check,
  Download,
  Search,
  Loader2,
  AlertCircle,
  Languages,
  Minus,
  Square,
  Minimize2,
  RefreshCw,
  Pin,
  FileUp,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { parseMediaInfoLines, MediaInfoLang } from "../../utils/mediaInfoParser";
import {
  CategoryKey,
  buildCategoryTabs,
  filterAndProcessSections,
  MediaInfoTabsBar,
  MediaInfoSectionList,
  useMediaInfoDragDrop,
  useMediaInfoSearchNav,
} from "./mediainfo";
import "../../styles/mediainfo-modal.css";
import { getCustomHotkeys, isKeyboardEventMatch } from "../../utils/hotkeyUtils";
import { getEffectiveLocale } from "../../i18n";
import {
  getSavedControlBarStyle,
  type ControlBarStyle,
} from "../../utils/controlBarStyleUtils";

interface DetailedMediaInfoResponse {
  text: string;
  json: string;
}

/**
 * Автономное отдельное окно MediaInfo для L-MPV.
 *
 * Открывается при вызове "Открыть в L-MPV MediaInfo" из контекстного меню Проводника,
 * по горячей клавише Shift+F10 или по прямому вызову без запуска основного медиаплеера.
 */
export const StandaloneMediaInfoWindow: React.FC = () => {
  const motionAllowed = useMotionAllowed();
  const appWindow = useMemo(() => getCurrentWindow(), []);

  const [filePath, setFilePath] = useState<string>("");
  const [data, setData] = useState<DetailedMediaInfoResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const reportRequestRef = useRef(0);
  const pendingPathRef = useRef<string | null>(null);
  const completedPathRef = useRef<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const [lang, setLang] = useState<MediaInfoLang>(() => getEffectiveLocale());
  // Хелпер выбора строки по текущему языку (ru / en / zh)
  const L = useCallback((ru: string, en: string, zh: string) => (lang === "ru" ? ru : lang === "zh" ? zh : en), [lang]);

  // Независимый масштаб окна MediaInfo — применяется поверх общего --ui-scale.
  // Хранится в localStorage, чтобы окно запоминало предпочтение пользователя.
  const [miZoom, setMiZoom] = useState<number>(() => {
    try {
      const raw = localStorage.getItem("l-mpv-mediainfo-zoom");
      const v = raw ? parseFloat(raw) : 1;
      return Number.isFinite(v) && v > 0 ? v : 1;
    } catch {
      return 1;
    }
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--mi-zoom", String(miZoom));
    try {
      localStorage.setItem("l-mpv-mediainfo-zoom", String(miZoom));
    } catch {
      // localStorage недоступен
    }
  }, [miZoom]);

  // Общий масштаб интерфейса (для показа итогового процента в тулбаре)
  const uiScale = useMemo(() => {
    try {
      const mode = localStorage.getItem("l-mpv-ui-scale-mode") || "auto";
      const value = parseFloat(localStorage.getItem("l-mpv-ui-scale-value") || "1");
      return mode === "manual" && Number.isFinite(value) && value > 0 ? value : 1;
    } catch {
      return 1;
    }
  }, []);

  const adjustMiZoom = useCallback((delta: number) => {
    setMiZoom((z) => Math.min(2, Math.max(0.7, Math.round((z + delta) * 100) / 100)));
  }, []);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState<boolean>(true);

  const [controlBarStyle, setControlBarStyle] = useState<ControlBarStyle>(() => getSavedControlBarStyle());

  // Синхронизация стиля оформления интерфейса в реальном времени
  useEffect(() => {
    const handleSettingsChanged = () => {
      setControlBarStyle(getSavedControlBarStyle());
    };
    window.addEventListener("l-mpv-settings-changed", handleSettingsChanged);
    window.addEventListener("storage", handleSettingsChanged);
    return () => {
      window.removeEventListener("l-mpv-settings-changed", handleSettingsChanged);
      window.removeEventListener("storage", handleSettingsChanged);
    };
  }, []);

  const isCapsule = controlBarStyle === "capsule";

  const bodyRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copySectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Очистка таймеров копирования при размонтировании
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      if (copySectionTimerRef.current) clearTimeout(copySectionTimerRef.current);
    };
  }, []);

  // Извлечение короткого имени файла для заголовка
  const fileName = useMemo(() => {
    if (!filePath) return "";
    return filePath.split(/[/\\]/).pop() || filePath;
  }, [filePath]);

  // Загрузка отчёта MediaInfo
  const loadMediaInfoForPath = useCallback((path: string) => {
    if (!path || !path.trim()) {
      setLoading(false);
      setError("NO_PATH");
      return;
    }

    if (pendingPathRef.current === path) return;
    const request = ++reportRequestRef.current;
    pendingPathRef.current = path;
    const sameReport = completedPathRef.current === path;

    setFilePath(path);
    setError(null);
    if (!sameReport) {
      setLoading(true);
      setData(null);
      completedPathRef.current = null;
      setActiveCategory("all");
      setCollapsedSections(new Set());
      setSearchQuery("");
    }

    invoke<DetailedMediaInfoResponse>("get_detailed_media_info", { path })
      .then((res) => {
        if (request !== reportRequestRef.current) return;
        completedPathRef.current = path;
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        if (request !== reportRequestRef.current) return;
        console.error("Ошибка получения MediaInfo:", err);
        completedPathRef.current = null;
        setData(null);
        setError(typeof err === "string" ? err : "DLL_ERROR");
        setLoading(false);
      })
      .finally(() => {
        if (request === reportRequestRef.current) pendingPathRef.current = null;
      });
  }, []);

  // Поддержка безопасного Drag & Drop перетаскивания файлов прямо в окно MediaInfo
  const { isDragOver, dragHandlers } = useMediaInfoDragDrop({
    onFileDrop: loadMediaInfoForPath,
  });

  // Первоначальное получение пути файла и подписка на события обновления
  useEffect(() => {
    // 1. Запрос пути, сохранённого в Tauri State при старте
    const initialRequest = reportRequestRef.current;
    invoke<string | null>("get_standalone_mediainfo_path")
      .then((initialPath) => {
        if (reportRequestRef.current !== initialRequest) return;
        if (initialPath) {
          loadMediaInfoForPath(initialPath);
        } else {
          setLoading(false);
          setError("NO_FILE");
        }
      })
      .catch((e) => {
        if (reportRequestRef.current !== initialRequest) return;
        console.error("Ошибка вызова get_standalone_mediainfo_path:", e);
        setLoading(false);
        setError("INIT_ERROR");
      });

    // 2. Слушатель события обновления пути (если окно уже открыто и выбран другой файл)
    const syncAlwaysOnTopState = async () => {
      try {
        setIsAlwaysOnTop(await appWindow.isAlwaysOnTop());
      } catch {
        // Игнорируем ошибки опроса состояния закрепления окна
      }
    };
    syncAlwaysOnTopState();

    const unlistenPromise = listen<string>("load-mediainfo-path", (event) => {
      syncAlwaysOnTopState();
      if (event.payload) {
        loadMediaInfoForPath(event.payload);
      }
    }).catch((e) => {
      console.error("Ошибка подписки load-mediainfo-path:", e);
      return () => {};
    });

    // 3. Отслеживание изменения статуса развёрнутого окна
    const updateMaximizedState = async () => {
      try {
        setIsMaximized(await appWindow.isMaximized());
      } catch {
        // Игнорируем ошибки опроса окна
      }
    };
    updateMaximizedState();

    const unlistenResizePromise = appWindow
      .onResized(() => {
        updateMaximizedState();
      })
      .catch(() => () => {});

    // 4. Оповещение при закрытии окна
    const unlistenClosePromise = appWindow
      .onCloseRequested(async () => {
        await emit("mediainfo-window-closed").catch(() => {});
      })
      .catch(() => () => {});

    return () => {
      unlistenPromise.then((unlisten) => unlisten && unlisten()).catch(() => {});
      unlistenResizePromise.then((unlisten) => unlisten && unlisten()).catch(() => {});
      unlistenClosePromise.then((unlisten) => unlisten && unlisten()).catch(() => {});
    };
  }, [appWindow, loadMediaInfoForPath]);

  // Управление окном
  const handleToggleAlwaysOnTop = useCallback(async () => {
    try {
      const next = !isAlwaysOnTop;
      await appWindow.setAlwaysOnTop(next);
      setIsAlwaysOnTop(next);
    } catch (e) {
      console.error("Ошибка переключения закрепления окна:", e);
    }
  }, [appWindow, isAlwaysOnTop]);

  const handleMinimize = useCallback(async () => {
    try {
      await appWindow.minimize();
    } catch (e) {
      console.error("Ошибка сворачивания окна MediaInfo:", e);
    }
  }, [appWindow]);

  const handleToggleMaximize = useCallback(async () => {
    try {
      const max = await appWindow.isMaximized();
      if (max) {
        await appWindow.unmaximize();
        setIsMaximized(false);
      } else {
        await appWindow.maximize();
        setIsMaximized(true);
      }
    } catch (e) {
      console.error("Ошибка переключения максимизации окна:", e);
    }
  }, [appWindow]);

  const handleClose = useCallback(async () => {
    try {
      await emit("mediainfo-window-closed").catch(() => {});
      await appWindow.hide();
      const isStandalone = await invoke<boolean>("is_standalone_mode").catch(() => false);
      if (isStandalone) {
        await appWindow.close();
      }
    } catch (e) {
      console.error("Ошибка закрытия окна MediaInfo:", e);
    }
  }, [appWindow]);

  // Обработка клавиатурных сокращений
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const customHotkeys = getCustomHotkeys();
      const infoKeys = customHotkeys.detailedMediaInfo || ["Shift+F10"];
      const isInfoHotkey = infoKeys.some((k) => isKeyboardEventMatch(e, k));

      if (e.key === "Escape") {
        e.stopPropagation();
        if (searchQuery) {
          setSearchQuery("");
        } else {
          handleClose();
        }
      } else if (isInfoHotkey) {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      } else if (e.ctrlKey && (e.key === "f" || e.key === "F" || e.key === "а" || e.key === "А")) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [searchQuery, handleClose]);

  // Парсинг и структурирование отчёта по секциям
  const baseReport = useMemo(() => {
    if (!data?.text) return { rawText: "", cleanText: "", lines: [], sections: [] };
    return parseMediaInfoLines(data.text, lang);
  }, [data?.text, lang]);

  // Список доступных интерактивных чипов-вкладок (только непустые)
  const categoryTabs = useMemo(() => {
    return buildCategoryTabs(baseReport.sections, lang);
  }, [baseReport.sections, lang]);

  // Фильтрация и подсветка поиска по свойствам категорий
  const displaySections = useMemo(() => {
    return filterAndProcessSections(baseReport.sections, activeCategory, searchQuery);
  }, [baseReport.sections, activeCategory, searchQuery]);

  // Переключение состояния сворачивания отдельной секции
  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  // Проверка: все ли отображаемые секции свернуты
  const areAllCollapsed = useMemo(() => {
    if (displaySections.length === 0) return false;
    return displaySections.every((sec) => collapsedSections.has(sec.id));
  }, [displaySections, collapsedSections]);

  // Свернуть все / Развернуть все
  const toggleCollapseAll = useCallback(() => {
    if (areAllCollapsed) {
      setCollapsedSections(new Set());
    } else {
      const allIds = new Set(displaySections.map((s) => s.id));
      setCollapsedSections(allIds);
    }
  }, [areAllCollapsed, displaySections]);

  // 搜索匹配数量（按实际匹配的行 + 分区标题统计）
  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    let count = 0;
    for (const sec of displaySections) {
      for (const row of sec.rows) {
        if (row.isMatch) count++;
      }
    }
    return count;
  }, [searchQuery, displaySections]);

  // 搜索结果导航（Enter / Shift+Enter 与 ↑ / ↓）
  const { activeMatchIndex, jumpMatch, handleSearchKeyDown } = useMediaInfoSearchNav({
    searchQuery,
    activeCategory,
    matchCount,
    bodyRef,
    motionAllowed,
  });

  // Копирование полного отчёта в буфер обмена без лишних пробелов перед двоеточием
  const handleCopy = useCallback(async () => {
    const textToCopy = baseReport.cleanText || baseReport.rawText;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Ошибка копирования в буфер обмена:", e);
    }
  }, [baseReport.cleanText, baseReport.rawText]);

  // Копирование отдельной категории в буфер обмена
  const handleCopySection = useCallback(async (sectionTitle: string, sectionCleanText: string) => {
    if (!sectionCleanText) return;
    try {
      await navigator.clipboard.writeText(sectionCleanText);
      setCopiedSectionId(sectionTitle);
      if (copySectionTimerRef.current) clearTimeout(copySectionTimerRef.current);
      copySectionTimerRef.current = setTimeout(() => setCopiedSectionId(null), 2000);
    } catch (e) {
      console.error("Ошибка копирования категории:", e);
    }
  }, []);

  // Экспорт отчёта в .txt без лишних пробелов
  const handleExportTxt = useCallback(() => {
    const textToExport = baseReport.cleanText || baseReport.rawText;
    if (!textToExport) return;
    try {
      const name = fileName ? `${fileName}.mediainfo.txt` : "mediainfo.txt";
      const blob = new Blob([textToExport], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Ошибка экспорта в текстовый файл:", e);
    }
  }, [baseReport.cleanText, baseReport.rawText, fileName]);

  return (
    <div
      className={`mediainfo-standalone ${isCapsule ? "mediainfo-standalone--capsule" : ""} ${isDragOver ? "mediainfo-standalone--drag-over" : ""}`}
      {...dragHandlers}
    >
      {isDragOver && (
        <div className="mediainfo-standalone__drag-overlay">
          <div className="mediainfo-standalone__drag-box">
            <FileUp size={44} className="mediainfo-standalone__drag-icon" />
            <span className="mediainfo-standalone__drag-title">
              {L("Отпустите медиафайл для анализа", "Drop media file to analyze", "松开以分析媒体文件")}
            </span>
            <span className="mediainfo-standalone__drag-sub">
              {L(
                "L-MPV мгновенно сформирует отчёт MediaInfo",
                "L-MPV will instantly analyze media container properties",
                "L-MPV 将立即分析媒体容器属性"
              )}
            </span>
          </div>
        </div>
      )}

      {/* ─── Кастомный заголовок окна с нативной поддержкой перетаскивания Tauri ──── */}
      <div 
        className="mediainfo-standalone__titlebar" 
        data-tauri-drag-region
        onDoubleClick={handleToggleMaximize}
      >
        <div 
          className="mediainfo-standalone__titlebar-left"
          data-tauri-drag-region
        >
          <span className="mediainfo-standalone__icon" data-tauri-drag-region>
            <FileText size={16} />
          </span>
          {fileName ? (
            <span 
              className="mediainfo-standalone__filename" 
              title={filePath}
              data-tauri-drag-region
            >
              {fileName}
            </span>
          ) : null}
        </div>

        <div className="mediainfo-standalone__window-controls">
          <button
            type="button"
            className={`mediainfo-standalone__control-btn ${isAlwaysOnTop ? "mediainfo-standalone__control-btn--active" : ""}`}
            aria-label={
              isAlwaysOnTop
                ? L("Открепить от верха окон", "Unpin from top", "取消窗口置顶")
                : L("Закрепить поверх всех окон", "Keep on top", "窗口置顶")
            }
            onClick={handleToggleAlwaysOnTop}
          >
            <Pin size={13} style={{ transform: isAlwaysOnTop ? "rotate(45deg)" : "none", color: isAlwaysOnTop ? "var(--accent-text)" : "inherit" }} />
          </button>
          <button
            type="button"
            className="mediainfo-standalone__control-btn"
            aria-label={L("Свернуть", "Minimize", "最小化")}
            onClick={handleMinimize}
          >
            <Minus size={13} />
          </button>
          <button
            type="button"
            className="mediainfo-standalone__control-btn"
            aria-label={isMaximized ? L("Восстановить", "Restore", "还原") : L("Развернуть", "Maximize", "最大化")}
            onClick={handleToggleMaximize}
          >
            {isMaximized ? <Minimize2 size={12} /> : <Square size={11} />}
          </button>
          <button
            type="button"
            className="mediainfo-standalone__control-btn mediainfo-standalone__control-btn--close"
            aria-label={L("Закрыть (Esc)", "Close (Esc)", "关闭 (Esc)")}
            onClick={handleClose}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ─── Панель инструментов: Поиск, Язык, Копировать, Экспорт ──── */}
      <div className="mediainfo-standalone__toolbar">
        <div className="mediainfo-standalone__search-wrapper">
          <Search size={13} className="mediainfo-standalone__search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="mediainfo-standalone__search-input"
            placeholder={L("Поиск по свойствам... (Ctrl+F)", "Search properties... (Ctrl+F)", "搜索属性... (Ctrl+F)")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchQuery && (
            <div className="mediainfo-standalone__search-stats">
              <span
                className={`mediainfo-standalone__search-count ${
                  matchCount === 0 ? "mediainfo-standalone__search-count--empty" : ""
                }`}
              >
                {matchCount > 0 ? `${activeMatchIndex + 1}/${matchCount}` : "0"}
              </span>
              <button
                type="button"
                className="mediainfo-standalone__btn-icon"
                title={L("Предыдущее совпадение (Shift+Enter)", "Previous match (Shift+Enter)", "上一个匹配 (Shift+Enter)")}
                aria-label={L("Предыдущее совпадение", "Previous match", "上一个匹配")}
                onClick={() => jumpMatch(-1)}
                disabled={matchCount === 0}
              >
                <ChevronUp size={12} />
              </button>
              <button
                type="button"
                className="mediainfo-standalone__btn-icon"
                title={L("Следующее совпадение (Enter)", "Next match (Enter)", "下一个匹配 (Enter)")}
                aria-label={L("Следующее совпадение", "Next match", "下一个匹配")}
                onClick={() => jumpMatch(1)}
                disabled={matchCount === 0}
              >
                <ChevronDown size={12} />
              </button>
              <button
                type="button"
                className="mediainfo-standalone__btn-icon"
                title={L("Очистить поиск", "Clear search", "清除搜索")}
                aria-label={L("Очистить поиск", "Clear search", "清除搜索")}
                onClick={() => setSearchQuery("")}
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="mediainfo-standalone__actions">
          <div className="mediainfo-standalone__zoom-group">
            <button
              type="button"
              className="mediainfo-standalone__zoom-btn"
              title={L("Уменьшить масштаб окна", "Zoom out (this window only)", "缩小窗口字号（仅此窗口）")}
              onClick={() => adjustMiZoom(-0.05)}
              >
              −
            </button>
            <button
              type="button"
              className="mediainfo-standalone__zoom-value"
              title={L("Сбросить масштаб до общего", "Reset zoom to interface scale", "重置为与界面缩放一致")}
              onClick={() => setMiZoom(1)}
              >
              {Math.round(uiScale * miZoom * 100)}%
            </button>
            <button
              type="button"
              className="mediainfo-standalone__zoom-btn"
              title={L("Увеличить масштаб окна", "Zoom in (this window only)", "放大窗口字号（仅此窗口）")}
              onClick={() => adjustMiZoom(0.05)}
              >
              +
            </button>
          </div>

          <button
            type="button"
            className={`mediainfo-standalone__action-btn ${lang !== "en" ? "mediainfo-standalone__action-btn--active" : ""}`}
            title={L("Переключить язык (Русский / Английский / Китайский)", "Switch language (Russian / English / Chinese)", "切换语言（Русский / English / 中文）")}
            aria-label={L("Переключить язык (Русский / Английский / Китайский)", "Switch language (Russian / English / Chinese)", "切换语言（Русский / English / 中文）")}
            onClick={() => setLang((p) => (p === "ru" ? "en" : p === "en" ? "zh" : "ru"))}
          >
            <Languages size={13} />
            <span>{lang === "ru" ? "RU" : lang === "zh" ? "中文" : "EN"}</span>
          </button>

          <span className="mediainfo-actions-divider" aria-hidden="true" />

          <button
            type="button"
            className="mediainfo-standalone__action-btn mediainfo-standalone__action-btn--icon"
            title={L(copied ? "Скопировано!" : "Копировать отчёт в буфер", copied ? "Copied!" : "Copy report to clipboard", copied ? "已复制！" : "复制报告到剪贴板")}
            aria-label={L(copied ? "Скопировано!" : "Копировать отчёт в буфер", copied ? "Copied!" : "Copy report to clipboard", copied ? "已复制！" : "复制报告到剪贴板")}
            onClick={handleCopy}
            disabled={!baseReport.rawText}
          >
            {copied ? <Check size={14} color="var(--success-text)" /> : <Copy size={14} />}
          </button>

          <button
            type="button"
            className="mediainfo-standalone__action-btn mediainfo-standalone__action-btn--icon"
            title={L("Экспорт в .txt", "Export to .txt", "导出为 .txt")}
            aria-label={L("Экспорт в .txt", "Export to .txt", "导出为 .txt")}
            onClick={handleExportTxt}
            disabled={!baseReport.rawText}
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* ─── Интерактивные чипы-вкладки категорий и управление аккордеоном ──── */}
      {!loading && !error && (
        <MediaInfoTabsBar
          tabs={categoryTabs}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          areAllCollapsed={areAllCollapsed}
          onToggleCollapseAll={toggleCollapseAll}
          lang={lang}
        />
      )}

      {/* ─── Основное тело отчёта ──── */}
      <div ref={bodyRef} className="mediainfo-standalone__body">
        {loading && (
          <div className="mediainfo-standalone__center-state">
            <Loader2 className="mediainfo-standalone__spinner" size={24} />
            <span>{L("Анализ медиаконтейнера...", "Analyzing media container...", "正在分析媒体容器...")}</span>
          </div>
        )}

        {error && !loading && (
          <div className="mediainfo-standalone__center-state mediainfo-standalone__center-state--error">
            <AlertCircle size={24} />
            <span>
              {error === "NO_PATH"
                ? L("Путь к файлу не передан", "File path not specified", "未指定文件路径")
                : error === "NO_FILE"
                ? L("Файл для анализа не указан", "No file specified for analysis", "未指定要分析的文件")
                : error === "INIT_ERROR"
                ? L("Ошибка инициализации окна MediaInfo", "MediaInfo window initialization error", "MediaInfo 窗口初始化错误")
                : error === "DLL_ERROR"
                ? L("Не удалось проанализировать файл с помощью MediaInfo.dll", "Failed to analyze file with MediaInfo.dll", "无法使用 MediaInfo.dll 分析文件")
                : error}
            </span>
            {filePath && (
              <button
                type="button"
                className="mediainfo-standalone__action-btn mt-4"
                onClick={() => loadMediaInfoForPath(filePath)}
              >
                <RefreshCw size={12} />
                <span>{L("Повторить анализ", "Retry analysis", "重试分析")}</span>
              </button>
            )}
          </div>
        )}

        {!loading && !error && data && (
          <MediaInfoSectionList
            sections={displaySections}
            collapsedSections={collapsedSections}
            onToggleSection={toggleSection}
            onCopySection={handleCopySection}
            copiedSectionId={copiedSectionId}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
};
