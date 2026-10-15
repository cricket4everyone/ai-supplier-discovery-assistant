export interface Supplier {
  id: string;
  name: string;
  location: 'Pune' | 'Mumbai' | 'Nashik';
  product: string;
  category: 'General Packaging' | 'Sustainable Packaging' | 'Corrugated Boxes' | 'Cartons' | 'E-commerce Mailers';
  moq: number;
  unit: 'unit' | 'piece';
  unitPrice: number;
  leadTimeMin: number;
  leadTimeMax: number;
  leadTimeDaysDisplay: string;
  paymentTerms: string;
  badge?: string;
  description: string;
  materialSpec: string;
  verifiedFictionalDemo: boolean;
  tradeOffSummary: {
    strength: string;
    tradeOff: string;
    bestFor: string;
  };
}

export interface FilterState {
  searchQuery: string;
  city: string;
  maxPrice: number;
  maxMoq: number;
  maxLeadTime: number;
  targetOrderQuantity: number;
  sortBy: 'recommended' | 'price_asc' | 'moq_asc' | 'lead_time_asc';
}

export interface TradeOffMetric {
  title: string;
  supplierName: string;
  highlightValue: string;
  subtitle: string;
  advantage: string;
  compromise: string;
  variant: 'price' | 'moq' | 'speed' | 'balanced';
}
