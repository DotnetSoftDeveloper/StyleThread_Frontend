export interface Size {
    sizeId: number;
    sizeName: string;
  }
  
 export interface ProductVariantSize {
    productVariantId: number;
    sizeId: number;
    size: Size;
  }
  
export interface ProductVariant {
    productVariantId: number;
    productId: number;
    colorId: number;
    colorName?: string;
    price: number;
    salePrice: number;
    discount: number;
    inventory: number;
    image: string[];
    productVariantSizes: ProductVariantSize[];
  }
  
 export interface Product {
    productId: number;
    sku: string;
    name: string;
    description: string;
    categoryId: number;
    brandId: number;
    listedOn: string; // ISO date string format
    listedBy: string;
    fitId: number;
    fabricId: number;
    sleeveId: number;
    reversible: boolean;
    neckTypeId: number;
    fabricCareId: number;
    productVariants: ProductVariant[];
  }
  
