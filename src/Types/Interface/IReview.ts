export interface ReviewItem {
  reviewId: number;
  productId: number;
  customerId: number;
  customerName: string;
  rating: number;
  comment: string;
  reviewDate: string;
  isVerifiedBuyer: boolean;
  canDelete: boolean;
}

export interface RatingDistribution {
  star5: number;
  star4: number;
  star3: number;
  star2: number;
  star1: number;
}

export interface ProductReviewsResponse {
  productId: number;
  averageRating: number;
  totalReviews: number;
  distribution: RatingDistribution;
  reviews: ReviewItem[];
}

export interface ProductRatingSummary {
  productId: number;
  averageRating: number;
  totalReviews: number;
}

export interface CreateReviewPayload {
  productId: number;
  rating: number;
  comment: string;
}
