import { type EmployeeFilterCriteria, type EmployeeRecord, type SaleRecord, type SalesFilterCriteria, type Supplier, type SupplierFilterCriteria } from "./types.js";

export function filterSalesByCriteria(sales: SaleRecord[], criteria: SalesFilterCriteria): SaleRecord[] {
  return sales.filter((sale: SaleRecord): boolean => {
    if (criteria.countryMarket !== undefined && sale.countryMarket !== criteria.countryMarket) {
      return false;
    }

    if (criteria.locationId !== undefined && sale.locationId !== criteria.locationId) {
      return false;
    }

    if (criteria.minTotalAmount !== undefined && sale.totalAmount < criteria.minTotalAmount) {
      return false;
    }

    if (criteria.maxTotalAmount !== undefined && sale.totalAmount > criteria.maxTotalAmount) {
      return false;
    }

    if (criteria.fromDateISO !== undefined && sale.soldAtISO < criteria.fromDateISO) {
      return false;
    }

    if (criteria.toDateISO !== undefined && sale.soldAtISO > criteria.toDateISO) {
      return false;
    }

    return true;
  });
}

export function filterSuppliersByCriteria(allSuppliers: Supplier[], criteria: SupplierFilterCriteria): Supplier[] {
  return allSuppliers.filter((supplier: Supplier): boolean => {
    if (criteria.countryMarket !== undefined && supplier.countryMarket !== criteria.countryMarket) {
      return false;
    }

    if (criteria.category !== undefined && supplier.category !== criteria.category) {
      return false;
    }

    if (criteria.isPreferred !== undefined && supplier.isPreferred !== criteria.isPreferred) {
      return false;
    }

    return true;
  });
}

export function filterEmployeesByCriteria(employees: EmployeeRecord[], criteria: EmployeeFilterCriteria): EmployeeRecord[] {
  return employees.filter((employee: EmployeeRecord): boolean => {
    if (criteria.countryMarket !== undefined && employee.countryMarket !== criteria.countryMarket) {
      return false;
    }

    if (criteria.department !== undefined && employee.department !== criteria.department) {
      return false;
    }

    if (criteria.isActive !== undefined && employee.isActive !== criteria.isActive) {
      return false;
    }

    if (criteria.hasCompletedOnboarding !== undefined && employee.hasCompletedOnboarding !== criteria.hasCompletedOnboarding) {
      return false;
    }

    return true;
  });
}
