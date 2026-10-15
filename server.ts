import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize GoogleGenAI server-side with User-Agent header per skill guidelines
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// POST /api/ai/recommend - Generate trade-off procurement analysis
app.post('/api/ai/recommend', async (req: Request, res: Response) => {
  try {
    const { suppliers, buyerRequirements } = req.body;

    if (!suppliers || !Array.isArray(suppliers) || suppliers.length === 0) {
      return res.status(400).json({
        error: 'No matching suppliers provided to analyze.',
      });
    }

    if (!ai) {
      // Fallback deterministic analysis if API key is not configured
      return res.json({
        isAiGenerated: false,
        analysis: generateFallbackAnalysis(suppliers, buyerRequirements),
      });
    }

    const prompt = `You are a Senior B2B Procurement Strategy Advisor.
Analyze the following filtered suppliers who satisfy the buyer's current criteria.
Explain the concrete commercial trade-offs between unit price (₹), Minimum Order Quantity (MOQ), and delivery lead time (days).

Buyer Requirements:
- Search/Category: ${buyerRequirements?.searchQuery || 'Any'}
- Target Order Volume: ${buyerRequirements?.orderVolume || 'Standard batch'} units
- Selected City Filter: ${buyerRequirements?.city || 'All locations'}
- Max Price Cap: ${buyerRequirements?.maxPrice ? `₹${buyerRequirements.maxPrice}` : 'Unrestricted'}
- Max MOQ Cap: ${buyerRequirements?.maxMoq ? `${buyerRequirements.maxMoq} units` : 'Unrestricted'}
- Max Lead Time: ${buyerRequirements?.maxLeadTime ? `${buyerRequirements.maxLeadTime} days` : 'Unrestricted'}

Matching Suppliers (Strictly compare ONLY these suppliers that satisfy the criteria):
${suppliers
  .map(
    (s: any, idx: number) =>
      `${idx + 1}. ${s.name} (${s.location})
   - Product: ${s.product}
   - Unit Price: ₹${s.unitPrice}/${s.unit}
   - MOQ: ${s.moq} ${s.unit}s
   - Lead Time: ${s.leadTimeMin}-${s.leadTimeMax} days (${s.leadTimeDaysDisplay})
   - Payment Terms: ${s.paymentTerms}`
  )
  .join('\n\n')}

Provide an executive, structured procurement trade-off recommendation in clear markdown:
1. **Executive Trade-off Summary**: High-level comparison of the price vs. MOQ vs. delivery trade-offs among ONLY these matching suppliers.
2. **Cost vs. Commitment Analysis**: Contrast the lowest unit price supplier vs. the lowest MOQ supplier (cash outlay vs per-unit margin).
3. **Lead Time & Operational Agility**: Evaluate speed of delivery vs price premium.
4. **Actionable Sourcing Recommendation**: Which supplier should the buyer choose for:
   - Immediate/Urgent demand
   - Lowest total capital risk/pilot test
   - High-volume cost minimization
Keep it concise, professional, grounded strictly in the supplied data, and note that these are fictional demo suppliers.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert enterprise supply chain and procurement consultant. Always ground your analysis strictly in the provided supplier facts and financial trade-offs.',
      },
    });

    return res.json({
      isAiGenerated: true,
      analysis: response.text || 'Trade-off analysis generated.',
    });
  } catch (error: any) {
    console.error('Error generating AI recommendation:', error);
    // Return deterministic fallback so user always gets a helpful answer
    return res.json({
      isAiGenerated: false,
      analysis: generateFallbackAnalysis(req.body?.suppliers || [], req.body?.buyerRequirements),
      note: 'Operating on built-in procurement decision model.',
    });
  }
});

// POST /api/ai/ask - Custom procurement queries
app.post('/api/ai/ask', async (req: Request, res: Response) => {
  try {
    const { question, suppliers, buyerRequirements } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    if (!ai) {
      return res.json({
        answer: `Direct Procurement Guidance:
For question "${question}":
Based on the current filtered suppliers (${suppliers.map((s: any) => s.name).join(', ')}), review the trade-offs:
- For lowest unit price: Check ${suppliers.reduce((min: any, s: any) => (s.unitPrice < min.unitPrice ? s : min), suppliers[0] || {}).name || 'available suppliers'}.
- For fastest delivery: Check ${suppliers.reduce((min: any, s: any) => (s.leadTimeMax < min.leadTimeMax ? s : min), suppliers[0] || {}).name || 'available suppliers'}.
- For lowest cash outlay/MOQ: Check ${suppliers.reduce((min: any, s: any) => (s.moq < min.moq ? s : min), suppliers[0] || {}).name || 'available suppliers'}.`,
      });
    }

    const prompt = `You are a B2B Procurement Assistant. Answer the buyer's query based ONLY on these matching fictional suppliers:
${JSON.stringify(suppliers, null, 2)}

Buyer Context:
Target volume: ${buyerRequirements?.orderVolume || 500} units.
Buyer Question: "${question}"

Provide a crisp, direct, highly practical answer addressing the procurement trade-offs (price, MOQ, lead time, payment terms). Keep under 200 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      answer: response.text || 'Analysis complete.',
    });
  } catch (error: any) {
    console.error('Error answering query:', error);
    return res.status(500).json({
      error: 'Failed to process AI query',
      fallback: 'Please review the side-by-side comparison table for direct parameter trade-offs.',
    });
  }
});

