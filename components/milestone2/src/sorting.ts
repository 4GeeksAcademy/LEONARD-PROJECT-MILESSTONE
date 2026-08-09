import { type BrasalandLocation, type SaleRecord, type Supplier } from "./types.js";

export type SortDirection = "asc" | "desc";

function applyDirection(comparisonResult: number, direction: SortDirection): number {
  return direction === "asc" ? comparisonResult : comparisonResult * -1;
}

export function sortSalesByAmount(sales: SaleRecord[], direction: SortDirection): SaleRecord[] {
  return [...sales].sort((left: SaleRecord, right: SaleRecord): number => {
    return applyDirection(left.totalAmount - right.totalAmount, direction);
  });
}

export function sortSalesByDate(sales: SaleRecord[], direction: SortDirection): SaleRecord[] {
  return [...sales].sort((left: SaleRecord, right: SaleRecord): number => {
    const leftDate = new Date(left.soldAtISO).getTime();
    const rightDate = new Date(right.soldAtISO).getTime();
    return applyDirection(leftDate - rightDate, direction);
  });
}

export function sortLocationsById(locations: BrasalandLocation[], direction: SortDirection): BrasalandLocation[] {
  return [...locations].sort((left: BrasalandLocation, right: BrasalandLocation): number => {
    const result = left.locationId.localeCompare(right.locationId);
    return applyDirection(result, direction);
  });
}

export function sortSalesByMarketThenAmount(
  sales: SaleRecord[],
  marketDirection: SortDirection,
  amountDirection: SortDirection,
): SaleRecord[] {
  return [...sales].sort((left: SaleRecord, right: SaleRecord): number => {
    const marketResult = applyDirection(left.countryMarket.localeCompare(right.countryMarket), marketDirection);

    if (marketResult !== 0) {
      return marketResult;
    }

    return applyDirection(left.totalAmount - right.totalAmount, amountDirection);
  });
}

export function sortSuppliersByName(suppliers: Supplier[], direction: SortDirection): Supplier[] {
  return [...suppliers].sort((left: Supplier, right: Supplier): number => {
    return applyDirection(left.supplierName.localeCompare(right.supplierName), direction);
  });
}
