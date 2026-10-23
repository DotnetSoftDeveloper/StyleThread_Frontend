import React, { useEffect, useState, useCallback } from "react";
import {
  FaStar,
  FaRegStar,
  FaCheckCircle,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import {
  ProductReviewsResponse,
  ReviewItem,
} from "../../Types/Interface/IReview";
import {
  fetchProductReviewsApi,
  createReviewApi,
  deleteReviewApi,
} from "../../Services/reviewService";
import { getStoredToken } from "../../Utils/Helper/authHelpers";
import { useToast } from "../../Utils/Helper/ToastNotifications";
import { useNavigate, useParams } from "react-router-dom";
import "./ProductReviews.css";

interface Props {
  productId: number;
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

const ProductReviews: React.FC<Props> = ({ productId }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { storeSlug } = useParams<{ storeSlug?: string }>();
  const currentStoreSlug = storeSlug || "default";

  const [reviewsData, setReviewsData] = useState<ProductReviewsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const token = getStoredToken();

  const loadReviews = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await fetchProductReviewsApi(productId);
      if (res.success && res.content) {
        setReviewsData(res.content);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleOpenForm = () => {
    if (!token) {
      showToast("info", "Please sign in to write a review.");
      navigate(`/store/${currentStoreSlug}/signin`);
      return;
    }
    setShowForm((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast("info", "Please sign in to submit your review.");
      navigate(`/store/${currentStoreSlug}/signin`);
      return;
    }

    if (!comment.trim()) {
      showToast("error", "Please enter a comment for your review.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createReviewApi({
        productId,
        rating,
        comment: comment.trim(),
      });

      if (res.success) {
        showToast("success", res.message || "Thank you! Your review has been submitted.");
        setComment("");
        setShowForm(false);
        await loadReviews();
      } else {
        showToast("error", res.message || "Failed to submit review.");
      }
    } catch {
      showToast("error", "An error occurred while submitting your review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await deleteReviewApi(reviewId);
      if (res.success) {
        showToast("info", "Review deleted successfully.");
        await loadReviews();
      } else {
        showToast("error", res.message || "Could not delete review.");
      }
    } catch {
      showToast("error", "Failed to delete review.");
    }
  };

  const renderStars = (score: number, max = 5) => {
    const stars = [];
    const rounded = Math.round(score);
    for (let i = 1; i <= max; i++) {
      stars.push(
        i <= rounded ? (
          <FaStar key={i} />
        ) : (
          <FaRegStar key={i} style={{ color: "#d1d5db" }} />
        )
      );
    }
    return stars;
  };

  const total = reviewsData?.totalReviews ?? 0;
  const avg = reviewsData?.averageRating ?? 0;
  const dist = reviewsData?.distribution ?? {
    star5: 0,
    star4: 0,
    star3: 0,
    star2: 0,
    star1: 0,
  };

  const getPercent = (count: number) => (total > 0 ? (count / total) * 100 : 0);

  const formatDate = (iso: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="product-reviews-section" aria-label="Customer Reviews">
      <div className="reviews-header">
        <h2>Customer Reviews & Ratings</h2>
      </div>

      {/* Summary Score and Breakdown */}
      <div className="reviews-summary-grid">
        <div className="rating-score-box">
          <div className="big-rating-number">{avg > 0 ? avg.toFixed(1) : "—"}</div>
          <div className="stars-row">{renderStars(avg)}</div>
          <span className="total-reviews-caption">
            {total === 0
              ? "No reviews yet"
              : `Based on ${total} ${total === 1 ? "review" : "reviews"}`}
          </span>
        </div>

        {/* Rating Bars */}
        <div className="rating-distribution">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = dist[`star${stars}` as keyof typeof dist];
            const pct = getPercent(count);
            return (
              <div key={stars} className="distribution-row">
                <span className="distribution-label">{stars}★</span>
                <div className="distribution-bar-bg">
                  <div
                    className="distribution-bar-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="distribution-count">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Write a review button */}
        <div className="write-review-cta">
          <button
            type="button"
            className="write-review-btn"
            onClick={handleOpenForm}
          >
            <FaEdit /> {showForm ? "Close Form" : "Write a Review"}
          </button>
        </div>
      </div>

      {/* Write a Review Collapsible Form */}
      {showForm && (
        <form className="review-form-card" onSubmit={handleSubmit}>
          <h3>Share Your Experience</h3>

          <span className="star-picker-label">Overall Rating</span>
          <div className="star-picker-row">
            {[1, 2, 3, 4, 5].map((starVal) => {
              const activeVal = hoverRating || rating;
              const isFilled = starVal <= activeVal;
              return (
                <button
                  key={starVal}
                  type="button"
                  className={`star-picker-btn ${isFilled ? "star-picker-btn--active" : ""}`}
                  onClick={() => setRating(starVal)}
                  onMouseEnter={() => setHoverRating(starVal)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${starVal} star`}
                >
                  {isFilled ? <FaStar /> : <FaRegStar />}
                </button>
              );
            })}
            <span className="star-picker-text">
              {RATING_LABELS[hoverRating || rating]}
            </span>
          </div>

          <div className="review-textarea-group">
            <label htmlFor="review-comment-input">
              Your Review & Feedback
            </label>
            <textarea
              id="review-comment-input"
              className="review-textarea"
              placeholder="What did you like or dislike about the fit, fabric quality, and comfort? How true to size was it?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              required
            />
          </div>

          <div className="review-form-actions">
            <button
              type="submit"
              className="submit-review-btn"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              className="cancel-review-btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <p style={{ color: "#6b7280", textAlign: "center", padding: "2rem" }}>
          Loading customer feedback...
        </p>
      ) : total === 0 ? (
        <div className="reviews-empty-state">
          <p>There are no reviews for this product yet.</p>
          <button
            type="button"
            className="write-review-btn"
            onClick={handleOpenForm}
          >
            <FaEdit /> Be the first to review
          </button>
        </div>
      ) : (
        <div className="reviews-list">
          {reviewsData?.reviews.map((rev: ReviewItem) => (
            <article key={rev.reviewId} className="review-card">
              <div className="review-card-header">
                <div className="reviewer-meta">
                  <span className="reviewer-name">{rev.customerName}</span>
                  {rev.isVerifiedBuyer && (
                    <span className="verified-badge" title="Purchased on Style Thread">
                      <FaCheckCircle size={10} /> Verified Buyer
                    </span>
                  )}
                  <span className="review-date">{formatDate(rev.reviewDate)}</span>
                </div>

                {rev.canDelete && (
                  <button
                    type="button"
                    className="delete-review-btn"
                    onClick={() => handleDelete(rev.reviewId)}
                    title="Delete Review"
                    aria-label="Delete Review"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              <div className="review-stars-row">{renderStars(rev.rating)}</div>
              <p className="review-comment">{rev.comment}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductReviews;
