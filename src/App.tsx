import React, { useState, useMemo } from 'react';
import {
  Building2,
  Sparkles,
  ArrowRightLeft,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Zap,
  TrendingDown,
  Leaf,
} from 'lucide-react';
import { SAMPLE_SUPPLIERS } from './data/suppliers';
import { Supplier, FilterState } from './types/supplier';
import { filterSuppliers, sortSuppliers } from './utils/procurementAnalytics';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { SupplierCard } from './components/SupplierCard';
import { ComparisonTable } from './components/ComparisonTable';
import { AIRecommendationSection } from './components/AIRecommendationSection';
import { RFQModal } from './components/RFQModal';
import { SupplierDetailModal } from './components/SupplierDetailModal';

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  city: 'all',
  maxPrice: 25,
  maxMoq: 1500,
  maxLeadTime: 10,
  targetOrderQuantity: 500,
  sortBy: 'recommended',
};

export default function App() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [selectedComparisonIds, setSelectedComparisonIds] = useState<string[]>([]);
  const [rfqSupplier, setRfqSupplier] = useState<Supplier | null>(null);
  const [detailSupplier, setDetailSupplier] = useState<Supplier | null>(null);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchQuery.trim() !== '' ||
      filters.city !== 'all' ||
      filters.maxPrice < 25 ||
      filters.maxMoq < 1500 ||
      filters.maxLeadTime < 10
    );
  }, [filters]);

  // Filter and sort suppliers
  const matchingSuppliers = useMemo(() => {
    const filtered = filterSuppliers(SAMPLE_SUPPLIERS, filters);
    return sortSuppliers(filtered, filters.sortBy);
  }, [filters]);

  // Suppliers explicitly selected for comparison
  const selectedSuppliersForComparison = useMemo(() => {
    return SAMPLE_SUPPLIERS.filter((s) => selectedComparisonIds.includes(s.id));
  }, [selectedComparisonIds]);

  const handleUpdateFilter = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleToggleComparison = (supplier: Supplier) => {
    setSelectedComparisonIds((prev) =>
      prev.includes(supplier.id) ? prev.filter((id) => id !== supplier.id) : [...prev, supplier.id]
    );
  };

  const handleSelectAllMatchingForComparison = () => {
    setSelectedComparisonIds(matchingSuppliers.map((s) => s.id));
  };

  const handleClearComparison = () => {
    setSelectedComparisonIds([]);
  };

  // Quick Sourcing Scenario Presets
  const applyPreset = (preset: 'lowest_price' | 'fastest_delivery' | 'low_moq' | 'sustainable') => {
    switch (preset) {
      case 'lowest_price':
        setFilters({
          ...INITIAL_FILTERS,
          maxPrice: 12.0,
          sortBy: 'price_asc',
          targetOrderQuantity: 1000,
        });
        break;
      case 'fastest_delivery':
        setFilters({
          ...INITIAL_FILTERS,
          maxLeadTime: 5,
          sortBy: 'lead_time_asc',
          targetOrderQuantity: 300,
        });
        break;
      case 'low_moq':
        setFilters({
          ...INITIAL_FILTERS,
          maxMoq: 300,
          sortBy: 'moq_asc',
          targetOrderQuantity: 200,
        });
        break;
      case 'sustainable':
        setFilters({
          ...INITIAL_FILTERS,
          searchQuery: 'sustainable',
          targetOrderQuantity: 300,
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header & Demo Disclaimer */}
      <Header
        matchingCount={matchingSuppliers.length}
        totalCount={SAMPLE_SUPPLIERS.length}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Value Proposition & Quick Sourcing Scenarios */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              B2B Supplier Discovery & Trade-Off Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Filter verified packaging suppliers across Western India. Compare prices, minimum lot sizes (MOQ),
              and fulfillment cycles with AI-assisted trade-off intelligence.
            </p>
          </div>

          {/* Quick Scenario Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold mr-1">Buyer Scenarios:</span>
            <button
              onClick={() => applyPreset('lowest_price')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              Lowest Price
            </button>
            <button
              onClick={() => applyPreset('fastest_delivery')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              Fastest Lead Time
            </button>
            <button
              onClick={() => applyPreset('low_moq')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/60 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Low MOQ (Trial)
            </button>
            <button
              onClick={() => applyPreset('sustainable')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/60 hover:bg-teal-100 transition-colors cursor-pointer"
            >
              <Leaf className="w-3.5 h-3.5 text-teal-600" />
              Eco / Sustainable
            </button>
          </div>
        </div>

        {/* Search & Filter Dashboard Bar */}
        <FilterBar
          filters={filters}
          onChange={handleUpdateFilter}
          onReset={handleResetFilters}
          totalAvailableCount={SAMPLE_SUPPLIERS.length}
          filteredCount={matchingSuppliers.length}
        />

        {/* AI Trade-Off Recommendation Section */}
        {/* Strictly compares ONLY suppliers that satisfy the buyer's requirements! */}
        <AIRecommendationSection
          matchingSuppliers={matchingSuppliers}
          filters={filters}
          onRequestQuote={(s) => setRfqSupplier(s)}
        />

        {/* Supplier Results Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">
                Matching Suppliers ({matchingSuppliers.length})
              </h3>
              {matchingSuppliers.length > 0 && (
                <span className="text-xs text-slate-500">
                  Meeting all active filter parameters
                </span>
              )}
            </div>

            {matchingSuppliers.length > 0 && selectedComparisonIds.length === 0 && (
              <button
                onClick={handleSelectAllMatchingForComparison}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Compare All in Table
              </button>
            )}
          </div>

          {matchingSuppliers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">
                No Suppliers Match Your Search or Filter Criteria
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Try widening your price range, relaxing the lead time, or choosing "All Locations".
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchingSuppliers.map((supplier) => (
                <SupplierCard
                  key={supplier.id}
                  supplier={supplier}
                  targetOrderQuantity={filters.targetOrderQuantity}
                  isSelectedForComparison={selectedComparisonIds.includes(supplier.id)}
                  onToggleComparison={handleToggleComparison}
                  onRequestQuote={(s) => setRfqSupplier(s)}
                  onViewTradeOffs={(s) => setDetailSupplier(s)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Supplier Comparison Table */}
        <ComparisonTable
          suppliers={selectedSuppliersForComparison}
          allMatchingSuppliers={matchingSuppliers}
          targetOrderQuantity={filters.targetOrderQuantity}
          onRemoveSupplier={(id) =>
            setSelectedComparisonIds((prev) => prev.filter((i) => i !== id))
          }
          onSelectAll={handleSelectAllMatchingForComparison}
          onClearComparison={handleClearComparison}
          onRequestQuote={(s) => setRfqSupplier(s)}
        />
      </main>

      {/* RFQ Modal */}
      <RFQModal
        supplier={rfqSupplier}
        targetQuantity={filters.targetOrderQuantity}
        onClose={() => setRfqSupplier(null)}
      />

      {/* Supplier Detail & Deep Trade-Off Modal */}
      <SupplierDetailModal
        supplier={detailSupplier}
        targetOrderQuantity={filters.targetOrderQuantity}
        allMatchingSuppliers={matchingSuppliers}
        onClose={() => setDetailSupplier(null)}
        onRequestQuote={(s) => setRfqSupplier(s)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">AI Supplier Discovery Assistant</span>
            <span>•</span>
            <span>B2B Procurement Simulation</span>
          </div>
          <div className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/50">
            <strong>Fictional Demo Notice:</strong> Pune Pack Solutions, GreenPack Industries, Western Packaging Works, Industrial Cartons India, and PackEase Mailers are fictional demo entities.
          </div>
        </div>
      </footer>
    </div>
  );
}
