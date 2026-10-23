import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import ProductVariant from "../ProductVariant/ProductVariant";
import "./ProductVariantsList.css";
import { ProductVariant as ProductVariantType } from "../../Types/Interface/IProduct";

interface ProductVariantsListProps {
  productVariants: ProductVariantType[];
  selectedVariantIndex: number;
  setSelectedVariantIndex: React.Dispatch<React.SetStateAction<number>>;
  addVariant: () => void;
  deleteVariant: (index: number) => void;
  updateVariant: (index: number, updatedVariant: ProductVariantType) => void;
}

export const ProductVariantsList: React.FC<ProductVariantsListProps> = ({
  productVariants,
  selectedVariantIndex,
  setSelectedVariantIndex,
  addVariant,
  deleteVariant,
  updateVariant
}) => {
  const maxVariants = 5;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteVariant(selectedVariantIndex);
    setSelectedVariantIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  return (
    <div className="pvl-container">
      {/* Header with pill tabs */}
      <div className="pvl-header">
        <h3 className="pvl-title">
          Product Variants
          <span className="pvl-badge">
            {productVariants.length} of {maxVariants}
          </span>
        </h3>
      </div>

      {/* Pill Tab Selector */}
      <div className="pvl-tabs">
        {productVariants.map((variant, index) => (
          <button
            key={variant.productVariantId || index}
            type="button"
            className={`pvl-tab ${selectedVariantIndex === index ? "pvl-tab--active" : ""}`}
            onClick={() => setSelectedVariantIndex(index)}
          >
            Variant #{index + 1}
          </button>
        ))}

        {productVariants.length < maxVariants && (
          <button
            type="button"
            className="pvl-add-tab"
            onClick={() => addVariant()}
            title="Add another variant"
          >
            <FaPlus /> Add Variant
          </button>
        )}
      </div>

      {/* Variant Details Card */}
      <div className="pvl-card">
        <div className="pvl-card-header">
          <span className="pvl-card-title">
            Configuring Variant #{selectedVariantIndex + 1}
          </span>

          {productVariants.length > 1 && (
            <button
              type="button"
              className="pvl-delete-btn"
              onClick={handleDelete}
              title="Delete this variant"
            >
              <FaTrash /> Delete Variant
            </button>
          )}
        </div>

        {productVariants.length > 0 && (
          <ProductVariant
            variantData={productVariants[selectedVariantIndex]}
            updateVariant={(updatedVariant) =>
              updateVariant(selectedVariantIndex, updatedVariant)
            }
          />
        )}
      </div>
    </div>
  );
};
