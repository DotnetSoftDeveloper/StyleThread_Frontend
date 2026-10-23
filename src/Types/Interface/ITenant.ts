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

export enum TenantStatus {
  Active = 1,
  Suspended = 2,
  SetupPending = 3,
}

export interface Tenant {
  tenantId: number;
  slug: string;
  storeName: string;
  customDomain?: string | null;
  ownerCustomerId?: number | null;
  status: TenantStatus;
  createdAt: string;
  activatedAt?: string | null;
  suspendedAt?: string | null;
  suspensionReason?: string | null;
  sourceApplicationId?: number | null;
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
  InformationRequired = 4,
  UnderReview = 5,
}

export interface StoreRequest {
  storeRequestId: number;
  referenceNumber: string;
  businessName: string;
  businessCategory: string;
  taxIdOrRegistrationNumber?: string | null;
  businessAddress?: string | null;
  websiteOrSocialUrl?: string | null;
  estimatedInventoryScale?: string | null;
  storeName: string;
  desiredSlug: string;
  customDomain?: string | null;
  businessDescription?: string | null;
  ownerFirstName: string;
  ownerLastName: string;
  contactEmail: string;
  contactPhone: string;
  requesterUserId?: number | null;
  requesterEmail?: string;
  status: StoreRequestStatus;
  statusName?: string;
  adminNotes?: string | null;
  inquiryNotes?: string | null;
  rejectionReason?: string | null;
  createdTenantId?: number | null;
  createdTenantSlug?: string | null;
  assignedAdminUserId?: number | null;
  assignedAdminEmail?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  reviewedByUserId?: number | null;
  resubmittedAt?: string | null;
}

export interface CreateStoreRequestDto {
  businessName: string;
  businessCategory: string;
  taxIdOrRegistrationNumber?: string;
  businessAddress?: string;
  websiteOrSocialUrl?: string;
  estimatedInventoryScale?: string;
  storeName: string;
  desiredSlug: string;
  customDomain?: string;
  businessDescription?: string;
  ownerFirstName: string;
  ownerLastName: string;
  contactEmail: string;
  contactPhone: string;
  requesterUserId?: number;
}

export interface ResubmitStoreRequestDto {
  referenceNumber: string;
  contactEmail: string;
  businessName?: string;
  businessCategory?: string;
  taxIdOrRegistrationNumber?: string;
  businessAddress?: string;
  websiteOrSocialUrl?: string;
  estimatedInventoryScale?: string;
  storeName?: string;
  customDomain?: string;
  businessDescription?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
  contactPhone?: string;
  applicantNotes?: string;
}

export interface ReviewStoreRequestDto {
  adminNotes?: string;
  notes?: string;
  inquiryNotes?: string;
  rejectionReason?: string;
  assignAdminUserId?: number;
  createNewAdmin?: boolean;
  adminEmail?: string;
  adminFirstName?: string;
  adminLastName?: string;
  adminPassword?: string;
}

export interface AssignStoreAdminDto {
  userId?: number;
  createNew?: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
}

export interface StoreApplicationStatusDto {
  referenceNumber: string;
  storeName: string;
  desiredSlug: string;
  businessName: string;
  businessCategory: string;
  status: StoreRequestStatus;
  statusName: string;
  inquiryNotes?: string | null;
  rejectionReason?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  resubmittedAt?: string | null;
  createdTenantSlug?: string | null;
  customDomain?: string | null;
}

export interface CheckSlugResult {
  available: boolean;
  slug: string;
  reason?: string;
  message?: string;
}

export interface EligibleAdminDto {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  assignedStores: string[];
}

export interface TenantMembership {
  tenantUserMembershipId: number;
  tenantId: number;
  tenantSlug: string;
  storeName: string;
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  assignedAt: string;
  assignedByUserId?: number | null;
  assignedByEmail?: string | null;
}

export interface StoreAssignRoleDto {
  userId?: number;
  email?: string;
  role: string;
}

export interface TenantAuditLogDto {
  auditLogId: number;
  tenantId: number;
  tenantSlug: string;
  actorUserId?: number | null;
  actorEmail: string;
  action: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}
