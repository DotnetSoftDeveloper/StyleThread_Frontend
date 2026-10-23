import React, { useState } from "react";
import "./SizeGuideModal.css";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

type Unit = "in" | "cm";
type CategoryKey = "shirts" | "tshirts" | "trousers" | "dresses";
type FitType = "slim" | "regular" | "relaxed";

interface SizeRow {
  size: string;
  col1: number; // e.g., Chest / Bust / Waist
  col2: number; // e.g., Waist / Hip
  col3: number; // e.g., Shoulder / Inseam
  col4: number; // e.g., Length
}

const CATEGORY_DATA: Record<
  CategoryKey,
  {
    title: string;
    headers: [string, string, string, string];
    rows: SizeRow[]; // Base measurements in inches
  }
> = {
  shirts: {
    title: "Shirts & Formal Tops",
    headers: ["Chest", "Waist", "Shoulder", "Length"],
    rows: [
      { size: "S (38)", col1: 38, col2: 34, col3: 17.5, col4: 28.5 },
      { size: "M (40)", col1: 40, col2: 36, col3: 18.2, col4: 29.5 },
      { size: "L (42)", col1: 42, col2: 38, col3: 19.0, col4: 30.5 },
      { size: "XL (44)", col1: 44, col2: 40, col3: 19.8, col4: 31.5 },
      { size: "XXL (46)", col1: 46, col2: 42, col3: 20.5, col4: 32.5 },
    ],
  },
  tshirts: {
    title: "T-Shirts & Polos",
    headers: ["Chest", "Length", "Shoulder", "Sleeve"],
    rows: [
      { size: "S", col1: 36, col2: 26.5, col3: 16.5, col4: 7.5 },
      { size: "M", col1: 39, col2: 27.5, col3: 17.5, col4: 8.0 },
      { size: "L", col1: 42, col2: 28.5, col3: 18.5, col4: 8.5 },
      { size: "XL", col1: 45, col2: 29.5, col3: 19.5, col4: 9.0 },
      { size: "XXL", col1: 48, col2: 30.5, col3: 20.5, col4: 9.5 },
    ],
  },
  trousers: {
    title: "Trousers & Chinos",
    headers: ["Waist", "Hip", "Inseam", "Length"],
    rows: [
      { size: "30", col1: 30, col2: 38, col3: 31.0, col4: 40.5 },
      { size: "32", col1: 32, col2: 40, col3: 31.5, col4: 41.5 },
      { size: "34", col1: 34, col2: 42, col3: 32.0, col4: 42.0 },
      { size: "36", col1: 36, col2: 44, col3: 32.5, col4: 42.5 },
      { size: "38", col1: 38, col2: 46, col3: 33.0, col4: 43.0 },
    ],
  },
  dresses: {
    title: "Dresses & Ethnic Wear",
    headers: ["Bust", "Waist", "Hip", "Length"],
    rows: [
      { size: "XS", col1: 32, col2: 26, col3: 35, col4: 44.0 },
      { size: "S", col1: 34, col2: 28, col3: 37, col4: 45.0 },
      { size: "M", col1: 36, col2: 30, col3: 39, col4: 46.0 },
      { size: "L", col1: 39, col2: 33, col3: 42, col4: 47.0 },
      { size: "XL", col1: 42, col2: 36, col3: 45, col4: 47.5 },
    ],
  },
};

