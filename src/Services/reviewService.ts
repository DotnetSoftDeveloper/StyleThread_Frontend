import axios from "axios";
import {
  ProductReviewsResponse,
  ProductRatingSummary,
  CreateReviewPayload,
  ReviewItem,
} from "../Types/Interface/IReview";
import { GenericResponse } from "../Types/Interface/IGenericResponse";
import { getStoredToken } from "../Utils/Helper/authHelpers";
import { resolveActiveTenantSlug } from "../Utils/tenantHelper";

const API_BASE_URL = "https://localhost:44314/api/Reviews";

const getHeaders = () => {
  const token = getStoredToken();
  const slug = resolveActiveTenantSlug();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(slug ? { "X-Tenant-Slug": slug } : {}),
  };
};

export const fetchProductReviewsApi = async (
  productId: number
): Promise<GenericResponse<ProductReviewsResponse>> => {
  const res = await axios.get<GenericResponse<ProductReviewsResponse>>(
    `${API_BASE_URL}/product/${productId}`,
    { headers: getHeaders() }
  );
  return res.data;
};

export const fetchAllRatingSummariesApi = async (): Promise<
  GenericResponse<ProductRatingSummary[]>
> => {
  const res = await axios.get<GenericResponse<ProductRatingSummary[]>>(
    `${API_BASE_URL}/summary/all`,
    { headers: getHeaders() }
  );
  return res.data;
};

export const createReviewApi = async (
  payload: CreateReviewPayload
): Promise<GenericResponse<ReviewItem>> => {
  const res = await axios.post<GenericResponse<ReviewItem>>(
    API_BASE_URL,
    payload,
    { headers: getHeaders() }
  );
  return res.data;
};

export const deleteReviewApi = async (
  reviewId: number
): Promise<GenericResponse<{ reviewId: number }>> => {
  const res = await axios.delete<GenericResponse<{ reviewId: number }>>(
    `${API_BASE_URL}/${reviewId}`,
    { headers: getHeaders() }
  );
  return res.data;
};

let cachedSummaries: Record<number, ProductRatingSummary> | null = null;
let summariesPromise: Promise<Record<number, ProductRatingSummary>> | null = null;

export const getRatingSummariesMap = async (): Promise<Record<number, ProductRatingSummary>> => {
  if (cachedSummaries) return cachedSummaries;
  if (!summariesPromise) {
    summariesPromise = fetchAllRatingSummariesApi()
      .then((res) => {
        const map: Record<number, ProductRatingSummary> = {};
        if (res.success && res.content) {
          res.content.forEach((item) => {
            map[item.productId] = item;
          });
        }
        cachedSummaries = map;
        return map;
      })
      .catch(() => ({}));
  }
  return summariesPromise;
};

export const invalidateRatingSummariesCache = () => {
  cachedSummaries = null;
  summariesPromise = null;
};
