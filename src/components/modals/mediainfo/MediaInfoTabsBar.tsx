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
  lang: MediaInfoLang;
  style?: React.CSSProperties;
}

export const MediaInfoTabsBar: React.FC<MediaInfoTabsBarProps> = React.memo(({
  tabs,
  activeCategory,
  onSelectCategory,
  areAllCollapsed,
  onToggleCollapseAll,
  lang,
  style,
}) => {
  const L = (ru: string, en: string, zh: string) => (lang === "ru" ? ru : lang === "zh" ? zh : en);
  if (tabs.length <= 1) return null;

  return (
    <div className="mediainfo-standalone__tabs-bar" style={style}>
      <div className="mediainfo-standalone__tabs-list">
        {tabs.map((tab) => {
          const isActive = activeCategory === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              className={`mediainfo-tab-chip ${isActive ? "mediainfo-tab-chip--active" : ""}`}
              onClick={() => onSelectCategory(isActive && tab.key !== "all" ? "all" : tab.key)}
            >
              <span>{tab.label}</span>
              {tab.count > 1 && (
                <span className="mediainfo-tab-chip__badge">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

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
