import { brasalandLocations, employeeRecords, filterEmployeesByCriteria, filterSalesByCriteria, filterSuppliersByCriteria, linearSearchSaleById, salesRecords, sortLocationsById, sortSalesByAmount, suppliers, binarySearchLocationIndexById, calculateSalesSummary, countSuppliersByCategory, validateLocationPortfolio, } from "./index.js";
function renderResult(title, value) {
    const output = document.getElementById("result");
    if (output === null) {
        return;
    }
    output.textContent = `${title}\n\n${JSON.stringify(value, null, 2)}`;
}
function initButtons() {
    const filterSalesButton = document.getElementById("btnFilterSales");
    const filterSuppliersButton = document.getElementById("btnFilterSuppliers");
    const filterEmployeesButton = document.getElementById("btnFilterEmployees");
    const sortSalesButton = document.getElementById("btnSortSales");
    const linearSearchButton = document.getElementById("btnLinearSearch");
    const binarySearchButton = document.getElementById("btnBinarySearch");
    const aggregateButton = document.getElementById("btnAggregate");
    const validateButton = document.getElementById("btnValidate");
    filterSalesButton?.addEventListener("click", () => {
        const result = filterSalesByCriteria(salesRecords, {
            countryMarket: "Colombia",
            minTotalAmount: 100000,
        });
        renderResult("Filter Sales: Colombia + minTotalAmount 100000", result);
    });
    filterSuppliersButton?.addEventListener("click", () => {
        const result = filterSuppliersByCriteria(suppliers, {
            countryMarket: "United States (Florida)",
            isPreferred: true,
        });
        renderResult("Filter Suppliers: Florida + preferred", result);
    });
    filterEmployeesButton?.addEventListener("click", () => {
        const result = filterEmployeesByCriteria(employeeRecords, {
            department: "Technology",
            isActive: true,
        });
        renderResult("Filter Employees: Technology + active", result);
    });
    sortSalesButton?.addEventListener("click", () => {
        const result = sortSalesByAmount(salesRecords, "desc");
        renderResult("Sort Sales by Amount DESC", result);
    });
    linearSearchButton?.addEventListener("click", () => {
        const result = linearSearchSaleById(salesRecords, "SALE-1004");
        renderResult("Linear Search Sale by ID: SALE-1004", result);
    });
    binarySearchButton?.addEventListener("click", () => {
        const sortedLocations = sortLocationsById(brasalandLocations, "asc");
        const index = binarySearchLocationIndexById(sortedLocations, "US-MIA-04");
        renderResult("Binary Search Location ID on sorted array: US-MIA-04", {
            index,
            location: index >= 0 ? sortedLocations[index] : null,
        });
    });
    aggregateButton?.addEventListener("click", () => {
        const salesSummary = calculateSalesSummary(salesRecords);
        const supplierCountByCategory = countSuppliersByCategory(suppliers);
        renderResult("Aggregations", {
            salesSummary,
            supplierCountByCategory,
        });
    });
    validateButton?.addEventListener("click", () => {
        const locationPortfolioValidation = validateLocationPortfolio(brasalandLocations);
        renderResult("Validation: Location Portfolio", locationPortfolioValidation);
    });
}
initButtons();
