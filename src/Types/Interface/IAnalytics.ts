export interface TrendPointDto {
  label: string;
  orderCount: number;
  amount: number;
}

export interface TopProductDto {
  productId: number;
  productName: string;
  imageUrl: string;
  unitsSold: number;
  revenue: number;
  remainingStock: number;
}

export interface InventoryHealthDto {
  totalProducts: number;
  totalVariants: number;
  inStockVariants: number;
  lowStockVariants: number;
  outOfStockVariants: number;
}

export interface TenantPerformanceDto {
  tenantId: number;
  storeName: string;
  slug: string;
  totalOrders: number;
  grossMerchandiseValue: number;
  activeProducts: number;
}

export interface PlatformAnalyticsDto {
  grossMerchandiseValue: number;
  platformRevenue: number;
  platformTakeRatePercentage: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalStores: number;
  activeStores: number;
  totalProducts: number;
  totalStockUnits: number;
  tenantLeaderboard: TenantPerformanceDto[];
  monthlyTrend: TrendPointDto[];
  orderStatusDistribution: Record<string, number>;
}

export interface SellerAnalyticsDto {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  inventoryHealth: InventoryHealthDto;
  topSellingProducts: TopProductDto[];
  salesTrend: TrendPointDto[];
  orderStatusDistribution: Record<string, number>;
}

export interface LowStockItemDto {
  productId: number;
  productName: string;
  productVariantId: number;
  colorName?: string | null;
  sizeName?: string | null;
  currentInventory: number;
  price: number;
  imageUrl?: string | null;
  status: string;
}

export interface StockAlertTriggerResponse {
  recipient?: string;
  criticalItemsCount?: number;
  dispatchedAt?: string;
}

export interface BackgroundJobStatusDto {
  isEnabled: boolean;
  isRunning: boolean;
  intervalHours: number;
  lowStockThreshold: number;
  lastRunUtc?: string | null;
  nextRunUtc?: string | null;
  runCount: number;
  lastExecutionSummary?: string | null;
  lastError?: string | null;
}

export interface BackgroundJobExecutionResultDto {
  success: boolean;
  executedAtUtc: string;
  tenantsProcessed: number;
  lowStockAlertsDispatched: number;
  expiredCouponsDeactivated: number;
  summary: string;
  errorMessage?: string | null;
}

