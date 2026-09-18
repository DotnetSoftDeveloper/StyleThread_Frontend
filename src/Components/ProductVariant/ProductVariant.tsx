import React, { useEffect, useState } from "react";
import Select, { MultiValue } from "react-select";
import { useSelector } from "react-redux";
import { Button } from "../Atoms/Button";
import type {
  ProductVariant,
  ProductVariantSize,
} from "../../Types/Interface/IProduct";
import { RootState } from "../../Store/ConfigureStore";
// import { DropdownOptions } from "../../Types/Interface/DropDown";

interface DropdownOption {
  value: number;
  label: string;
}

interface ProductVariantProps {
  variantData: ProductVariant;
  updateVariant: (variant: ProductVariant) => void;
}

interface SelectOption {
  [key: string]: string | number;
}

const ProductVariant: React.FC<ProductVariantProps> = ({
  variantData,
  updateVariant
}) => {
  // const dropdowns = useSelector((state: RootState) => state.addProducts?.list ) as DropdownOptions;
  const dropdowns = useSelector((state: RootState) => {
  const list = state.addProducts.list;

  return Array.isArray(list) ? list[0] : list;
});
  const [localVariant, setLocalVariant] = useState<ProductVariant>({
    ...variantData,
    price: variantData?.price ?? "",
    salePrice: variantData?.salePrice ?? "",
    inventory: variantData?.inventory ?? "",
    discount: variantData?.discount ?? 0,
    colorId: variantData?.colorId ?? "",
    productVariantSizes: variantData?.productVariantSizes ?? [],
    image: variantData?.image ?? [],
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
    // Prevent form submission or other events from being triggered
    event.preventDefault();
    event.stopPropagation();

    const updatedImages = localVariant.image.filter((_, i) => i !== index);
    setLocalVariant((prev) => ({ ...prev, image: updatedImages }));
    updateVariant({ ...localVariant, image: updatedImages });
  };

  const handleSelectChange = (selectedSizes: MultiValue<DropdownOption>) => {
    const updatedVariantSizes = selectedSizes.map((size) => ({
      productVariantId: localVariant.productVariantId || 0, // Ensure this is correctly populated
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

  const renderSelect = (label:string, name:string, options:SelectOption[], optionId:string, optionName:string) => (
    <div className="inputContainer">
      <label className="inputLabel">{label}:</label>
      <select
        className="customDrodown"
        name={name}
        value={formatValue(localVariant[name as keyof ProductVariant])}
        onChange={handleChange}
        required
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option[optionId]} value={option[optionId]}>
            {option[optionName]}
          </option>
        ))}
      </select>
      <div className="inputUnderline"></div>
    </div>
  );
  
  const formatValue = (
    value:
      | string
      | number
      | ProductVariantSize[]
      | number[]
      | string[]
      | undefined
  ): string => {
    if (Array.isArray(value)) {
      return value
        .map((item) =>
          typeof item === "object" ? JSON.stringify(item) : String(item)
        )
        .join(", ");
    }
    return value?.toString() ?? "";
  };

  return (
    <>
      {["price", "salePrice", "inventory"].map((field) => (
        <div key={field} className="inputContainer">
          <label className="inputLabel">{field}:</label>
          <input
            className="customInput"
            placeholder={`Enter ${field}`}
            type="number"
            name={field}
            value={formatValue(localVariant[field as keyof ProductVariant])}
            onChange={handleChange}
            required
          />
          <div className="inputUnderline"></div>
        </div>
      ))}
      {renderSelect(
        "Color",
        "colorId",
        dropdowns?.color || [],
        "colorId",
        "colorName"
      )}
      <div className="inputContainer">
        <label className="inputLabel">Size:</label>
        <Select
          className="customDrodown"
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
          styles={{
            control: (provided) => ({ ...provided, minHeight: "40px" }),
            menu: (provided) => ({
              ...provided,
              maxHeight: "150px",
              overflowY: "auto"
            })
          }}
        />

        <div className="inputUnderline"></div>
      </div>
      <div className="inputContainer">
        <label className="inputLabel">Image:</label>
        <input
          className="customInput"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          required={!localVariant.image.length}
        />
        <div className="inputUnderline"></div>
      </div>
      {localVariant.image.length > 0 && (
        <div className="image-preview">
          {localVariant.image.map((imgSrc, index) => {
            // Only render valid base64 images
            if (!imgSrc) return null; // Skip invalid or empty images
            const imageUrl = imgSrc.startsWith("http")
              ? imgSrc
              : `data:image/jpeg;base64,${imgSrc}`;
            return (
              <div
                key={index}
                style={{
                  position: "relative",
                  display: "inline-block",
                  margin: "10px"
                }}
              >
                <img
                  src={imageUrl}
                  alt={`Preview ${index + 1}`}
                  style={{ maxWidth: "100%", maxHeight: "200px" }}
                />
                <Button
                  className="close-button"
                  label="&times;"
                  onClick={(e) => handleRemoveImage(index, e)}
                />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default ProductVariant;
