// Example: types/DropdownOptions.ts
export interface DropdownOptions {
  categories: { categoryId: number; name: string }[];
  brands: { brandId: number; name: string }[];
  fits: { fitId: number; fitName: string }[];
  fabrics: { fabricId: number; fabricName: string }[];
}