const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  productName,
}) => {
  const [activeTab, setActiveTab] = useState<CategoryKey>("shirts");
  const [unit, setUnit] = useState<Unit>("in");

  // Fit Calculator State
  const [calcChest, setCalcChest] = useState<string>("");
  const [calcHeight, setCalcHeight] = useState<string>("");
  const [calcFit, setCalcFit] = useState<FitType>("regular");
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCategory = CATEGORY_DATA[activeTab];

  const formatValue = (inches: number) => {
    if (unit === "cm") {
      return (inches * 2.54).toFixed(1);
    }
    return inches.toString();
  };

  const handleCalculateSize = (e: React.FormEvent) => {
    e.preventDefault();
    const chestVal = parseFloat(calcChest);
    if (isNaN(chestVal) || chestVal <= 0) return;

    // Normalize to inches for comparison
    const chestInches = unit === "cm" ? chestVal / 2.54 : chestVal;

    // Adjust for fit preference
    let adjustedChest = chestInches;
    if (calcFit === "slim") adjustedChest -= 1;
    if (calcFit === "relaxed") adjustedChest += 1.5;

    let match = "M";
    if (activeTab === "trousers") {
      if (adjustedChest <= 31) match = "30";
      else if (adjustedChest <= 33) match = "32";
      else if (adjustedChest <= 35) match = "34";
      else if (adjustedChest <= 37) match = "36";
      else match = "38";
    } else {
      if (adjustedChest <= 37) match = "S";
      else if (adjustedChest <= 40.5) match = "M";
      else if (adjustedChest <= 43) match = "L";
      else if (adjustedChest <= 45.5) match = "XL";
      else match = "XXL";
    }

    setRecommendedSize(match);
  };

  return (
    <div
      className="size-guide-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
    >
      <div
        className="size-guide-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="size-guide-header">
          <div>
            <span className="size-guide-badge">Precision Tailoring</span>
            <h2 id="size-guide-title">Garment Size & Fit Guide</h2>
            {productName && (
              <p className="size-guide-subtitle">
                Accurate fit recommendations for <strong>{productName}</strong>
              </p>
            )}
          </div>
          <button
            className="size-guide-close"
            onClick={onClose}
            aria-label="Close size guide"
          >
            ✕
          </button>
        </div>

        {/* Category Tabs & Unit Switcher */}
        <div className="size-guide-toolbar">
          <div className="size-guide-tabs" role="tablist">
            {(
              [
                ["shirts", "Shirts & Tops"],
                ["tshirts", "T-Shirts & Polos"],
                ["trousers", "Trousers & Chinos"],
                ["dresses", "Dresses & Ethnic"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeTab === key}
                className={`size-tab ${activeTab === key ? "size-tab--active" : ""}`}
                onClick={() => {
                  setActiveTab(key);
                  setRecommendedSize(null);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="size-unit-toggle" aria-label="Measurement unit">
            <button
              type="button"
              className={`unit-btn ${unit === "in" ? "unit-btn--active" : ""}`}
              onClick={() => setUnit("in")}
            >
              Inches (in)
            </button>
            <button
              type="button"
              className={`unit-btn ${unit === "cm" ? "unit-btn--active" : ""}`}
              onClick={() => setUnit("cm")}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="size-guide-body">
          {/* Smart Fit Calculator */}
          <div className="size-calc-card">
            <div className="size-calc-header">
              <span className="size-calc-icon">✨</span>
              <div>
                <h4>Find My Perfect Size</h4>
                <p>Enter your measurements to get tailored size advice</p>
              </div>
            </div>
            <form onSubmit={handleCalculateSize} className="size-calc-form">
              <div className="calc-inputs-row">
                <div className="calc-field">
                  <label>
                    {activeTab === "trousers" ? "Waist Size" : "Chest / Bust"} ({unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={unit === "in" ? "e.g. 40" : "e.g. 102"}
                    value={calcChest}
                    onChange={(e) => setCalcChest(e.target.value)}
                    required
                  />
                </div>

                <div className="calc-field">
                  <label>Height (optional, {unit})</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={unit === "in" ? "e.g. 70" : "e.g. 178"}
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(e.target.value)}
                  />
                </div>

                <div className="calc-field">
                  <label>Preferred Fit</label>
                  <select
                    value={calcFit}
                    onChange={(e) => setCalcFit(e.target.value as FitType)}
                  >
                    <option value="slim">Slim / Snug Fit</option>
                    <option value="regular">Regular Fit (Standard)</option>
                    <option value="relaxed">Relaxed / Comfort Fit</option>
                  </select>
                </div>

                <button type="submit" className="calc-submit-btn">
                  Calculate Size
                </button>
              </div>
            </form>

            {recommendedSize && (
              <div className="size-recommendation-alert">
                <span className="rec-star">🎯</span>
                <div>
                  <strong>Recommended: Size {recommendedSize}</strong>
                  <p>
                    Based on your {calcChest} {unit} measurement and {calcFit} preference, Size {recommendedSize} will provide optimal drape and silhouette.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Size Chart Table */}
          <div className="size-table-container">
            <h4 className="table-caption">
              {currentCategory.title} Measurements ({unit.toUpperCase()})
            </h4>
            <div className="table-responsive">
              <table className="size-table">
                <thead>
                  <tr>
                    <th>Brand Size</th>
                    <th>{currentCategory.headers[0]} ({unit})</th>
                    <th>{currentCategory.headers[1]} ({unit})</th>
                    <th>{currentCategory.headers[2]} ({unit})</th>
                    <th>{currentCategory.headers[3]} ({unit})</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCategory.rows.map((row) => {
                    const isHighlighted = recommendedSize && (row.size === recommendedSize || row.size.startsWith(recommendedSize));
                    return (
                      <tr
                        key={row.size}
                        className={isHighlighted ? "row--recommended" : ""}
                      >
                        <td className="size-name-cell">
                          <strong>{row.size}</strong>
                          {isHighlighted && <span className="rec-tag">Best Match</span>}
                        </td>
                        <td>{formatValue(row.col1)}</td>
                        <td>{formatValue(row.col2)}</td>
                        <td>{formatValue(row.col3)}</td>
                        <td>{formatValue(row.col4)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Measuring Instructions */}
          <div className="how-to-measure-section">
            <h4>📐 How to Measure Accurately</h4>
            <div className="measure-tips-grid">
              <div className="measure-tip">
                <strong>1. Chest / Bust</strong>
                <p>Measure under your arms around the fullest part of your chest. Keep tape level.</p>
              </div>
              <div className="measure-tip">
                <strong>2. Natural Waist</strong>
                <p>Measure around your natural waistline, where your trousers comfortably sit.</p>
              </div>
              <div className="measure-tip">
                <strong>3. Hips / Seat</strong>
                <p>Stand with feet together and measure around the fullest point of your hips.</p>
              </div>
              <div className="measure-tip">
                <strong>4. Garment Length</strong>
                <p>Measure from the highest shoulder seam point down to the bottom hem.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="size-guide-footer">
          <p className="size-guide-guarantee">
            🔄 <strong>Hassle-Free Size Exchanges:</strong> If the fit isn't spot-on, exchange for any other size with free doorstep pickup within 30 days.
          </p>
          <button className="size-guide-done-btn" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;
