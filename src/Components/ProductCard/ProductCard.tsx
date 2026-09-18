import React, { useState, useEffect } from "react";
import './ProductCard.css';
import { Product } from "../../Types/Interface/IProduct";


interface ProductCardProps{
  product: Product;
  colorOptions?: { colorId: number; colorName: string }[];
  onCardClick:(product: Product)=>void;
}

type ProductVariantWithColor = Product["productVariants"][number] & {
  color?: { colorName?: string };
};

const ProductCard:React.FC<ProductCardProps> = ({ product, colorOptions = [], onCardClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const images = product?.productVariants?.[0]?.image || [];

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (hovered && images.length > 1) {
      intervalId = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, 1000); // Change image every second
    }

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [hovered, images.length]);

  const handleMouseEnter = () => setHovered(true);

  const handleMouseLeave = () => {
    setHovered(false);
    setCurrentImageIndex(0);
  };

  const handleClick = () => {
    onCardClick(product); // Pass the product object to the onCardClick function
  };

  const variant = product?.productVariants?.[0] as ProductVariantWithColor | undefined;
  const colorName = variant?.colorName
    ?? variant?.color?.colorName
    ?? colorOptions.find((color) => color.colorId === variant?.colorId)?.colorName;

  return (
    <div
      className="card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {images.length > 0 && (
        <img
          className="card-img-top"
          src={images[currentImageIndex]}
          alt="Product"
        />
      )}

      <div className="card-body product-card-body">
        <span className="sponsored">Sponsored</span>
        <p className="card-text">{product.description || product.name}</p>
        <p className="product-colour">Color: <span>{colorName || "Not specified"}</span></p>
        <div className="product-pricing">
          <span className="sale-price">₹{variant?.salePrice ?? "—"}</span>
          {variant?.price != null && <span className="original-price">₹{variant.price}</span>}
          {variant?.discount != null && <span className="discount">{variant.discount}% off</span>}
        </div>
        <span className="delivery-text">Free Delivery</span>
      </div>
    </div>
  );
};

export default ProductCard;
