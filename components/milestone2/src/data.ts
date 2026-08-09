import {
  type BrasalandLocation,
  type CustomerProfile,
  type EmployeeRecord,
  type PurchaseOrder,
  type SaleRecord,
  type Supplier,
  type TelemetryEvent,
} from "./types.js";

export const brasalandLocations: BrasalandLocation[] = [
  { locationId: "CO-MED-01", name: "Medellin Centro", city: "Medellin", countryMarket: "Colombia", timezone: "America/Bogota", isOpen: true },
  { locationId: "CO-MED-02", name: "Medellin Laureles", city: "Medellin", countryMarket: "Colombia", timezone: "America/Bogota", isOpen: true },
  { locationId: "CO-MED-03", name: "Medellin El Poblado", city: "Medellin", countryMarket: "Colombia", timezone: "America/Bogota", isOpen: true },
  { locationId: "CO-MED-04", name: "Medellin Envigado", city: "Medellin", countryMarket: "Colombia", timezone: "America/Bogota", isOpen: true },
  { locationId: "CO-MED-05", name: "Medellin Belen", city: "Medellin", countryMarket: "Colombia", timezone: "America/Bogota", isOpen: true },
  { locationId: "CO-MED-06", name: "Medellin Robledo", city: "Medellin", countryMarket: "Colombia", timezone: "America/Bogota", isOpen: true },
  { locationId: "CO-MED-07", name: "Medellin Itagui", city: "Medellin", countryMarket: "Colombia", timezone: "America/Bogota", isOpen: false },
  { locationId: "CO-MED-08", name: "Medellin Sabaneta", city: "Medellin", countryMarket: "Colombia", timezone: "America/Bogota", isOpen: true },
  { locationId: "US-MIA-01", name: "Miami Downtown", city: "Miami", countryMarket: "United States (Florida)", timezone: "America/New_York", isOpen: true },
  { locationId: "US-MIA-02", name: "Miami Doral", city: "Miami", countryMarket: "United States (Florida)", timezone: "America/New_York", isOpen: true },
  { locationId: "US-MIA-03", name: "Miami Kendall", city: "Miami", countryMarket: "United States (Florida)", timezone: "America/New_York", isOpen: true },
  { locationId: "US-MIA-04", name: "Miami Aventura", city: "Miami", countryMarket: "United States (Florida)", timezone: "America/New_York", isOpen: true },
  { locationId: "US-MIA-05", name: "Miami Brickell", city: "Miami", countryMarket: "United States (Florida)", timezone: "America/New_York", isOpen: false },
  { locationId: "US-MIA-06", name: "Miami Hialeah", city: "Miami", countryMarket: "United States (Florida)", timezone: "America/New_York", isOpen: true },
];

export const salesRecords: SaleRecord[] = [
  { saleId: "SALE-1001", locationId: "CO-MED-01", countryMarket: "Colombia", currencyCode: "COP", totalAmount: 185000, ticketItems: 4, servedCovers: 3, soldAtISO: "2026-08-08T14:15:00Z" },
  { saleId: "SALE-1002", locationId: "CO-MED-03", countryMarket: "Colombia", currencyCode: "COP", totalAmount: 98000, ticketItems: 2, servedCovers: 2, soldAtISO: "2026-08-08T17:04:00Z" },
  { saleId: "SALE-1003", locationId: "US-MIA-01", countryMarket: "United States (Florida)", currencyCode: "USD", totalAmount: 74, ticketItems: 3, servedCovers: 2, soldAtISO: "2026-08-08T18:31:00Z" },
  { saleId: "SALE-1004", locationId: "US-MIA-04", countryMarket: "United States (Florida)", currencyCode: "USD", totalAmount: 121, ticketItems: 5, servedCovers: 4, soldAtISO: "2026-08-08T19:47:00Z" },
  { saleId: "SALE-1005", locationId: "CO-MED-06", countryMarket: "Colombia", currencyCode: "COP", totalAmount: 223000, ticketItems: 6, servedCovers: 5, soldAtISO: "2026-08-09T12:08:00Z" },
  { saleId: "SALE-1006", locationId: "US-MIA-03", countryMarket: "United States (Florida)", currencyCode: "USD", totalAmount: 58, ticketItems: 2, servedCovers: 2, soldAtISO: "2026-08-09T13:42:00Z" },
];

