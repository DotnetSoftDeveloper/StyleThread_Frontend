import axios from "axios";

const API_BASE_URL = "https://localhost:44314";

export interface SuperAdminLoginRequest {
  email: string;
  password: string;
}

export interface SuperAdminLoginResponse {
  token: string;
  userId: number;
  email: string;
  firstName: string;
  lastName?: string;
  roles: string[];
  totalManagedStores: number;
}

export interface StoreAdminAssignment {
  tenantId: number;
  storeSlug: string;
  storeName: string;
  role: string;
  isOwner: boolean;
}

export interface StoreAdminLoginRequest {
  email: string;
  password: string;
  storeSlug?: string;
}

export interface StoreAdminLoginResponse {
  token: string;
  userId: number;
  email: string;
  firstName: string;
  lastName?: string;
  activeTenantId: number;
  activeStoreSlug: string;
  activeStoreName: string;
  tenantRole: string;
  globalRoles: string[];
  settings?: any;
  assignedStores: StoreAdminAssignment[];
}

export interface GenericApiResponse<T> {
  success: boolean;
  message?: string;
  content: T;
}

export const authService = {
  async superAdminLogin(payload: SuperAdminLoginRequest): Promise<GenericApiResponse<SuperAdminLoginResponse>> {
    const res = await axios.post<GenericApiResponse<SuperAdminLoginResponse>>(
      `${API_BASE_URL}/api/admin/auth/super-admin-login`,
      payload
    );
    return res.data;
  },

  async storeAdminLogin(payload: StoreAdminLoginRequest): Promise<GenericApiResponse<StoreAdminLoginResponse>> {
    const res = await axios.post<GenericApiResponse<StoreAdminLoginResponse>>(
      `${API_BASE_URL}/api/admin/auth/store-admin-login`,
      payload
    );
    return res.data;
  },

  async getSuperAdminMe(token: string): Promise<GenericApiResponse<any>> {
    const res = await axios.get<GenericApiResponse<any>>(`${API_BASE_URL}/api/admin/auth/super-admin/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
};
