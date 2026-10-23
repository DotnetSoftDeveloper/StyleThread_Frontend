import React from "react";
import Lottie from "lottie-react";
import {
  FaSearch,
  FaTags,
  FaRedoAlt,
  FaTimes,
  FaLayerGroup,
  FaArrowRight,
  FaMagic
} from "react-icons/fa";
import emptyBoxAnimation from "../../Assests/NoCartItem.json";
import { Category } from "../../Types/Interface/DropDown";
import "./HomeEmptyState.css";

export interface HomeEmptyStateProps {
  searchTerm?: string;
  selectedCategoryId?: number | null;
  selectedCategoryName?: string;
  categories?: Category[];
  onSelectCategory?: (category: Category) => void;
  onClearSearch?: () => void;
  onResetAll?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const HomeEmptyState: React.FC<HomeEmptyStateProps> = ({
  searchTerm,
  selectedCategoryId,
  selectedCategoryName,
  categories = [],
  onSelectCategory,
  onClearSearch,
  onResetAll,
  onRefresh,
  refreshing = false
}) => {
  const isSearchActive = Boolean(searchTerm && searchTerm.trim().length > 0);
  const isCategoryActive = Boolean(
    selectedCategoryId !== null && selectedCategoryId !== 0
  );

  // Determine contextual title and description
  let badgeLabel = "Catalog Update";
  let badgeIcon = <FaMagic aria-hidden="true" />;
  let title = "No Products Available Right Now";
  let description =
    "Our store catalog is currently being updated with fresh styles. Please check back shortly or explore other categories.";

  if (isSearchActive && isCategoryActive) {
    badgeLabel = `Search in ${selectedCategoryName || "Category"}`;
    badgeIcon = <FaSearch aria-hidden="true" />;
    title = `No matching items for "${searchTerm}"`;
    description = `We couldn't find any products matching "${searchTerm}" in the ${
      selectedCategoryName || "selected"
    } category. Try clearing your search or switching to all collections.`;
  } else if (isSearchActive) {
    badgeLabel = "Search Result";
    badgeIcon = <FaSearch aria-hidden="true" />;
    title = `No matches found for "${searchTerm}"`;
    description =
      "Check your spelling, try broader keywords (e.g. \"shirt\", \"denim\", \"casual\"), or clear the search filter to browse the entire collection.";
  } else if (isCategoryActive) {
    badgeLabel = `${selectedCategoryName || "Category"} Collection`;
    badgeIcon = <FaTags aria-hidden="true" />;
    title = `New ${selectedCategoryName || "Category"} Styles Coming Soon`;
    description = `We are currently curating the latest fashion arrivals for ${
      selectedCategoryName || "this category"
    }. Explore our other popular collections while we restock!`;
  }

  // Filter out the currently selected category for the quick explore pills
  const otherCategories = categories.filter((cat) => {
    if (isCategoryActive) {
      return cat.value !== selectedCategoryId && cat.value !== 0;
    }
    return cat.value !== 0;
  });

  return (
    <div className="home-empty-state" role="status" aria-live="polite">
      <div className="home-empty-state__card">
        {/* Animated Illustration with soft glowing aura */}
        <div className="home-empty-state__animation-wrapper">
          <div className="home-empty-state__glow-ring" />
          <div className="home-empty-state__lottie-container">
            <Lottie
              animationData={emptyBoxAnimation}
              loop={true}
              className="home-empty-state__lottie"
            />
          </div>
        </div>

        {/* Status Pill Badge */}
        <div className="home-empty-state__badge">
          {badgeIcon}
          <span>{badgeLabel}</span>
        </div>

        {/* Headings */}
        <h3 className="home-empty-state__title">{title}</h3>
        <p className="home-empty-state__description">{description}</p>

        {/* Primary Action Buttons */}
        <div className="home-empty-state__actions">
          {(isSearchActive || isCategoryActive) && onResetAll && (
            <button
              type="button"
              className="home-empty-btn home-empty-btn--primary"
              onClick={onResetAll}
            >
              <FaLayerGroup aria-hidden="true" />
              <span>Explore All Collections</span>
            </button>
          )}

          {isSearchActive && onClearSearch && (
            <button
              type="button"
              className="home-empty-btn home-empty-btn--secondary"
              onClick={onClearSearch}
            >
              <FaTimes aria-hidden="true" />
              <span>Clear Search</span>
            </button>
          )}

          {onRefresh && (
            <button
              type="button"
              className="home-empty-btn home-empty-btn--ghost"
              onClick={onRefresh}
              disabled={refreshing}
            >
              <FaRedoAlt
                className={refreshing ? "spin-icon" : ""}
                aria-hidden="true"
              />
              <span>{refreshing ? "Refreshing..." : "Refresh Catalog"}</span>
            </button>
          )}
        </div>

        {/* Quick Category Jump Pills */}
        {otherCategories.length > 0 && onSelectCategory && (
          <div className="home-empty-state__quick-categories">
            <span className="home-empty-state__quick-label">
              Popular Collections to Explore:
            </span>
            <div className="home-empty-state__pills-row">
              {otherCategories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className="home-empty-pill"
                  onClick={() => onSelectCategory(cat)}
                >
                  <span>{cat.label}</span>
                  <FaArrowRight aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeEmptyState;
