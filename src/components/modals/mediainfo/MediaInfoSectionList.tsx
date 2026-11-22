import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { MediaInfoProcessedSection, getSectionCategoryKey } from "./mediaInfoTypes";
import { MediaInfoLang } from "../../../utils/mediaInfoParser";

interface MediaInfoSectionItemProps {
  section: MediaInfoProcessedSection;
  isCollapsed: boolean;
  onToggleCollapse: (sectionId: string) => void;
  onCopySection: (sectionTitle: string, sectionCleanText: string) => void;
  isCopied: boolean;
  copiedRowId: string | number | null;
  onCopyRow: (rowId: string | number, value: string) => void;
  lang: MediaInfoLang;
}

/** Определение флага дорожки по умолчанию / принудительной по строкам MediaInfo. */
function getTrackFlagBadge(
  section: MediaInfoProcessedSection,
  lang: MediaInfoLang
): string | null {
  const cat = getSectionCategoryKey(section.title);
  if (cat !== "audio" && cat !== "text") return null;

  let isDefault = false;
  let isForced = false;
  for (const r of section.rows) {
    const k = r.key.trim().toLowerCase();
    const v = r.value.trim().toLowerCase();
    const truthy = v === "yes" || v === "да";
    if (!truthy) continue;
    if (k === "default" || k === "по умолчанию") isDefault = true;
    if (k === "forced" || k === "принудительно") isForced = true;
  }
  if (isForced) return lang === "ru" ? "Принуд." : lang === "zh" ? "强制" : "Forced";
  if (isDefault) return lang === "ru" ? "По умолч." : lang === "zh" ? "默认" : "Default";
  return null;
}

export const MediaInfoSectionItem: React.FC<MediaInfoSectionItemProps> = React.memo(({
  section,
  isCollapsed,
  onToggleCollapse,
  onCopySection,
  isCopied,
  copiedRowId,
  onCopyRow,
  lang,
}) => {
  // Если в секции найдены совпадения поиска, принудительно держим её развернутой
  const effectiveCollapsed = isCollapsed && !section.hasMatches;
  const flagBadge = getTrackFlagBadge(section, lang);
  const L = (ru: string, en: string, zh: string) => (lang === "ru" ? ru : lang === "zh" ? zh : en);

  return (
    <div className="mediainfo-section">
      <div className="mediainfo-section__header">
        <div className="mediainfo-section__header-left">
          <button
            type="button"
            className="mediainfo-section__collapse-trigger"
            onClick={() => onToggleCollapse(section.id)}
          >
            <span className="mediainfo-section__chevron">
              {effectiveCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </span>
            <span className="mediainfo-section__title">{section.title}</span>
            <span className="mediainfo-section__count-badge">
              {section.rows.length} {L("свойств", "props", "项属性")}
            </span>
            {section.matchesCount > 0 && (
              <span className="mediainfo-section__match-badge">
                {section.matchesCount} {L("совп.", "match", "个匹配")}
              </span>
            )}
          </button>

          {flagBadge && (
            <span className="mediainfo-section__flag-badge">{flagBadge}</span>
          )}

          {section.streamTitle && (
            <span
              className="mediainfo-section__stream-title"
              title={section.streamTitle}
            >
              {section.streamTitle}
            </span>
          )}
        </div>

        <button
          type="button"
          className={`mediainfo-section__copy-btn ${
            isCopied ? "mediainfo-section__copy-btn--copied" : ""
          }`}
          title={
            L(
              `Скопировать категорию «${section.title}${section.streamTitle ? ` — ${section.streamTitle}` : ""}»`,
              `Copy "${section.title}${section.streamTitle ? ` — ${section.streamTitle}` : ""}"`,
              `复制分类「${section.title}${section.streamTitle ? ` — ${section.streamTitle}` : ""}」`,
            )
          }
          onClick={() => onCopySection(section.title, section.cleanText)}
        >
          {isCopied ? <Check size={13} color="var(--success-text)" /> : <Copy size={13} />}
        </button>
      </div>

      {!effectiveCollapsed && (
        <div className="mediainfo-section__rows">
          {section.rows.map((row) => {
            const isRowCopied = copiedRowId === row.id;
            return (
              <div
                key={row.id}
                className={`mediainfo-row ${row.isMatch ? "mediainfo-row--match" : ""}`}
              >
                <span className="mediainfo-row__key">{row.key}</span>
                <span className="mediainfo-row__colon">:</span>
                <span className="mediainfo-row__val">{row.value}</span>
                {row.value && (
                  <button
                    type="button"
                    className={`mediainfo-row__copy-btn ${
                      isRowCopied ? "mediainfo-row__copy-btn--copied" : ""
                    }`}
                    title={
                      L(
                        isRowCopied ? "Скопировано!" : "Скопировать значение",
                        isRowCopied ? "Copied!" : "Copy value",
                        isRowCopied ? "已复制！" : "复制该项的值",
                      )
                    }
                    aria-label={
                      L(`Скопировать ${row.key}`, `Copy ${row.key}`, `复制 ${row.key}`)
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyRow(row.id, row.value);
                    }}
                  >
                    {isRowCopied ? <Check size={11} color="var(--success-text)" /> : <Copy size={11} />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

MediaInfoSectionItem.displayName = "MediaInfoSectionItem";

interface MediaInfoSectionListProps {
  sections: MediaInfoProcessedSection[];
  collapsedSections: Set<string>;
  onToggleSection: (sectionId: string) => void;
  onCopySection: (sectionTitle: string, sectionCleanText: string) => void;
  copiedSectionId: string | null;
  lang: MediaInfoLang;
}

export const MediaInfoSectionList: React.FC<MediaInfoSectionListProps> = React.memo(({
  sections,
  collapsedSections,
  onToggleSection,
  onCopySection,
  copiedSectionId,
  lang,
}) => {
  const [copiedRowId, setCopiedRowId] = useState<string | number | null>(null);
  const copyRowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyRowTimerRef.current) clearTimeout(copyRowTimerRef.current);
    };
  }, []);

  const handleCopyRow = useCallback(async (rowId: string | number, value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedRowId(rowId);
      if (copyRowTimerRef.current) clearTimeout(copyRowTimerRef.current);
      copyRowTimerRef.current = setTimeout(() => setCopiedRowId(null), 1500);
    } catch (e) {
      console.error("Ошибка копирования значения свойства:", e);
    }
  }, []);

  return (
    <div className="mediainfo-standalone__content">
      {sections.map((section) => (
        <MediaInfoSectionItem
          key={section.id}
          section={section}
          isCollapsed={collapsedSections.has(section.id)}
          onToggleCollapse={onToggleSection}
          onCopySection={onCopySection}
          isCopied={copiedSectionId === section.title}
          copiedRowId={copiedRowId}
          onCopyRow={handleCopyRow}
          lang={lang}
        />
      ))}
    </div>
  );
});

MediaInfoSectionList.displayName = "MediaInfoSectionList";
