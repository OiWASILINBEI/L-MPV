import React from "react";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { MediaInfoProcessedSection } from "./mediaInfoTypes";
import { MediaInfoLang } from "../../../utils/mediaInfoParser";

interface MediaInfoSectionItemProps {
  section: MediaInfoProcessedSection;
  isCollapsed: boolean;
  onToggleCollapse: (sectionId: string) => void;
  onCopySection: (sectionTitle: string, sectionCleanText: string) => void;
  isCopied: boolean;
  lang: MediaInfoLang;
}

export const MediaInfoSectionItem: React.FC<MediaInfoSectionItemProps> = React.memo(({
  section,
  isCollapsed,
  onToggleCollapse,
  onCopySection,
  isCopied,
  lang,
}) => {
  const L = (ru: string, en: string, zh: string) => (lang === "ru" ? ru : lang === "zh" ? zh : en);
  // Если в секции найдены совпадения поиска, принудительно держим её развернутой
  const effectiveCollapsed = isCollapsed && !section.hasMatches;

  return (
    <div className="mediainfo-section">
      <div className="mediainfo-section__header">
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

        <button
          type="button"
          className={`mediainfo-section__copy-btn ${
            isCopied ? "mediainfo-section__copy-btn--copied" : ""
          }`}
          title={L(`Скопировать категорию «${section.title}»`, `Copy "${section.title}"`, `复制分类「${section.title}」`)}
          onClick={() => onCopySection(section.title, section.cleanText)}
        >
          {isCopied ? (

              <Check size={13} color="var(--success-text)" />


          ) : (

              <Copy size={13} />


          )}
        </button>
      </div>

      {!effectiveCollapsed && (
        <div className="mediainfo-section__rows">
          {section.rows.map((row) => (
            <div
              key={row.id}
              className={`mediainfo-row ${row.isMatch ? "mediainfo-row--match" : ""}`}
            >
              <span className="mediainfo-row__key">{row.key}</span>
              <span className="mediainfo-row__colon">:</span>
              <span className="mediainfo-row__val">{row.value}</span>
            </div>
          ))}
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
          lang={lang}
        />
      ))}
    </div>
  );
});

MediaInfoSectionList.displayName = "MediaInfoSectionList";
