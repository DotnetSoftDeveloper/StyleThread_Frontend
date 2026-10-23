import React, { useEffect, useState } from "react";
import Select, { MultiValue } from "react-select";
import { useSelector } from "react-redux";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import type {
  ProductVariant as ProductVariantType
} from "../../Types/Interface/IProduct";
import { RootState } from "../../Store/ConfigureStore";

interface DropdownOption {
  value: number;
  label: string;
}

interface ProductVariantProps {
  variantData: ProductVariantType;
  updateVariant: (variant: ProductVariantType) => void;
}

const ProductVariant: React.FC<ProductVariantProps> = ({
  variantData,
  updateVariant
}) => {
  const dropdowns = useSelector((state: RootState) => {
    const list = state.addProducts.list;
    return Array.isArray(list) ? list[0] : list;
  });

  const [localVariant, setLocalVariant] = useState<ProductVariantType>({
    ...variantData,
    price: variantData?.price ?? "",
    salePrice: variantData?.salePrice ?? "",
    inventory: variantData?.inventory ?? "",
    discount: variantData?.discount ?? 0,
    colorId: variantData?.colorId ?? "",
    productVariantSizes: variantData?.productVariantSizes ?? [],
    image: variantData?.image ?? []
  });

  useEffect(() => {
    setLocalVariant((prev) => ({
      ...prev,
      ...variantData,
      productVariantSizes: variantData?.productVariantSizes || []
    }));
  }, [variantData]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    const updatedVariant = { ...localVariant, [name]: value };
    setLocalVariant(updatedVariant);
    updateVariant(updatedVariant);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    Promise.all(
      files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result?.split(",")[1] || "");
          };
          reader.readAsDataURL(file);
        });
      })
    ).then((updatedImages: string[]) => {
      const updatedVariant = {
        ...localVariant,
        image: [...localVariant.image, ...updatedImages]
      };
      setLocalVariant(updatedVariant);
      updateVariant(updatedVariant);
    });
  };

  const handleRemoveImage = (
    index: number,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const updatedImages = localVariant.image.filter((_, i) => i !== index);
    setLocalVariant((prev) => ({ ...prev, image: updatedImages }));
    updateVariant({ ...localVariant, image: updatedImages });
  };

  const handleSelectChange = (selectedSizes: MultiValue<DropdownOption>) => {
    const updatedVariantSizes = selectedSizes.map((size) => ({
      productVariantId: localVariant.productVariantId || 0,
      sizeId: size.value,
      size: {
        sizeId: size.value,
        sizeName: size.label
      }
    }));

    const updatedVariant = {
      ...localVariant,
      productVariantSizes: updatedVariantSizes
    };

    setLocalVariant(updatedVariant);
    updateVariant(updatedVariant);
  };

  const formatValue = (value: unknown): string => {
    if (value === undefined || value === null) return "";
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%" }}>
      {/* ── Pricing & Inventory Row ── */}
      <div className="ap-form-row">
        <div className="inputContainer">
          <label className="inputLabel">Price (₹)</label>
          <input
            className="customInput"
            placeholder="e.g. 1499"
            type="number"
            name="price"
            value={formatValue(localVariant.price)}
            onChange={handleChange}
            required
          />
        </div>

        <div className="inputContainer">
          <label className="inputLabel">Sale Price (₹)</label>
          <input
            className="customInput"
            placeholder="e.g. 1299"
            type="number"
            name="salePrice"
            value={formatValue(localVariant.salePrice)}
            onChange={handleChange}
          />
        </div>

        <div className="inputContainer">
          <label className="inputLabel">Inventory / Stock</label>
          <input
            className="customInput"
            placeholder="e.g. 50"
            type="number"
            name="inventory"
            value={formatValue(localVariant.inventory)}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* ── Color & Size Row ── */}
      <div className="ap-form-row">
        <div className="inputContainer">
          <label className="inputLabel">Color</label>
          <select
            className="customDrodown"
            name="colorId"
            value={formatValue(localVariant.colorId)}
            onChange={handleChange}
            required
          >
            <option value="">Select Color</option>
            {dropdowns?.color?.map((col) => (
              <option key={col.colorId} value={col.colorId}>
                {col.colorName}
              </option>
            ))}
          </select>
        </div>

        <div className="inputContainer">
          <label className="inputLabel">Available Sizes</label>
          <Select
            isMulti
            value={dropdowns?.sizes
              ?.filter((size) =>
                localVariant.productVariantSizes?.some(
                  (s) => s.sizeId === size.sizeId
                )
              )
              .map((size) => ({
                value: size.sizeId,
                label: size.sizeName
              }))}
            options={dropdowns?.sizes?.map((size) => ({
              value: size.sizeId,
              label: size.sizeName
            }))}
            onChange={handleSelectChange}
            placeholder="Select Sizes…"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: "42px",
                borderColor: "#d1d5db",
                borderRadius: "8px",
                fontSize: "0.875rem",
                boxShadow: "none",
                "&:hover": { borderColor: "#9ca3af" }
              }),
              menu: (base) => ({
                ...base,
                zIndex: 20,
                maxHeight: "160px"
              })
            }}
          />
        </div>
      </div>

      {/* ── Image Upload Section ── */}
      <div className="inputContainer">
        <label className="inputLabel">Variant Images</label>
        <div className="ap-dropzone">
          <FaCloudUploadAlt className="ap-dropzone-icon" />
          <span className="ap-dropzone-text">Click or drag images to upload</span>
          <span className="ap-dropzone-subtext">PNG, JPG, WEBP up to 5MB</span>
          <input
            className="ap-dropzone-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            required={!localVariant.image.length}
          />
        </div>

        {/* Thumbnail Previews */}
        {localVariant.image.filter(Boolean).length > 0 && (
          <div className="ap-image-grid">
            {localVariant.image.map((imgSrc, idx) => {
              if (!imgSrc) return null;
              const imageUrl = imgSrc.startsWith("http")
                ? imgSrc
                : `data:image/jpeg;base64,${imgSrc}`;
              return (
                <div key={idx} className="ap-image-card">
                  <img src={imageUrl} alt={`Variant preview ${idx + 1}`} />
                  <button
                    className="ap-image-remove-btn"
                    onClick={(e) => handleRemoveImage(idx, e)}
                    title="Remove image"
                    type="button"
                  >
                    <FaTimes />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductVariant;
