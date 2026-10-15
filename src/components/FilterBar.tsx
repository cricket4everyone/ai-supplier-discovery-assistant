import React from 'react';
import {
  Search,
  MapPin,
  IndianRupee,
  Package,
  Clock,
  SlidersHorizontal,
  X,
  Calculator,
} from 'lucide-react';
import { FilterState } from '../types/supplier';

interface FilterBarProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  totalAvailableCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  totalAvailableCount,
  filteredCount,
}) => {
  const cities = ['all', 'Pune', 'Mumbai', 'Nashik'];

  const quickCategories = [
    { label: 'All Categories', query: '' },
    { label: 'Packaging', query: 'packaging' },
    { label: 'Sustainable', query: 'sustainable' },
    { label: 'Corrugated Boxes', query: 'corrugated' },
    { label: 'Cartons', query: 'cartons' },
    { label: 'E-commerce', query: 'e-commerce' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 mb-8 transition-all">
      {/* Search Field & Category Quick Tags */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            placeholder="Search by product, category, or supplier (e.g. cartons, sustainable, mailers, Pune Pack)..."
            className="w-full pl-10 pr-10 py-3 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ searchQuery: '' })}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap mr-1">Quick search:</span>
          {quickCategories.map((cat) => {
            const isActive =
              filters.searchQuery.toLowerCase() === cat.query.toLowerCase() ||
              (!cat.query && !filters.searchQuery);
            return (
              <button
                key={cat.label}
                onClick={() => onChange({ searchQuery: cat.query })}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="my-4 border-t border-slate-100" />

      {/* Structured Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filter 1: City */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
            Supplier City
          </label>
          <div className="relative">
            <select
              value={filters.city}
              onChange={(e) => onChange({ city: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city === 'all' ? 'All Locations (Pune, Mumbai, Nashik)' : `${city}, Maharashtra`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter 2: Maximum Price */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              Max Price / Unit
            </label>
            <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200/50">
              {filters.maxPrice >= 25 ? 'Any Price' : `≤ ₹${filters.maxPrice.toFixed(2)}`}
            </span>
          </div>
          <div className="pt-1">
            <input
              type="range"
              min="4.50"
              max="25"
              step="0.5"
              value={filters.maxPrice}
              onChange={(e) => onChange({ maxPrice: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹4.50</span>
              <span>₹12.00</span>
              <span>₹18.00+ (Any)</span>
            </div>
          </div>
        </div>

        {/* Filter 3: Minimum Order Quantity (MOQ) Tolerance */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              Max Acceptable MOQ
            </label>
            <span className="font-bold text-slate-900 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200/50">
              {filters.maxMoq >= 1500 ? 'Any MOQ' : `≤ ${filters.maxMoq} units`}
            </span>
          </div>
          <div className="pt-1">
            <input
              type="range"
              min="200"
              max="1500"
              step="50"
              value={filters.maxMoq}
              onChange={(e) => onChange({ maxMoq: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>200 units</span>
              <span>500</span>
              <span>1,000+ (Any)</span>
            </div>
          </div>
        </div>

        {/* Filter 4: Delivery Lead Time */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Max Delivery Time
            </label>
            <span className="font-bold text-slate-900 bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200/50">
              {filters.maxLeadTime >= 10 ? 'Any Lead Time' : `≤ ${filters.maxLeadTime} days`}
            </span>
          </div>
          <div className="pt-1">
            <input
              type="range"
              min="3"
              max="10"
              step="1"
              value={filters.maxLeadTime}
              onChange={(e) => onChange({ maxLeadTime: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>3 days (Rush)</span>
              <span>5 days</span>
              <span>8+ days (Any)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Order Volume & Cost Simulator Bar */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-800">Target Order Quantity:</span>
              <span className="text-[11px] text-slate-500 block">Simulates total landed spend & MOQ fulfillment</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="100"
              max="10000"
              step="50"
              value={filters.targetOrderQuantity}
              onChange={(e) =>
                onChange({ targetOrderQuantity: Math.max(1, parseInt(e.target.value, 10) || 1) })
              }
              className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <span className="text-xs font-medium text-slate-600">units/pieces</span>
          </div>

          {/* Quick preset buttons for order quantity */}
          <div className="flex items-center gap-1 text-xs">
            {[200, 300, 500, 1000].map((preset) => (
              <button
                key={preset}
                onClick={() => onChange({ targetOrderQuantity: preset })}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  filters.targetOrderQuantity === preset
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Sort by:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as FilterState['sortBy'] })}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="recommended">Best Balanced Score</option>
            <option value="price_asc">Unit Price: Low to High</option>
            <option value="moq_asc">MOQ: Smallest First</option>
            <option value="lead_time_asc">Delivery: Fastest First</option>
          </select>
        </div>
      </div>
    </div>
  );
};
