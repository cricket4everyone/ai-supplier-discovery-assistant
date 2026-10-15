import React from 'react';
import {
  MapPin,
  Clock,
  Package,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  FileText,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Supplier } from '../types/supplier';
import { calculateOrderDetails } from '../utils/procurementAnalytics';

interface SupplierCardProps {
  supplier: Supplier;
  targetOrderQuantity: number;
  isSelectedForComparison: boolean;
  onToggleComparison: (supplier: Supplier) => void;
  onRequestQuote: (supplier: Supplier) => void;
  onViewTradeOffs: (supplier: Supplier) => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({
  supplier,
  targetOrderQuantity,
  isSelectedForComparison,
  onToggleComparison,
  onRequestQuote,
  onViewTradeOffs,
}) => {
  const orderDetails = calculateOrderDetails(supplier, targetOrderQuantity);

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
        isSelectedForComparison
          ? 'border-indigo-600 ring-2 ring-indigo-500/20'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Banner Tag */}
      <div className="px-5 pt-4 pb-1 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/50">
              {supplier.product}
            </span>
            {supplier.badge && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                <TrendingUp className="w-3 h-3 text-slate-500" />
                {supplier.badge}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {supplier.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-700">{supplier.location}</span>
            <span>•</span>
            <span className="text-[11px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-medium border border-amber-200/50">
              Fictional Demo Data
            </span>
          </div>
        </div>

        {/* Checkbox for comparison */}
        <button
          onClick={() => onToggleComparison(supplier)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isSelectedForComparison
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title="Toggle inclusion in comparison table"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          {isSelectedForComparison ? 'Comparing' : 'Compare'}
        </button>
      </div>

      {/* Main Parameters Grid */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 bg-slate-50/50 rounded-xl px-3.5">
          {/* Unit Price */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <IndianRupee className="w-3 h-3 text-emerald-600" />
              Unit Price
            </span>
            <div className="text-xl font-extrabold text-slate-900">
              ₹{supplier.unitPrice.toFixed(2)}
              <span className="text-xs font-normal text-slate-500 ml-1">/{supplier.unit}</span>
            </div>
          </div>

          {/* Delivery Lead Time */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              Lead Time
            </span>
            <div className="text-base font-bold text-slate-900">
              {supplier.leadTimeDaysDisplay}
            </div>
          </div>

          {/* Minimum Order Quantity (MOQ) */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Package className="w-3 h-3 text-blue-600" />
              Min. Order (MOQ)
            </span>
            <div className="text-base font-bold text-slate-900">
              {supplier.moq.toLocaleString()} {supplier.unit}s
            </div>
          </div>

          {/* Payment Terms */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-500" />
              Payment Terms
            </span>
            <div className="text-xs font-bold text-slate-800 line-clamp-1" title={supplier.paymentTerms}>
              {supplier.paymentTerms}
            </div>
          </div>
        </div>

        {/* Dynamic Spend Simulation for target order */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>
              Simulated Spend ({targetOrderQuantity.toLocaleString()} {supplier.unit}s):
            </span>
            <span className="font-extrabold text-slate-900 text-sm">
              {orderDetails.totalCostFormatted}
            </span>
          </div>

          {orderDetails.isBelowMoq ? (
            <div className="mt-2 flex items-center gap-1.5 text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200/60 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>
                Target order is under MOQ by {orderDetails.shortfall} units. Minimum order invoice is{' '}
                <strong>{orderDetails.minCommitmentFormatted}</strong>.
              </span>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-1 text-emerald-700 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Meets required MOQ threshold.</span>
            </div>
          )}
        </div>

        {/* Quick Trade-off summary */}
        <div className="text-xs text-slate-600 bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100/60">
          <div className="font-semibold text-indigo-950 mb-0.5">Trade-off Profile:</div>
          <p className="text-[11px] leading-relaxed text-slate-600">
            <strong className="text-emerald-700 font-medium">Strength:</strong> {supplier.tradeOffSummary.strength}
          </p>
          <p className="text-[11px] leading-relaxed text-slate-600 mt-1">
            <strong className="text-rose-700 font-medium">Trade-off:</strong> {supplier.tradeOffSummary.tradeOff}
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 pt-0 flex items-center gap-2">
        <button
          onClick={() => onRequestQuote(supplier)}
          className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          Request Quote
        </button>
        <button
          onClick={() => onViewTradeOffs(supplier)}
          className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          title="Inspect supplier trade-off rationale"
        >
          Analysis
        </button>
      </div>
    </div>
  );
};
