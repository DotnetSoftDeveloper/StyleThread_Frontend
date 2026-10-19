export interface TenantSettings {
  tenantSettingsId: number;
  tenantId: number;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  bannerImageUrl?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  supportEmail?: string | null;
  supportPhone?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  razorpayKeyId?: string | null;
  currency: string;
  freeShippingThreshold: number;
  defaultShippingFee: number;
  taxPercentage: number;
}

export interface Tenant {
  tenantId: number;
  slug: string;
  storeName: string;
  customDomain?: string | null;
  ownerCustomerId?: number | null;
  status: number;
  createdAt: string;
  settings?: TenantSettings | null;
}

export interface UpdateTenantSettingsRequest {
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  bannerImageUrl?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  supportEmail?: string | null;
  supportPhone?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  currency?: string;
  freeShippingThreshold?: number;
  defaultShippingFee?: number;
  taxPercentage?: number;
}

export interface CreateTenantRequest {
  slug: string;
  storeName: string;
  customDomain?: string;
  ownerCustomerId?: number;
  primaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
}

export enum StoreRequestStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
}

export interface StoreRequest {
  storeRequestId: number;
  storeName: string;
  desiredSlug: string;
  businessDescription?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  requesterUserId: number;
  requesterEmail: string;
  status: StoreRequestStatus;
  statusName?: string;
  adminNotes?: string | null;
  createdTenantId?: number | null;
  createdAt: string;
  reviewedAt?: string | null;
  reviewedByUserId?: number | null;
}

export interface CreateStoreRequestDto {
  storeName: string;
  desiredSlug: string;
  businessDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ReviewStoreRequestDto {
  adminNotes?: string;
  notes?: string;
}

