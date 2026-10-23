import axios from "axios";
import { WishlistItem } from "../Types/Interface/IWishlist";
import { GenericResponse } from "../Types/Interface/IGenericResponse";
import { getStoredToken } from "../Utils/Helper/authHelpers";
import { resolveActiveTenantSlug } from "../Utils/tenantHelper";

const API_BASE_URL = "https://localhost:44314/api/Wishlist";

const getHeaders = () => {
  const token = getStoredToken();
  const slug = resolveActiveTenantSlug();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(slug ? { "X-Tenant-Slug": slug } : {}),
  };
};

export const fetchWishlistApi = async (): Promise<GenericResponse<WishlistItem[]>> => {
  const res = await axios.get<GenericResponse<WishlistItem[]>>(API_BASE_URL, {
    headers: getHeaders(),
  });
  return res.data;
};

export const fetchWishlistProductIdsApi = async (): Promise<GenericResponse<number[]>> => {
  const res = await axios.get<GenericResponse<number[]>>(`${API_BASE_URL}/ids`, {
    headers: getHeaders(),
  });
  return res.data;
};

export const addToWishlistApi = async (
  productId: number
): Promise<GenericResponse<{ isWishlisted: boolean; wishlistId: number; productId: number }>> => {
  const res = await axios.post<GenericResponse<{ isWishlisted: boolean; wishlistId: number; productId: number }>>(
    `${API_BASE_URL}/${productId}`,
    {},
    { headers: getHeaders() }
  );
  return res.data;
};

export const removeFromWishlistApi = async (
  productId: number
): Promise<GenericResponse<{ isWishlisted: boolean; productId: number }>> => {
  const res = await axios.delete<GenericResponse<{ isWishlisted: boolean; productId: number }>>(
    `${API_BASE_URL}/${productId}`,
    { headers: getHeaders() }
  );
  return res.data;
};
