export type CountryMarket = "Colombia" | "United States (Florida)";

export type CurrencyCode = "COP" | "USD";

export type DepartmentName =
  | "Restaurant Operations"
  | "Procurement and Suppliers"
  | "Marketing and Digital Experience"
  | "People and Culture"
  | "Training and Quality Standards"
  | "Technology"
  | "Executive Direction";

export type SupplierCategory =
  | "meat"
  | "vegetables"
  | "sauces"
  | "beverages"
  | "packaging"
  | "cleaning-products";

export type ChallengeType =
  | "real-time-sales-dashboard"
  | "intelligent-ingredient-ordering"
  | "no-sales-opening-hours-alerts"
  | "supplier-price-history-and-alerts"
  | "digital-loyalty-and-ordering-app"
  | "customer-crm-and-personalization-engine"
  | "hr-portal-and-onboarding-automation"
  | "training-platform-and-recipe-update-push"
  | "central-api-and-telemetry-pipeline"
  | "executive-ai-assistant-and-monday-report";

export interface BrasalandLocation {
  locationId: string;
  name: string;
  city: "Medellin" | "Miami";
  countryMarket: CountryMarket;
  timezone: string;
  isOpen: boolean;
}

export interface SaleRecord {
  saleId: string;
  locationId: string;
  countryMarket: CountryMarket;
  currencyCode: CurrencyCode;
  totalAmount: number;
  ticketItems: number;
  servedCovers: number;
  soldAtISO: string;
}

export interface Supplier {
  supplierId: string;
  supplierName: string;
  countryMarket: CountryMarket;
  category: SupplierCategory;
  isPreferred: boolean;
}

export interface PurchaseOrder {
  purchaseOrderId: string;
  supplierId: string;
  locationId: string;
  category: SupplierCategory;
  amount: number;
  currencyCode: CurrencyCode;
  createdAtISO: string;
}

export interface CustomerProfile {
  customerId: string;
  countryMarket: CountryMarket;
  loyaltyProgramType: "physical-stamp-card" | "digital-app" | "none";
  totalOrders: number;
  averageTicket: number;
  preferredProducts: string[];
}

export interface EmployeeRecord {
  employeeId: string;
  locationId: string;
  countryMarket: CountryMarket;
  department: DepartmentName;
  role: string;
  hireDateISO: string;
  hasCompletedOnboarding: boolean;
  isActive: boolean;
}

export interface TelemetryEvent {
  eventId: string;
  locationId: string;
  eventType: "sale-recorded" | "location-opened" | "location-closed" | "no-sales-alert";
  eventAtISO: string;
  payload: {
    amount?: number;
    currencyCode?: CurrencyCode;
    message?: string;
  };
}

export interface AutomationRequest {
  requestId: string;
  requesterName: string;
  department: DepartmentName;
  workEmail: string;
  workPhone: string;
  locationId: string;
  countryMarket: CountryMarket;
  challengeType: ChallengeType;
  targetLaunchDateISO: string;
  weeklyIncidentsAffected: number;
  currentProcessDescription: string;
  expectedBusinessOutcome: string;
}

export interface SalesFilterCriteria {
  countryMarket?: CountryMarket;
  locationId?: string;
  minTotalAmount?: number;
  maxTotalAmount?: number;
  fromDateISO?: string;
  toDateISO?: string;
}

export interface SupplierFilterCriteria {
  countryMarket?: CountryMarket;
  category?: SupplierCategory;
  isPreferred?: boolean;
}

export interface EmployeeFilterCriteria {
  countryMarket?: CountryMarket;
  department?: DepartmentName;
  isActive?: boolean;
  hasCompletedOnboarding?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface SalesSummary {
  totalCount: number;
  totalAmount: number;
  averageTicketAmount: number;
  maxSaleAmount: number | null;
  minSaleAmount: number | null;
}
