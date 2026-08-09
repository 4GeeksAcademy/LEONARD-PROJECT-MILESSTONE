export function countSuppliersByCategory(suppliers) {
    const result = {};
    for (const supplier of suppliers) {
        const current = result[supplier.category] ?? 0;
        result[supplier.category] = current + 1;
    }
    return result;
}
export function calculateSalesTotalsByCurrency(sales) {
    const totals = { COP: 0, USD: 0 };
    for (const sale of sales) {
        totals[sale.currencyCode] += sale.totalAmount;
    }
    return totals;
}
export function calculateSalesSummary(sales) {
    if (sales.length === 0) {
        return {
            totalCount: 0,
            totalAmount: 0,
            averageTicketAmount: 0,
            maxSaleAmount: null,
            minSaleAmount: null,
        };
    }
    let totalAmount = 0;
    let maxSaleAmount = sales[0].totalAmount;
    let minSaleAmount = sales[0].totalAmount;
    for (const sale of sales) {
        totalAmount += sale.totalAmount;
        if (sale.totalAmount > maxSaleAmount) {
            maxSaleAmount = sale.totalAmount;
        }
        if (sale.totalAmount < minSaleAmount) {
            minSaleAmount = sale.totalAmount;
        }
    }
    return {
        totalCount: sales.length,
        totalAmount,
        averageTicketAmount: totalAmount / sales.length,
        maxSaleAmount,
        minSaleAmount,
    };
}
export function calculateAverageSaleAmountByMarket(sales, market) {
    const marketSales = sales.filter((sale) => sale.countryMarket === market);
    if (marketSales.length === 0) {
        return 0;
    }
    const total = marketSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    return total / marketSales.length;
}
export function countSalesByLocation(sales) {
    const counts = {};
    for (const sale of sales) {
        const count = counts[sale.locationId] ?? 0;
        counts[sale.locationId] = count + 1;
    }
    return counts;
}
export function calculateCategoryPurchaseTotals(categories, amounts) {
    const totals = {
        meat: 0,
        vegetables: 0,
        sauces: 0,
        beverages: 0,
        packaging: 0,
        "cleaning-products": 0,
    };
    const pairCount = Math.min(categories.length, amounts.length);
    for (let index = 0; index < pairCount; index += 1) {
        totals[categories[index]] += amounts[index];
    }
    return totals;
}
