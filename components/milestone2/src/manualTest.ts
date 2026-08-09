import {
  brasalandLocations,
  employeeRecords,
  filterEmployeesByCriteria,
  filterSalesByCriteria,
  filterSuppliersByCriteria,
  linearSearchSaleById,
  salesRecords,
  sortLocationsById,
  sortSalesByAmount,
  suppliers,
  binarySearchLocationIndexById,
  calculateSalesSummary,
  countSuppliersByCategory,
  validateLocationPortfolio,
} from "./index.js";

function renderResult(title: string, value: unknown): void {
  const output = document.getElementById("result");

  if (output === null) {
    return;
  }

  output.textContent = `${title}\n\n${JSON.stringify(value, null, 2)}`;
}

function initButtons(): void {
  const filterSalesButton = document.getElementById("btnFilterSales");
  const filterSuppliersButton = document.getElementById("btnFilterSuppliers");
  const filterEmployeesButton = document.getElementById("btnFilterEmployees");
  const sortSalesButton = document.getElementById("btnSortSales");
  const linearSearchButton = document.getElementById("btnLinearSearch");
  const binarySearchButton = document.getElementById("btnBinarySearch");
  const aggregateButton = document.getElementById("btnAggregate");
  const validateButton = document.getElementById("btnValidate");

  filterSalesButton?.addEventListener("click", (): void => {
    const result = filterSalesByCriteria(salesRecords, {
      countryMarket: "Colombia",
      minTotalAmount: 100000,
    });
    renderResult("Filter Sales: Colombia + minTotalAmount 100000", result);
  });

  filterSuppliersButton?.addEventListener("click", (): void => {
    const result = filterSuppliersByCriteria(suppliers, {
      countryMarket: "United States (Florida)",
      isPreferred: true,
    });
    renderResult("Filter Suppliers: Florida + preferred", result);
  });

  filterEmployeesButton?.addEventListener("click", (): void => {
    const result = filterEmployeesByCriteria(employeeRecords, {
      department: "Technology",
      isActive: true,
    });
    renderResult("Filter Employees: Technology + active", result);
  });

  sortSalesButton?.addEventListener("click", (): void => {
    const result = sortSalesByAmount(salesRecords, "desc");
    renderResult("Sort Sales by Amount DESC", result);
  });

  linearSearchButton?.addEventListener("click", (): void => {
    const result = linearSearchSaleById(salesRecords, "SALE-1004");
    renderResult("Linear Search Sale by ID: SALE-1004", result);
  });

  binarySearchButton?.addEventListener("click", (): void => {
    const sortedLocations = sortLocationsById(brasalandLocations, "asc");
    const index = binarySearchLocationIndexById(sortedLocations, "US-MIA-04");
    renderResult("Binary Search Location ID on sorted array: US-MIA-04", {
      index,
      location: index >= 0 ? sortedLocations[index] : null,
    });
  });

  aggregateButton?.addEventListener("click", (): void => {
    const salesSummary = calculateSalesSummary(salesRecords);
    const supplierCountByCategory = countSuppliersByCategory(suppliers);
    renderResult("Aggregations", {
      salesSummary,
      supplierCountByCategory,
    });
  });

  validateButton?.addEventListener("click", (): void => {
    const locationPortfolioValidation = validateLocationPortfolio(brasalandLocations);
    renderResult("Validation: Location Portfolio", locationPortfolioValidation);
  });
}

initButtons();
