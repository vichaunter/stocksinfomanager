interface MetricAttributes {
  value: number;
  meaningful: boolean;
}

interface MetricType {
  id: string;
  type: string;
  attributes: {
    field: string;
  };
}

interface TickerAttributes {
  slug: string;
  iexSlug: string;
  name: string;
  companyName: string;
  equityType: string;
  indexGroup: null | string; // Add other attributes as needed
  currency: string;
  tradingViewSlug: string;
  exchange: string;
  exchangeDescription: null | string;
  company: string;
  isBdc: boolean;
  visible: boolean;
  searchable: boolean;
  private: boolean;
  pending: boolean;
  isDefunct: boolean;
  followersCount: number;
  fundTypeId: number;
  articleRtaCount: number;
  newsRtaCount: number;
  divYieldType: string;
  primaryEpsConsensusMeanType: string;
  mergedOn: null | string;
  isReit: boolean;
}

interface TickerRelationships {
  metric_type: {
    data: {
      id: string;
      type: string;
    };
  };
  ticker: {
    data: {
      id: string;
      type: string;
    };
  };
}

interface Ticker {
  id: string;
  type: string;
  attributes: TickerAttributes;
  relationships: TickerRelationships;
  meta: {
    companyLogoUrl: string;
    companyLogoUrlLight: string;
    companyLogoUrlDark: string;
  };
}

interface Metric {
  id: string;
  type: string;
  attributes: MetricAttributes;
  relationships: {
    metric_type: {
      data: {
        id: string;
        type: string;
      };
    };
    ticker: {
      data: {
        id: string;
        type: string;
      };
    };
  };
}

interface MetricTypeAttributes {
  field: string;
}

interface MetricType {
  id: string;
  type: string;
  attributes: MetricTypeAttributes;
}

interface SymbolDataAttributes {
  dividends: {
    amount: number;
    date: string;
    exDate: string;
    payDate: string;
    recordDate: string;
    declareDate: string;
  }[];
}

interface SymbolData {
  id: string;
  attributes: SymbolDataAttributes;
}

interface RealTimeQuote {
  ticker_id: number;
  sa_id: number;
  sa_slug: string;
  symbol: string;
  high: number;
  low: number;
  open: number;
  close: number;
  prev_close: number;
  last: number;
  volume: number;
  last_time: string;
  market_cap: number;
  ext_time: string;
  ext_price: number;
  ext_market: string;
  info: string;
  src: string;
  updated_at: string;
}

export interface SeekingAlphaData {
  forMetrics: {
    data: Metric[];
    included: MetricType[];
  };
  forSymbolData: {
    data: SymbolData[];
  };
  forRealTimeQuotes: {
    real_time_quotes: RealTimeQuote[];
  };
}
