import { Supplier, FilterState, TradeOffMetric } from '../types/supplier';

export function filterSuppliers(suppliers: Supplier[], filters: FilterState): Supplier[] {
  return suppliers.filter((supplier) => {
    // Search query check
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = supplier.name.toLowerCase().includes(q);
      const matchProduct = supplier.product.toLowerCase().includes(q);
      const matchCategory = supplier.category.toLowerCase().includes(q);
      const matchLocation = supplier.location.toLowerCase().includes(q);
      const matchDesc = supplier.description.toLowerCase().includes(q);
      if (!matchName && !matchProduct && !matchCategory && !matchLocation && !matchDesc) {
        return false;
      }
    }

    // City filter
    if (filters.city && filters.city !== 'all') {
      if (supplier.location.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }
    }

    // Maximum Price filter
    if (filters.maxPrice > 0 && supplier.unitPrice > filters.maxPrice) {
      return false;
    }

    // Maximum MOQ filter (buyer specifies maximum MOQ they can tolerate)
    if (filters.maxMoq > 0 && supplier.moq > filters.maxMoq) {
      return false;
    }

    // Delivery lead time filter (supplier's max lead time <= filter max lead time)
    if (filters.maxLeadTime > 0 && supplier.leadTimeMax > filters.maxLeadTime) {
      return false;
    }

    return true;
  });
}

export function sortSuppliers(suppliers: Supplier[], sortBy: FilterState['sortBy']): Supplier[] {
  const sorted = [...suppliers];
  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => a.unitPrice - b.unitPrice);
    case 'moq_asc':
      return sorted.sort((a, b) => a.moq - b.moq);
    case 'lead_time_asc':
      return sorted.sort((a, b) => a.leadTimeMax - b.leadTimeMax || a.leadTimeMin - b.leadTimeMin);
    case 'recommended':
    default:
      // Balanced procurement score: composite ranking of price, MOQ, and speed
      return sorted.sort((a, b) => {
        const scoreA = (a.unitPrice * 1.5) + (a.moq * 0.01) + (a.leadTimeMax * 2);
        const scoreB = (b.unitPrice * 1.5) + (b.moq * 0.01) + (b.leadTimeMax * 2);
        return scoreA - scoreB;
      });
  }
}

export function calculateOrderDetails(supplier: Supplier, targetQuantity: number) {
  const effectiveQty = Math.max(targetQuantity, supplier.moq);
  const isBelowMoq = targetQuantity < supplier.moq;
  const shortfall = isBelowMoq ? supplier.moq - targetQuantity : 0;
  const totalCost = effectiveQty * supplier.unitPrice;
  const minimumOrderCost = supplier.moq * supplier.unitPrice;

  return {
    effectiveQty,
    isBelowMoq,
    shortfall,
    totalCost,
    minimumOrderCost,
    costPerUnitFormatted: `₹${supplier.unitPrice.toFixed(2)}`,
    totalCostFormatted: `₹${totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    minCommitmentFormatted: `₹${minimumOrderCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
  };
}

export function extractTradeOffMetrics(matchingSuppliers: Supplier[]): TradeOffMetric[] {
  if (matchingSuppliers.length === 0) return [];

  const metrics: TradeOffMetric[] = [];

  // 1. Lowest Unit Price
  const lowestPriceSupplier = [...matchingSuppliers].sort((a, b) => a.unitPrice - b.unitPrice)[0];
  const highestPriceSupplier = [...matchingSuppliers].sort((a, b) => b.unitPrice - a.unitPrice)[0];
  const priceDiffPct = highestPriceSupplier.unitPrice !== lowestPriceSupplier.unitPrice
    ? Math.round(((highestPriceSupplier.unitPrice - lowestPriceSupplier.unitPrice) / lowestPriceSupplier.unitPrice) * 100)
    : 0;

  metrics.push({
    title: 'Price Efficiency Leader',
    supplierName: lowestPriceSupplier.name,
    highlightValue: `₹${lowestPriceSupplier.unitPrice.toFixed(2)}/${lowestPriceSupplier.unit}`,
    subtitle: `Lowest unit cost among filtered options`,
    advantage: `Save up to ${priceDiffPct}% per unit compared to higher-tier options in this set.`,
    compromise: `Requires MOQ of ${lowestPriceSupplier.moq} ${lowestPriceSupplier.unit}s and ${lowestPriceSupplier.leadTimeDaysDisplay} delivery lead time.`,
    variant: 'price',
  });

  // 2. Lowest Minimum Order Quantity (Cash Flexibility)
  const lowestMoqSupplier = [...matchingSuppliers].sort((a, b) => a.moq - b.moq)[0];
  metrics.push({
    title: 'Minimum Capital Outlay',
    supplierName: lowestMoqSupplier.name,
    highlightValue: `${lowestMoqSupplier.moq} ${lowestMoqSupplier.unit}s MOQ`,
    subtitle: `Lowest entry commitment (₹${(lowestMoqSupplier.moq * lowestMoqSupplier.unitPrice).toLocaleString('en-IN')} min spend)`,
    advantage: `Minimal working capital tie-up; ideal for initial batch sampling, SKU tests, or short-term runs.`,
    compromise: `Unit price is ₹${lowestMoqSupplier.unitPrice.toFixed(2)} (trade-off of smaller run economics).`,
    variant: 'moq',
  });

  // 3. Fastest Lead Time
  const fastestSupplier = [...matchingSuppliers].sort((a, b) => a.leadTimeMax - b.leadTimeMax)[0];
  metrics.push({
    title: 'Speed & Agility Champion',
    supplierName: fastestSupplier.name,
    highlightValue: fastestSupplier.leadTimeDaysDisplay,
    subtitle: `Fastest dispatch cycle in current selection`,
    advantage: `Mitigates urgent inventory stockout risk and speeds time-to-market.`,
    compromise: `Payment term: "${fastestSupplier.paymentTerms}". Review if cash flow or advance payment fits your terms.`,
    variant: 'speed',
  });

  return metrics;
}
