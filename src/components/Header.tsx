import React from 'react';
import { Building2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface HeaderProps {
  matchingCount: number;
  totalCount: number;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  matchingCount,
  totalCount,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Demo Disclaimer Notice */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-900 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Fictional Demo Data:</strong> All 5 suppliers, price points, MOQs, and lead times are simulated for B2B procurement demonstration.
            </span>
          </div>
          <span className="hidden md:inline-block text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider">
            Enterprise Prototype
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  AI Supplier Discovery Assistant
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  B2B Sourcing
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Intelligent B2B vendor discovery, multi-parameter trade-off analysis & quote simulation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <div className="text-right">
              <div className="text-xs text-slate-500">Matching Suppliers</div>
              <div className="text-base font-bold text-slate-800">
                <span className="text-indigo-600">{matchingCount}</span> of {totalCount} verified
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                title="Reset all search filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
