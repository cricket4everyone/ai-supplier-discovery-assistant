import React, { useState } from 'react';
import {
  X,
  Building2,
  CheckCircle2,
  Download,
  Send,
  AlertCircle,
  IndianRupee,
  Package,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Supplier } from '../types/supplier';
import { calculateOrderDetails } from '../utils/procurementAnalytics';

interface RFQModalProps {
  supplier: Supplier | null;
  targetQuantity: number;
  onClose: () => void;
}

export const RFQModal: React.FC<RFQModalProps> = ({
  supplier,
  targetQuantity,
  onClose,
}) => {
  if (!supplier) return null;

  const [quantity, setQuantity] = useState(targetQuantity || supplier.moq);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + supplier.leadTimeMax + 2);
    return d.toISOString().slice(0, 10);
  });
  const [destinationCity, setDestinationCity] = useState<string>(supplier.location);
  const [notes, setNotes] = useState(
    `Looking for standard delivery of ${supplier.product}. Please confirm availability and exact carton dimensions.`
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  const orderDetails = calculateOrderDetails(supplier, quantity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Request for Quote (RFQ)</h3>
                <p className="text-xs text-slate-500">
                  Direct inquiry to {supplier.name} • {supplier.location}
                </p>
              </div>
            </div>

            {/* Supplier Quick Spec Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mb-4 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Product / Category:</span>
                <span className="font-semibold text-slate-900">{supplier.product}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Base Unit Price:</span>
                <span className="font-bold text-emerald-700">₹{supplier.unitPrice.toFixed(2)} / {supplier.unit}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Minimum Order (MOQ):</span>
                <span className="font-semibold text-slate-800">{supplier.moq.toLocaleString()} {supplier.unit}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Standard Lead Time:</span>
                <span className="font-semibold text-slate-800">{supplier.leadTimeDaysDisplay}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Supplier Payment Terms:</span>
                <span className="font-medium text-slate-700">{supplier.paymentTerms}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Order Quantity ({supplier.unit}s)
                  </label>
                  <input
                    type="number"
                    min={supplier.moq}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                  {quantity < supplier.moq && (
                    <span className="text-[10px] text-amber-600 block mt-0.5">
                      Below MOQ ({supplier.moq} {supplier.unit}s)
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Delivery Date
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Delivery Destination
                </label>
                <input
                  type="text"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  placeholder="e.g. Pune Warehouse #3, Bhosari MIDC"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Specifications & Commercial Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Total Calculation Preview */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <span className="text-slate-500 block text-[11px]">Estimated Landed Cost:</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {orderDetails.totalCostFormatted}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <span>₹{supplier.unitPrice.toFixed(2)} × {quantity} units</span>
                  <span className="block text-indigo-700 font-medium">Terms: {supplier.paymentTerms}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit RFQ
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">RFQ Drafted Successfully!</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Your Request for Quote for <strong>{quantity.toLocaleString()} {supplier.unit}s</strong> of {supplier.product} has been recorded for {supplier.name}.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Supplier:</span>
                <span className="font-semibold text-slate-800">{supplier.name} ({supplier.location})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Total:</span>
                <span className="font-bold text-slate-900">{orderDetails.totalCostFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lead Time:</span>
                <span className="font-semibold text-slate-800">{supplier.leadTimeDaysDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Terms:</span>
                <span className="font-semibold text-slate-800">{supplier.paymentTerms}</span>
              </div>
              <div className="pt-2 text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200/50 mt-1">
                Fictional demo RFQ simulation. No real purchase order was dispatched.
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Back to Supplier Discovery
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
