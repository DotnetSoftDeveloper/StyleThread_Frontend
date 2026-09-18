export interface DropdownOptions {
    categories: { categoryId: number; name: string }[];
    brands: { brandId: number; name: string }[];
    fits: { fitId: number; fitName: string }[];
    fabrics: { fabricId: number; fabricName: string }[];
    sleeves: { sleeveId: number; sleeveType: string }[];
    neckTypes: { neckTypeId: number; neckTypeName: string }[];
    fabricCares: { fabricCareId: number; careInstructions: string }[];
    sizes: {sizeId: number; sizeName: string} [];
    color: { colorId: number; colorName: string }[];
  }
  
  export interface Category{
    label: string;
    value: number;
  }