export function filterSalesByCriteria(sales, criteria) {
    return sales.filter((sale) => {
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
export function filterSuppliersByCriteria(allSuppliers, criteria) {
    return allSuppliers.filter((supplier) => {
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
export function filterEmployeesByCriteria(employees, criteria) {
    return employees.filter((employee) => {
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
