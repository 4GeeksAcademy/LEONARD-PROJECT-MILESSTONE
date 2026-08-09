const validDepartments = new Set([
    "Restaurant Operations",
    "Procurement and Suppliers",
    "Marketing and Digital Experience",
    "People and Culture",
    "Training and Quality Standards",
    "Technology",
    "Executive Direction",
]);
export function validateLocation(location) {
    const errors = [];
    if (location.countryMarket === "Colombia" && !/^CO-MED-0[1-8]$/.test(location.locationId)) {
        errors.push("Colombia locationId must follow CO-MED-01 to CO-MED-08.");
    }
    if (location.countryMarket === "United States (Florida)" && !/^US-MIA-0[1-6]$/.test(location.locationId)) {
        errors.push("United States (Florida) locationId must follow US-MIA-01 to US-MIA-06.");
    }
    if (location.countryMarket === "Colombia" && location.city !== "Medellin") {
        errors.push("Colombia locations must use Medellin as city in this context.");
    }
    if (location.countryMarket === "United States (Florida)" && location.city !== "Miami") {
        errors.push("United States (Florida) locations must use Miami as city in this context.");
    }
    return { isValid: errors.length === 0, errors };
}
export function validateLocationPortfolio(locations) {
    const errors = [];
    if (locations.length !== 14) {
        errors.push("Brasaland must have exactly 14 locations.");
    }
    const colombiaCount = locations.filter((location) => location.countryMarket === "Colombia").length;
    const floridaCount = locations.filter((location) => location.countryMarket === "United States (Florida)").length;
    if (colombiaCount !== 8) {
        errors.push("Brasaland must have 8 locations in Colombia.");
    }
    if (floridaCount !== 6) {
        errors.push("Brasaland must have 6 locations in United States (Florida).");
    }
    return { isValid: errors.length === 0, errors };
}
export function validateSaleRecord(sale) {
    const errors = [];
    if (sale.totalAmount <= 0) {
        errors.push("Sale totalAmount must be greater than 0.");
    }
    if (sale.ticketItems < 1) {
        errors.push("Sale ticketItems must be at least 1.");
    }
    if (sale.servedCovers < 1) {
        errors.push("Sale servedCovers must be at least 1.");
    }
    if (sale.countryMarket === "Colombia" && sale.currencyCode !== "COP") {
        errors.push("Colombia sales must use COP currency.");
    }
    if (sale.countryMarket === "United States (Florida)" && sale.currencyCode !== "USD") {
        errors.push("United States (Florida) sales must use USD currency.");
    }
    if (Number.isNaN(Date.parse(sale.soldAtISO))) {
        errors.push("Sale soldAtISO must be a valid date string.");
    }
    return { isValid: errors.length === 0, errors };
}
export function validateSupplier(supplier) {
    const errors = [];
    if (supplier.supplierName.trim().length < 2) {
        errors.push("Supplier name must include at least 2 characters.");
    }
    if (!supplier.supplierId.startsWith("SUP-")) {
        errors.push("Supplier id must start with SUP-.");
    }
    return { isValid: errors.length === 0, errors };
}
export function validateEmployeeRecord(employee) {
    const errors = [];
    if (!validDepartments.has(employee.department)) {
        errors.push("Employee department must match Brasaland departments from context.");
    }
    if (Number.isNaN(Date.parse(employee.hireDateISO))) {
        errors.push("Employee hireDateISO must be a valid date string.");
    }
    if (new Date(employee.hireDateISO).getTime() > Date.now()) {
        errors.push("Employee hireDateISO cannot be in the future.");
    }
    return { isValid: errors.length === 0, errors };
}
export function validateEmployeeHeadcount(employees) {
    const errors = [];
    if (employees.length > 115) {
        errors.push("Employee records cannot exceed 115 for this context.");
    }
    return { isValid: errors.length === 0, errors };
}
export function validateAutomationRequest(request) {
    const errors = [];
    if (request.requesterName.trim().length < 3) {
        errors.push("requesterName must have at least 3 characters.");
    }
    if (!/^[^\s@]+@brasaland\.(com|co)$/i.test(request.workEmail)) {
        errors.push("workEmail must be a Brasaland corporate email.");
    }
    if (!/^\+?[0-9\s()-]{10,20}$/.test(request.workPhone)) {
        errors.push("workPhone must be a valid phone number.");
    }
    if (request.weeklyIncidentsAffected < 1) {
        errors.push("weeklyIncidentsAffected must be greater than 0.");
    }
    if (request.currentProcessDescription.trim().length < 20) {
        errors.push("currentProcessDescription must have at least 20 characters.");
    }
    if (request.expectedBusinessOutcome.trim().length < 20) {
        errors.push("expectedBusinessOutcome must have at least 20 characters.");
    }
    if (Number.isNaN(Date.parse(request.targetLaunchDateISO))) {
        errors.push("targetLaunchDateISO must be a valid date string.");
    }
    return { isValid: errors.length === 0, errors };
}
