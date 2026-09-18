import React from "react";
import "./FilterBar.css";
import { Category } from "../../Types/Interface/DropDown";

interface FilterBarProps {
  onCategorySelect: (category: Category) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onCategorySelect }) => {
  const categories: Category[] = [
    { label: "All", value: 0 },
    { label: "Men", value: 1 },
    { label: "Women", value: 2 },
    { label: "Baby & Kids", value: 3 },
    { label: "Sports", value: 15 }
  ];

  const handleCategoryClick = (category: Category) => {
    onCategorySelect(category); // Notify the parent component about category selection
  };

  return (
    <div className="filter-bar">
      <ul className="filter-options">
        {categories.map((category) => (
          <li
            key={category.value}
            className="filter-item"
            onClick={() => handleCategoryClick(category)}
          >
            {category.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FilterBar;
