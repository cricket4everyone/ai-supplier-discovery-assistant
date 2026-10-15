import React, { useState } from 'react';
import {
  Sparkles,
  TrendingDown,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
  Bot,
  Send,
  Loader2,
  FileText,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  Percent,
} from 'lucide-react';
import { Supplier, FilterState } from '../types/supplier';
import { extractTradeOffMetrics, calculateOrderDetails } from '../utils/procurementAnalytics';

interface AIRecommendationSectionProps {
  matchingSuppliers: Supplier[];
  filters: FilterState;
  onRequestQuote: (supplier: Supplier) => void;
}

export const AIRecommendationSection: React.FC<AIRecommendationSectionProps> = ({
  matchingSuppliers,
  filters,
  onRequestQuote,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'executive' | 'assistant'>('matrix');
  const [executiveMemo, setExecutiveMemo] = useState<string | null>(null);
  const [isLoadingMemo, setIsLoadingMemo] = useState(false);
  const [memoError, setMemoError] = useState<string | null>(null);

  // Assistant query state
  const [userQuery, setUserQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; timestamp: string }>
  >([]);
  const [isQuerying, setIsQuerying] = useState(false);

  // If 0 suppliers match criteria
  if (matchingSuppliers.length === 0) {
    return (
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-6 mb-12">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-amber-900">
              No Suppliers Meet All Filter Constraints
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              The AI Recommendation engine strictly analyzes suppliers that satisfy your active requirements.
              Currently, no supplier meets your combination of price (≤ ₹{filters.maxPrice}), MOQ (≤ {filters.maxMoq}),
              delivery time (≤ {filters.maxLeadTime} days), or city ({filters.city}).
            </p>
            <div className="pt-2 text-xs text-amber-900 font-medium">
              💡 <strong>Trade-off Suggestion:</strong> Try relaxing the maximum lead time or increasing your acceptable MOQ threshold to reveal available suppliers.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tradeOffCards = extractTradeOffMetrics(matchingSuppliers);

  // Specific Champions among matching set
  const lowestPriceSupplier = [...matchingSuppliers].sort((a, b) => a.unitPrice - b.unitPrice)[0];
  const lowestMoqSupplier = [...matchingSuppliers].sort((a, b) => a.moq - b.moq)[0];
  const fastestDeliverySupplier = [...matchingSuppliers].sort((a, b) => a.leadTimeMax - b.leadTimeMax)[0];

  // Request deep Gemini AI executive analysis
  const fetchExecutiveMemo = async () => {
    setIsLoadingMemo(true);
    setMemoError(null);
    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suppliers: matchingSuppliers,
          buyerRequirements: {
            searchQuery: filters.searchQuery,
            city: filters.city,
            maxPrice: filters.maxPrice,
            maxMoq: filters.maxMoq,
            maxLeadTime: filters.maxLeadTime,
            orderVolume: filters.targetOrderQuantity,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      setExecutiveMemo(data.analysis || 'Analysis generated.');
      setActiveTab('executive');
    } catch (err: any) {
      console.error(err);
      setMemoError('Could not reach Gemini service. Displaying deterministic trade-off analysis.');
    } finally {
      setIsLoadingMemo(false);
    }
  };

  // Submit custom query to procurement AI
  const handleAskAI = async (customPrompt?: string) => {
    const q = (customPrompt || userQuery).trim();
    if (!q) return;

    const userMessage = {
      role: 'user' as const,
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setUserQuery('');
    setIsQuerying(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          suppliers: matchingSuppliers,
          buyerRequirements: {
            orderVolume: filters.targetOrderQuantity,
            city: filters.city,
          },
        }),
      });

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant' as const,
        text: data.answer || 'Consultation complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const fallbackMessage = {
        role: 'assistant' as const,
        text: `Among the ${matchingSuppliers.length} matching suppliers: Lowest unit price is ${lowestPriceSupplier.name} (₹${lowestPriceSupplier.unitPrice}), lowest MOQ is ${lowestMoqSupplier.name} (${lowestMoqSupplier.moq} units), and fastest lead time is ${fastestDeliverySupplier.name} (${fastestDeliverySupplier.leadTimeDaysDisplay}).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsQuerying(false);
    }
  };

  const samplePrompts = [
    `Which supplier minimizes cash risk for ${filters.targetOrderQuantity} units?`,
    'Compare Pune Pack Solutions vs Industrial Cartons India.',
    'Is the price premium for GreenPack sustainable packaging worth it?',
    'Which supplier is safest for urgent stockout replenishment?',
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-12 border border-indigo-900/40 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
              <Bot className="w-5 h-5 text-indigo-400" />
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              AI Trade-Off Recommendation Engine
            </h3>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
              Live Synthesis
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Comparing <strong>only the {matchingSuppliers.length} supplier{matchingSuppliers.length > 1 ? 's' : ''}</strong> satisfying your active constraints.
            Evaluating the fundamental triangle of B2B procurement: <strong>Unit Price vs. MOQ vs. Lead Time</strong>.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Trade-off Matrix
          </button>
          <button
            onClick={() => {
              setActiveTab('executive');
              if (!executiveMemo) fetchExecutiveMemo();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'executive'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            Executive Memo
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'assistant'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Ask Procurement AI
          </button>
        </div>
      </div>

      {/* TAB 1: TRADE-OFF MATRIX VIEW */}
      {activeTab === 'matrix' && (
        <div className="relative z-10 space-y-6">
          {/* Key Trade-off Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tradeOffCards.map((card, idx) => {
              const details = calculateOrderDetails(
                matchingSuppliers.find((s) => s.name === card.supplierName) || matchingSuppliers[0],
                filters.targetOrderQuantity
              );

              return (
                <div
                  key={idx}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                        {card.title}
                      </span>
                      {card.variant === 'price' && <TrendingDown className="w-4 h-4 text-emerald-400" />}
                      {card.variant === 'moq' && <Layers className="w-4 h-4 text-blue-400" />}
                      {card.variant === 'speed' && <Clock className="w-4 h-4 text-amber-400" />}
                    </div>

                    <div>
                      <div className="text-2xl font-black text-white">{card.highlightValue}</div>
                      <div className="text-sm font-bold text-indigo-200 mt-0.5">{card.supplierName}</div>
                      <div className="text-xs text-slate-400">{card.subtitle}</div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                        <strong className="text-emerald-300 font-semibold block text-[11px]">
                          Advantage:
                        </strong>
                        <span className="text-emerald-100/90 text-xs">{card.advantage}</span>
                      </div>

                      <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                        <strong className="text-rose-300 font-semibold block text-[11px]">
                          The Trade-Off (Compromise):
                        </strong>
                        <span className="text-rose-100/90 text-xs">{card.compromise}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Total ({filters.targetOrderQuantity} units): <strong>{details.totalCostFormatted}</strong>
                    </span>
                    <button
                      onClick={() => {
                        const sup = matchingSuppliers.find((s) => s.name === card.supplierName);
                        if (sup) onRequestQuote(sup);
                      }}
                      className="text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      Draft RFQ <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deep Trade-off Walkthrough Breakdown */}
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h4 className="text-base font-bold text-white">
                Detailed Strategic Trade-off Analysis for Your Order ({filters.targetOrderQuantity.toLocaleString()} Units)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-400" />
                  1. Price vs. Working Capital Lockup
                </div>
                <p>
                  Lowest unit cost is offered by{' '}
                  <span className="text-emerald-300 font-semibold">{lowestPriceSupplier.name}</span> at{' '}
                  <strong>₹{lowestPriceSupplier.unitPrice.toFixed(2)}</strong>. However, to access this rate, you
                  must commit to an MOQ of{' '}
                  <strong>{lowestPriceSupplier.moq.toLocaleString()} units</strong> (
                  ₹{(lowestPriceSupplier.moq * lowestPriceSupplier.unitPrice).toLocaleString('en-IN')} minimum order outlay).
                </p>
                <p>
                  Conversely,{' '}
                  <span className="text-blue-300 font-semibold">{lowestMoqSupplier.name}</span> lets you order as
                  few as <strong>{lowestMoqSupplier.moq} units</strong> (
                  ₹{(lowestMoqSupplier.moq * lowestMoqSupplier.unitPrice).toLocaleString('en-IN')} outlay), but charges{' '}
                  <strong>₹{lowestMoqSupplier.unitPrice.toFixed(2)}/unit</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  2. Speed vs. Price & Payment Flexibility
                </div>
                <p>
                  If speed is critical,{' '}
                  <span className="text-amber-300 font-semibold">{fastestDeliverySupplier.name}</span> delivers within{' '}
                  <strong>{fastestDeliverySupplier.leadTimeDaysDisplay}</strong>.
                </p>
                <p>
                  Notice payment terms: suppliers with faster dispatch or lower prices often require tighter payment terms
                  (e.g. <em>{fastestDeliverySupplier.paymentTerms}</em> vs longer Net 30/45 credit terms at high-volume carton mills).
                </p>
              </div>
            </div>

            {/* Quick Sourcing Decision Framework */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-indigo-950/40 p-4 rounded-xl border border-indigo-800/40 text-xs">
              <div className="flex items-center gap-2 text-indigo-200">
                <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  Ready to consult Gemini 3.8 Flash for an automated procurement executive memo?
                </span>
              </div>
              <button
                onClick={fetchExecutiveMemo}
                disabled={isLoadingMemo}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-md shadow-indigo-600/30"
              >
                {isLoadingMemo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Executive Memo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXECUTIVE MEMO (GEMINI GENERATED / DETERMINISTIC) */}
      {activeTab === 'executive' && (
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>
                Executive Procurement Brief based strictly on matching suppliers ({matchingSuppliers.length} vendors)
              </span>
            </div>
            <button
              onClick={fetchExecutiveMemo}
              disabled={isLoadingMemo}
              className="text-xs text-indigo-300 hover:text-white flex items-center gap-1.5 font-medium cursor-pointer"
            >
              {isLoadingMemo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Refresh Analysis
            </button>
          </div>

          {isLoadingMemo ? (
            <div className="p-12 text-center bg-slate-900/80 rounded-2xl border border-white/10 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <div className="text-sm font-bold text-white">Analyzing Supplier Trade-Offs with Gemini...</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Synthesizing per-unit margins, capital outlay, lead time variance, and payment terms across matching suppliers.
              </p>
            </div>
          ) : memoError ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-200">
              {memoError}
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 text-sm text-slate-200 leading-relaxed font-sans space-y-3 prose prose-invert max-w-none">
              <div className="whitespace-pre-line font-normal text-xs sm:text-sm text-slate-200">
                {executiveMemo ||
                  `### Executive Sourcing Recommendation
                  
Comparing the ${matchingSuppliers.length} suppliers matching your filters:
1. **Cost Minimization**: ${lowestPriceSupplier.name} provides the most competitive unit price at ₹${lowestPriceSupplier.unitPrice.toFixed(2)}. Best suited for standard recurring batches.
2. **Speed & Reliability**: ${fastestDeliverySupplier.name} guarantees dispatch within ${fastestDeliverySupplier.leadTimeDaysDisplay}, minimizing buffer inventory.
3. **Capital Flexibility**: ${lowestMoqSupplier.name} allows rapid market entry with an MOQ of just ${lowestMoqSupplier.moq} units.`}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ASK PROCUREMENT AI (INTERACTIVE CHAT) */}
      {activeTab === 'assistant' && (
        <div className="relative z-10 space-y-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">
                Procurement Decision Q&A (Grounded in Verified Suppliers)
              </h4>
            </div>

            {/* Conversation list */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {chatHistory.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Ask any question about price trade-offs, lead time risks, or supplier selection for your order of{' '}
                  <strong>{filters.targetOrderQuantity} units</strong>.
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/10 text-slate-100 border border-white/10'
                      }`}
                    >
                      <div className="text-[10px] font-semibold text-slate-300 mb-1">
                        {msg.role === 'user' ? 'You' : 'AI Procurement Advisor'} • {msg.timestamp}
                      </div>
                      <div className="whitespace-pre-line">{msg.text}</div>
                    </div>
                  </div>
                ))
              )}

              {isQuerying && (
                <div className="flex items-center gap-2 text-xs text-indigo-300 bg-white/5 p-3 rounded-xl w-fit">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating trade-offs for your inquiry...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="pt-2 border-t border-white/10">
              <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
                Suggested questions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => handleAskAI(promptText)}
                    disabled={isQuerying}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors text-left cursor-pointer"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAskAI();
                  }
                }}
                placeholder="Ask e.g. Which supplier has the best payment terms for a high-volume run?"
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleAskAI()}
                disabled={isQuerying || !userQuery.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Ask
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom disclaimer */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Recommendations reflect fictional demo supplier pricing & delivery specs.</span>
        </div>
        <span>Powered by Gemini 3.8 Flash & Heuristic Decision Matrix</span>
      </div>
    </div>
  );
};
