import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Download,
  Copy,
  Check,
  Building2,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { Supplier } from '../types/supplier';
import { calculateOrderDetails } from '../utils/procurementAnalytics';

interface ComparisonTableProps {
  suppliers: Supplier[];
  allMatchingSuppliers: Supplier[];
  targetOrderQuantity: number;
  onRemoveSupplier: (id: string) => void;
  onSelectAll: () => void;
  onClearComparison: () => void;
  onRequestQuote: (supplier: Supplier) => void;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  suppliers,
  allMatchingSuppliers,
  targetOrderQuantity,
  onRemoveSupplier,
  onSelectAll,
  onClearComparison,
  onRequestQuote,
}) => {
  const [copied, setCopied] = useState(false);

  // If no suppliers are selected for comparison, fall back to all matching suppliers
  const displaySuppliers = suppliers.length > 0 ? suppliers : allMatchingSuppliers;

  if (displaySuppliers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <ArrowRightLeft className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-bold text-slate-800">No Suppliers Available to Compare</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Adjust your search or filter parameters to find matching suppliers, or add suppliers from the list above.
        </p>
      </div>
    );
  }

  // Find optimal values across displayed set to highlight in table
  const lowestPrice = Math.min(...displaySuppliers.map((s) => s.unitPrice));
  const lowestMoq = Math.min(...displaySuppliers.map((s) => s.moq));
  const fastestLeadTime = Math.min(...displaySuppliers.map((s) => s.leadTimeMax));

  const exportCSV = () => {
    const headers = [
      'Company Name',
      'Product',
      'Location',
      'Unit Price (INR)',
      'MOQ',
      'Lead Time',
      'Payment Terms',
      `Simulated Total (${targetOrderQuantity} units)`,
      'Minimum Order Spend',
      'Data Type',
    ];

    const rows = displaySuppliers.map((s) => {
      const details = calculateOrderDetails(s, targetOrderQuantity);
      return [
        `"${s.name}"`,
        `"${s.product}"`,
        `"${s.location}"`,
        s.unitPrice,
        s.moq,
        `"${s.leadTimeDaysDisplay}"`,
        `"${s.paymentTerms}"`,
        details.totalCost,
        details.minimumOrderCost,
        '"Fictional Demo Data"',
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `supplier_comparison_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copySummary = () => {
    const text = displaySuppliers
      .map((s) => {
        const details = calculateOrderDetails(s, targetOrderQuantity);
        return `• ${s.name} (${s.location})
  Product: ${s.product}
  Price: ₹${s.unitPrice}/${s.unit} | MOQ: ${s.moq} | Lead Time: ${s.leadTimeDaysDisplay}
  Terms: ${s.paymentTerms}
  Simulated Total for ${targetOrderQuantity} units: ${details.totalCostFormatted} (Min Commitment: ${details.minCommitmentFormatted})`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(
      `B2B Sourcing Comparison (${targetOrderQuantity} units):\n\n${text}\n\n[Fictional Demo Data]`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-12">
      {/* Table Header Bar */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Supplier Comparison Matrix</h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200/60">
              {displaySuppliers.length} Suppliers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Side-by-side trade-off matrix with color-coded best values and simulated batch invoice calculations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {suppliers.length > 0 && suppliers.length < allMatchingSuppliers.length && (
            <button
              onClick={onSelectAll}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            >
              Compare All Matching ({allMatchingSuppliers.length})
            </button>
          )}

          {suppliers.length > 0 && (
            <button
              onClick={onClearComparison}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            >
              Reset Selection
            </button>
          )}

          <button
            onClick={copySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            title="Copy comparison summary to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Summary'}
          </button>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Download CSV for Excel/Sheets"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Responsive Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <th className="py-3.5 px-4 sticky left-0 bg-slate-100/95 z-10 w-56">Supplier & Product</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4 text-right">Unit Price</th>
              <th className="py-3.5 px-4 text-right">Minimum Order (MOQ)</th>
              <th className="py-3.5 px-4">Lead Time</th>
              <th className="py-3.5 px-4">Payment Terms</th>
              <th className="py-3.5 px-4 text-right bg-indigo-50/40">
                Simulated Total ({targetOrderQuantity} units)
              </th>
              <th className="py-3.5 px-4 text-right">Min. Commitment</th>
              <th className="py-3.5 px-4">Primary Trade-Off</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
            {displaySuppliers.map((supplier) => {
              const details = calculateOrderDetails(supplier, targetOrderQuantity);
              const isBestPrice = supplier.unitPrice === lowestPrice;
              const isBestMoq = supplier.moq === lowestMoq;
              const isFastest = supplier.leadTimeMax === fastestLeadTime;

              return (
                <tr key={supplier.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Company Name & Product */}
                  <td className="py-3.5 px-4 sticky left-0 bg-white z-10 font-medium border-r border-slate-100">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{supplier.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                      {supplier.product}
                    </div>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50 mt-1 inline-block">
                      Fictional Demo
                    </span>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{supplier.location}</span>
                  </td>

                  {/* Unit Price */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isBestPrice && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          Lowest
                        </span>
                      )}
                      <span
                        className={`font-extrabold ${
                          isBestPrice ? 'text-emerald-700 text-sm' : 'text-slate-900'
                        }`}
                      >
                        ₹{supplier.unitPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">per {supplier.unit}</div>
                  </td>

                  {/* MOQ */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isBestMoq && (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                          Lowest
                        </span>
                      )}
                      <span className={`font-bold ${isBestMoq ? 'text-blue-700' : 'text-slate-800'}`}>
                        {supplier.moq.toLocaleString()} {supplier.unit}s
                      </span>
                    </div>
                  </td>

                  {/* Lead Time */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      {isFastest && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          Fastest
                        </span>
                      )}
                      <span className={`font-semibold ${isFastest ? 'text-emerald-800' : 'text-slate-800'}`}>
                        {supplier.leadTimeDaysDisplay}
                      </span>
                    </div>
                  </td>

                  {/* Payment Terms */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded text-[11px]">
                      {supplier.paymentTerms}
                    </span>
                  </td>

                  {/* Simulated Total for target order */}
                  <td className="py-3.5 px-4 text-right bg-indigo-50/20 font-bold">
                    <div className="text-slate-900 font-extrabold text-sm">
                      {details.totalCostFormatted}
                    </div>
                    {details.isBelowMoq ? (
                      <span className="text-[10px] text-amber-600 block">
                        (Scaled to {supplier.moq} MOQ)
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 block">
                        Exact volume met
                      </span>
                    )}
                  </td>

                  {/* Minimum Commitment (MOQ * Price) */}
                  <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                    <div>{details.minCommitmentFormatted}</div>
                    <div className="text-[10px] text-slate-400">1x lot minimum</div>
                  </td>

                  {/* Primary Trade-Off Summary */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="text-[11px] text-slate-600 leading-snug line-clamp-2" title={supplier.tradeOffSummary.tradeOff}>
                      {supplier.tradeOffSummary.tradeOff}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onRequestQuote(supplier)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                      >
                        RFQ
                      </button>
                      {suppliers.length > 0 && (
                        <button
                          onClick={() => onRemoveSupplier(supplier.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer Notes */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-400" />
          <span>
            Highlighted badges represent optimal parameters across the current filtered comparison set.
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Showing {displaySuppliers.length} verified sample suppliers
        </div>
      </div>
    </div>
  );
};
