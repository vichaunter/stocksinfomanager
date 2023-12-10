export const LABELS: Record<
  string,
  { type?: string; name: string; suffix?: string; prefix?: string }
> = {
  dividend5YearGrowhthRate: {
    name: "Dividend 5 Year growth rate",
    suffix: "%",
  },
  symbol: {
    name: "Symbol",
  },
  price: {
    name: "Price",
  },
  payDividend: {
    type: "boolean",
    name: "Pay Dividends",
  },
  dividendAnnualPayout: {
    name: "Dividend Annual Payout",
    prefix: "$",
  },
  dividendYield: {
    name: "Dividend Yield",
    suffix: "%",
  },
  dividendYearsGrowhth: {
    name: "Div Y growth",
    suffix: "Years",
  },
  dividendFrequency: {
    name: "Div Freq",
  },
  dividendAmount: {
    name: "Dividend Per Payment Amount",
    prefix: "$",
  },
  dividendDeclareDate: {
    type: "date",
    name: "Dividend Declare Date",
  },
  dividendExDate: {
    type: "date",
    name: "Ex-Dividend Date",
  },
  dividendPayoutDate: {
    type: "date",
    name: "Dividend Payout Date",
  },
  dividendPayoutRatio: {
    name: "Dividend Payout Ratio",
    suffix: "%",
  },
  dividendRecordDate: {
    type: "date",
    name: "Dividend Record Date",
  },
  nextExDate: {
    type: "date",
    name: "Next Ex-Dividend Date",
  },
  nextPayDate: {
    type: "date",
    name: "Next Dividend Pay Date",
  },
  updatedAt: {
    type: "date",
    name: "Updated At",
  },
};