function generateFallbackAnalysis(suppliers: any[], requirements: any): string {
  if (!suppliers || suppliers.length === 0) {
    return 'No suppliers match the current criteria. Try expanding your maximum price, MOQ threshold, or city filter.';
  }

  const lowestPrice = [...suppliers].sort((a, b) => a.unitPrice - b.unitPrice)[0];
  const lowestMoq = [...suppliers].sort((a, b) => a.moq - b.moq)[0];
  const fastestDelivery = [...suppliers].sort((a, b) => a.leadTimeMax - b.leadTimeMax)[0];

  return `### Procurement Trade-off Analysis (${suppliers.length} Matching Supplier${suppliers.length > 1 ? 's' : ''})

*Note: Based on verified fictional demo supplier parameters.*

#### 1. Price vs. Minimum Order Quantity (MOQ)
- **Lowest Unit Price**: **${lowestPrice.name}** at **₹${lowestPrice.unitPrice.toFixed(2)}/${lowestPrice.unit}**. However, you must commit to an MOQ of **${lowestPrice.moq} ${lowestPrice.unit}s**, resulting in an initial minimum capital commitment of **₹${(lowestPrice.unitPrice * lowestPrice.moq).toLocaleString('en-IN')}**.
- **Lowest Capital Outlay**: **${lowestMoq.name}** requires only **${lowestMoq.moq} ${lowestMoq.unit}s** minimum commitment (total min spend **₹${(lowestMoq.unitPrice * lowestMoq.moq).toLocaleString('en-IN')}**), though unit price is **₹${lowestMoq.unitPrice.toFixed(2)}**. This is ideal for testing demand or preserving working capital.

#### 2. Delivery Lead Time Trade-off
- **Fastest Fulfillment**: **${fastestDelivery.name}** offers delivery in **${fastestDelivery.leadTimeDaysDisplay}**, significantly reducing stockout risk compared to slower options (${Math.max(...suppliers.map(s => s.leadTimeMax))} days max).

#### 3. Strategic Sourcing Recommendations
- **Choose ${lowestPrice.name}** if your forecast is confident, warehouse space is available, and maximizing unit gross margin is your primary KPI.
- **Choose ${lowestMoq.name}** if you are piloting a new product line or wish to minimize upfront inventory risk.
- **Choose ${fastestDelivery.name}** if just-in-time delivery and rapid replenishment outweigh per-unit variance.`;
}

// Development with Vite middleware or Production static files
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`B2B Supplier Discovery server running at http://0.0.0.0:${port}`);
  });
}

startServer();
