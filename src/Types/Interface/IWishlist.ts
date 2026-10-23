export interface WishlistItem {
  wishlistId: number;
  productId: number;
  productName: string;
  productDescription?: string;
  brandName?: string;
  categoryName?: string;
  price: number;
  salePrice?: number | null;
  imageUrl?: string;
  inventory: number;
  inStock: boolean;
}
