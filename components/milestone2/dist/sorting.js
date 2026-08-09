function applyDirection(comparisonResult, direction) {
    return direction === "asc" ? comparisonResult : comparisonResult * -1;
}
export function sortSalesByAmount(sales, direction) {
    return [...sales].sort((left, right) => {
        return applyDirection(left.totalAmount - right.totalAmount, direction);
    });
}
export function sortSalesByDate(sales, direction) {
    return [...sales].sort((left, right) => {
        const leftDate = new Date(left.soldAtISO).getTime();
        const rightDate = new Date(right.soldAtISO).getTime();
        return applyDirection(leftDate - rightDate, direction);
    });
}
export function sortLocationsById(locations, direction) {
    return [...locations].sort((left, right) => {
        const result = left.locationId.localeCompare(right.locationId);
        return applyDirection(result, direction);
    });
}
export function sortSalesByMarketThenAmount(sales, marketDirection, amountDirection) {
    return [...sales].sort((left, right) => {
        const marketResult = applyDirection(left.countryMarket.localeCompare(right.countryMarket), marketDirection);
        if (marketResult !== 0) {
            return marketResult;
        }
        return applyDirection(left.totalAmount - right.totalAmount, amountDirection);
    });
}
export function sortSuppliersByName(suppliers, direction) {
    return [...suppliers].sort((left, right) => {
        return applyDirection(left.supplierName.localeCompare(right.supplierName), direction);
    });
}
