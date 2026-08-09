export function linearSearchSaleById(sales, saleId) {
    for (const sale of sales) {
        if (sale.saleId === saleId) {
            return sale;
        }
    }
    return null;
}
export function linearSearchLocationById(locations, locationId) {
    for (const location of locations) {
        if (location.locationId === locationId) {
            return location;
        }
    }
    return null;
}
export function binarySearchLocationIndexById(sortedLocations, locationId) {
    let low = 0;
    let high = sortedLocations.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const currentId = sortedLocations[mid].locationId;
        const compare = currentId.localeCompare(locationId);
        if (compare === 0) {
            return mid;
        }
        if (compare < 0) {
            low = mid + 1;
        }
        else {
            high = mid - 1;
        }
    }
    return -1;
}
export function binarySearchSaleIndexByAmount(sortedSalesByAmountAsc, amount) {
    let low = 0;
    let high = sortedSalesByAmountAsc.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midAmount = sortedSalesByAmountAsc[mid].totalAmount;
        if (midAmount === amount) {
            return mid;
        }
        if (midAmount < amount) {
            low = mid + 1;
        }
        else {
            high = mid - 1;
        }
    }
    return -1;
}
