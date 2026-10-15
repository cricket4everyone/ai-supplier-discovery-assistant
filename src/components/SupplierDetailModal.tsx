import React from 'react';
import {
  X,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  Package,
  IndianRupee,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Scale,
  Sparkles,
} from 'lucide-react';
import { Supplier } from '../types/supplier';
import { calculateOrderDetails } from '../utils/procurementAnalytics';

interface SupplierDetailModalProps {
  supplier: Supplier | null;
  targetOrderQuantity: number;
  allMatchingSuppliers: Supplier[];
  onClose: () => void;
  onRequestQuote: (supplier: Supplier) => void;
}

export const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  supplier,
  targetOrderQuantity,
  allMatchingSuppliers,
  onClose,
  onRequestQuote,
}) => {
  if (!supplier) return null;

  const orderDetails = calculateOrderDetails(supplier, targetOrderQuantity);

  // Position relative to other matching suppliers
  const otherSuppliers = allMatchingSuppliers.filter((s) => s.id !== supplier.id);
  const cheaperCount = otherSuppliers.filter((s) => s.unitPrice < supplier.unitPrice).length;
  const fasterCount = otherSuppliers.filter((s) => s.leadTimeMax < supplier.leadTimeMax).length;
  const lowerMoqCount = otherSuppliers.filter((s) => s.moq < supplier.moq).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200/50">
                {supplier.category}
              </span>
              <span className="text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200/50 font-medium">
                Fictional Demo Data
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{supplier.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{supplier.location}, Maharashtra, India</span>
            </div>
          </div>
        </div>

        {/* Overview description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
          {supplier.description}
        </p>

        {/* Technical & Commercial Specs */}
        <div className="space-y-4 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Commercial & Fulfillment Specifications
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
              <div className="text-[11px] font-medium text-emerald-800">Unit Price</div>
              <div className="text-base font-black text-emerald-950 mt-0.5">
                ₹{supplier.unitPrice.toFixed(2)}
              </div>
              <div className="text-[10px] text-emerald-700">per {supplier.unit}</div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
              <div className="text-[11px] font-medium text-blue-800">Min. Order (MOQ)</div>
              <div className="text-base font-black text-blue-950 mt-0.5">
                {supplier.moq.toLocaleString()}
              </div>
              <div className="text-[10px] text-blue-700">{supplier.unit}s</div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
              <div className="text-[11px] font-medium text-amber-800">Delivery Speed</div>
              <div className="text-base font-black text-amber-950 mt-0.5">
                {supplier.leadTimeDaysDisplay}
              </div>
              <div className="text-[10px] text-amber-700">transit window</div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-center">
              <div className="text-[11px] font-medium text-indigo-800">Payment Terms</div>
              <div className="text-xs font-bold text-indigo-950 mt-1 leading-tight line-clamp-2">
                {supplier.paymentTerms}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
            <span className="text-slate-500">Material Specification:</span>
            <span className="font-semibold text-slate-800 text-right">{supplier.materialSpec}</span>
          </div>
        </div>

        {/* Trade-off Rationale Matrix */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            Trade-off Rationale & Sourcing Fit
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-900 font-semibold block">Key Strength:</strong>
                <span className="text-emerald-800 leading-relaxed">{supplier.tradeOffSummary.strength}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/60 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-900 font-semibold block">The Compromise (Trade-off):</strong>
                <span className="text-rose-800 leading-relaxed">{supplier.tradeOffSummary.tradeOff}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200/60 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-900 font-semibold block">Ideal Sourcing Scenario:</strong>
                <span className="text-indigo-800 leading-relaxed">{supplier.tradeOffSummary.bestFor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Landed Cost Estimation */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white mb-6 text-xs flex justify-between items-center">
          <div>
            <div className="text-slate-400 text-[11px]">
              Simulated Invoice ({targetOrderQuantity.toLocaleString()} {supplier.unit}s)
            </div>
            <div className="text-lg font-black text-white mt-0.5">
              {orderDetails.totalCostFormatted}
            </div>
          </div>
          <div className="text-right">
            <div className="text-slate-400 text-[11px]">1x Lot Minimum Spend</div>
            <div className="text-sm font-bold text-indigo-300">
              {orderDetails.minCommitmentFormatted}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onRequestQuote(supplier);
            }}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            Proceed to RFQ
          </button>
        </div>
      </div>
    </div>
  );
};