export const suppliers: Supplier[] = [
  { supplierId: "SUP-001", supplierName: "Andes Beef Partners", countryMarket: "Colombia", category: "meat", isPreferred: true },
  { supplierId: "SUP-002", supplierName: "Florida Fresh Veg", countryMarket: "United States (Florida)", category: "vegetables", isPreferred: true },
  { supplierId: "SUP-003", supplierName: "Salsa Labs", countryMarket: "Colombia", category: "sauces", isPreferred: false },
  { supplierId: "SUP-004", supplierName: "Clean Pro Supply", countryMarket: "United States (Florida)", category: "cleaning-products", isPreferred: true },
  { supplierId: "SUP-005", supplierName: "Brasa Pack Global", countryMarket: "Colombia", category: "packaging", isPreferred: false },
];

export const purchaseOrders: PurchaseOrder[] = [
  { purchaseOrderId: "PO-5001", supplierId: "SUP-001", locationId: "CO-MED-02", category: "meat", amount: 2800000, currencyCode: "COP", createdAtISO: "2026-08-01T08:00:00Z" },
  { purchaseOrderId: "PO-5002", supplierId: "SUP-002", locationId: "US-MIA-01", category: "vegetables", amount: 4400, currencyCode: "USD", createdAtISO: "2026-08-01T08:05:00Z" },
  { purchaseOrderId: "PO-5003", supplierId: "SUP-004", locationId: "US-MIA-04", category: "cleaning-products", amount: 1500, currencyCode: "USD", createdAtISO: "2026-08-02T08:00:00Z" },
];

export const customerProfiles: CustomerProfile[] = [
  { customerId: "CUS-1", countryMarket: "Colombia", loyaltyProgramType: "physical-stamp-card", totalOrders: 14, averageTicket: 56000, preferredProducts: ["Classic Burger", "Chorizo Grill"] },
  { customerId: "CUS-2", countryMarket: "United States (Florida)", loyaltyProgramType: "digital-app", totalOrders: 22, averageTicket: 31, preferredProducts: ["Premium Combo", "Iced Tea"] },
  { customerId: "CUS-3", countryMarket: "Colombia", loyaltyProgramType: "none", totalOrders: 3, averageTicket: 43000, preferredProducts: ["Cheese Burger"] },
];

export const employeeRecords: EmployeeRecord[] = [
  { employeeId: "EMP-100", locationId: "CO-MED-01", countryMarket: "Colombia", department: "Restaurant Operations", role: "Supervisor", hireDateISO: "2021-04-03", hasCompletedOnboarding: true, isActive: true },
  { employeeId: "EMP-230", locationId: "US-MIA-02", countryMarket: "United States (Florida)", department: "People and Culture", role: "HR Coordinator", hireDateISO: "2023-11-10", hasCompletedOnboarding: true, isActive: true },
  { employeeId: "EMP-311", locationId: "US-MIA-05", countryMarket: "United States (Florida)", department: "Training and Quality Standards", role: "Trainer", hireDateISO: "2024-06-24", hasCompletedOnboarding: false, isActive: true },
  { employeeId: "EMP-472", locationId: "CO-MED-06", countryMarket: "Colombia", department: "Technology", role: "Data Engineer", hireDateISO: "2025-02-17", hasCompletedOnboarding: true, isActive: true },
];

export const telemetryEvents: TelemetryEvent[] = [
  { eventId: "TELEM-1", locationId: "US-MIA-01", eventType: "location-opened", eventAtISO: "2026-08-09T13:00:00Z", payload: { message: "Location opened" } },
  { eventId: "TELEM-2", locationId: "US-MIA-01", eventType: "sale-recorded", eventAtISO: "2026-08-09T13:12:00Z", payload: { amount: 38, currencyCode: "USD" } },
  { eventId: "TELEM-3", locationId: "CO-MED-04", eventType: "no-sales-alert", eventAtISO: "2026-08-09T14:00:00Z", payload: { message: "No sales in opening hour window" } },
];
