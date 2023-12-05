type ScorecardData = {
  scorecard: {
    name: string;
    price: number;
    "Div Yield (FWD)": string;
    "Annual Payout (FWD)": string;
    "Payout Ratio": string;
    "5 Year Growth Rate": string;
    "Dividend Growth": string;
    Amount: string;
    "Ex-Div Date": string;
    "Payout Date": string;
    "Record Date": string;
    "Declare Date": string;
    "Div Frequency": string;
  };
};

export interface SeekingAlphaData {
  scorecard: ScorecardData;
}
