type KeyStatsData = {
  fiftyTwoWeekHighLow: {
    label: string;
    value: string;
  };
  dayrange: {
    label: string;
    value: string;
  };
};

type NotificationEventType = {
  message: string;
  eventName: string;
  url: {
    label: string;
    value: string;
  };
  id: string;
};

type Notification = {
  headline: string;
  eventTypes: NotificationEventType[];
};

type MainPrimaryData = {
  lastSalePrice: string;
  netChange: string;
  percentageChange: string;
  deltaIndicator: string;
  lastTradeTimestamp: string;
  isRealTime: boolean;
  bidPrice: string;
  askPrice: string;
  bidSize: string;
  askSize: string;
  volume: string;
};

type MainSecondaryData = null; // Adjust if it has a different structure

type Main = {
  symbol: string;
  companyName: string;
  stockType: string;
  exchange: string;
  isNasdaqListed: boolean;
  isNasdaq100: boolean;
  isHeld: boolean;
  primaryData: MainPrimaryData;
  secondaryData: MainSecondaryData;
  marketStatus: string;
  assetClass: string;
  keyStats: KeyStatsData;
  notifications: Notification[];
};

type FinancialsHeaders = {
  value1: string;
  value2: string;
  value3: string;
  value4: string;
  value5: string;
};

type FinancialsRow = {
  value1: string;
  value2: string;
  value3: string;
  value4: string;
  value5: string;
};

type FinancialsTable = {
  asOf: string | null;
  headers: FinancialsHeaders;
  rows: FinancialsRow[];
};

type FinancialsTabs = {
  incomeStatementTable: string;
  balanceSheetTable: string;
  cashFlowTable: string;
  financialRatiosTable: string;
};

type FinancialsData = {
  symbol: string;
  tabs: FinancialsTabs;
  incomeStatementTable: FinancialsTable;
  balanceSheetTable: FinancialsTable;
  cashFlowTable: FinancialsTable;
  financialRatiosTable: FinancialsTable;
};

type DividendHeader = {
  label: string;
  value: string;
};

type DividendHeaderValues = DividendHeader[];

type DividendRow = {
  exOrEffDate: string;
  type: string;
  amount: string;
  declarationDate: string;
  recordDate: string;
  paymentDate: string;
  currency: string;
};

type DividendsTable = {
  asOf: string | null;
  headers: {
    exOrEffDate: string;
    type: string;
    amount: string;
    declarationDate: string;
    recordDate: string;
    paymentDate: string;
  };
  rows: DividendRow[];
};

type DividendsData = {
  dividendHeaderValues: DividendHeaderValues;
  exDividendDate: string;
  dividendPaymentDate: string;
  yield: string;
  annualizedDividend: string;
  payoutRatio: string;
  dividends: DividendsTable;
};

type HistoricalTrade = {
  date: string;
  close: string;
  volume: string;
  open: string;
  high: string;
  low: string;
};

type HistoricalTradesTable = {
  asOf: string | null;
  headers: {
    date: string;
    close: string;
    volume: string;
    open: string;
    high: string;
    low: string;
  };
  rows: HistoricalTrade[];
};

type HistoricalData = {
  symbol: string;
  totalRecords: number;
  tradesTable: HistoricalTradesTable;
};

export type NasdaqRawData = {
  main: Main;
  financials: FinancialsData;
  dividends: DividendsData;
  historical: HistoricalData;
};
