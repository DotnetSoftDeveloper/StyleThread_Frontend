import React from "react";
import "./FilterBar.css";
import { Category } from "../../Types/Interface/DropDown";
import { DEFAULT_CATEGORIES } from "../../Utils/constants";

interface FilterBarProps {
  onCategorySelect: (category: Category) => void;
  selectedCategoryId?: number | null;
  categories?: Category[];
}

const FilterBar: React.FC<FilterBarProps> = ({
  onCategorySelect,
  selectedCategoryId = null,
  categories = DEFAULT_CATEGORIES
}) => {
  const handleCategoryClick = (category: Category) => {
    onCategorySelect(category);
  };

  return (
    <div className="filter-bar-wrapper">
      <nav className="filter-bar" aria-label="Product categories">
        <ul className="filter-options" role="tablist">
          {categories.map((category) => {
            const isSelected =
              (category.value === 0 &&
                (selectedCategoryId === null || selectedCategoryId === 0)) ||
              selectedCategoryId === category.value;

            const isAll = category.value === 0;

            return (
              <React.Fragment key={category.value}>
                <li
                  className={`filter-item${isAll ? " filter-item--all" : ""}${isSelected ? " filter-item--active" : ""}`}
                  onClick={() => handleCategoryClick(category)}
                  role="tab"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCategoryClick(category);
                    }
                  }}
                >
                  <span className="filter-item-text">{category.label}</span>
                </li>
                {/* Divider after the "All" pill */}
                {isAll && <span className="filter-divider" aria-hidden="true" />}
              </React.Fragment>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default FilterBar;
