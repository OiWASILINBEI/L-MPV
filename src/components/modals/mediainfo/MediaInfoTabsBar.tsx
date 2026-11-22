import { SelectionRail } from "../../motion/SelectionRail";
import React from "react";
import { ChevronsUpDown } from "lucide-react";
import { CategoryKey, MediaInfoCategoryTab } from "./mediaInfoTypes";
import { MediaInfoLang } from "../../../utils/mediaInfoParser";

interface MediaInfoTabsBarProps {
  tabs: MediaInfoCategoryTab[];
  activeCategory: CategoryKey;
  onSelectCategory: (category: CategoryKey) => void;
  areAllCollapsed: boolean;
  onToggleCollapseAll: () => void;
  useRussian?: MediaInfoLang;
  lang?: MediaInfoLang;
  style?: React.CSSProperties;
}

export const MediaInfoTabsBar: React.FC<MediaInfoTabsBarProps> = React.memo(({
  tabs,
  activeCategory,
  onSelectCategory,
  areAllCollapsed,
  onToggleCollapseAll,
  useRussian,
  lang,
  style,
}) => {
  const activeLang: MediaInfoLang = lang ?? useRussian ?? "ru";
  const L = (ru: string, en: string, zh: string) => (activeLang === "ru" ? ru : activeLang === "zh" ? zh : en);
  if (tabs.length <= 1) return null;

  return (
    <div className="mediainfo-standalone__tabs-bar" style={style}>
      <SelectionRail activeKey={activeCategory} className="mediainfo-standalone__tabs-list">
        {tabs.map((tab) => {
          const isActive = activeCategory === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              aria-current={isActive ? "true" : undefined}
              className={`mediainfo-tab-chip ${isActive ? "mediainfo-tab-chip--active" : ""}`}
              onClick={() => onSelectCategory(isActive && tab.key !== "all" ? "all" : tab.key)}
            >
              <span className="mediainfo-tab-chip__label">{tab.label}</span>
              {tab.count > 1 && (
                <span className="mediainfo-tab-chip__badge">{tab.count}</span>
              )}
            </button>
          );
        })}
      </SelectionRail>

      <span className="mediainfo-tabs-divider" aria-hidden="true" />

      <button
        type="button"
        className="mediainfo-tab-action-btn"
        onClick={onToggleCollapseAll}
      >
        <ChevronsUpDown size={12} />
        <span>
          {areAllCollapsed
            ? L("Развернуть", "Expand", "展开")
            : L("Свернуть", "Collapse", "折叠")}
        </span>
      </button>
    </div>
  );
});

MediaInfoTabsBar.displayName = "MediaInfoTabsBar";
