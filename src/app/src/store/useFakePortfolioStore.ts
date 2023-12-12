import _ from "lodash";
import { create } from "zustand";
import { BrokerExtractBuyLine, Portfolio } from "../hooks/useBrokers";

type State = {
  portfolio: Portfolio[];
  lines: BrokerExtractBuyLine[];
};

type Actions = {
  addLine: (line: BrokerExtractBuyLine) => void;
};

const useFakePortfolioStore = create<State & Actions>((set) => ({
  portfolio: [],
  lines: [],
  addLine: (line) =>
    set((state) => {
      let currentLines = [...state.lines];
      if (line.units === 0) {
        currentLines = currentLines.filter((l) => l.ticker !== line.ticker);
      } else {
        const existingRecord = currentLines.find(
          (l) => l.ticker === line.ticker
        );
        if (existingRecord) {
          existingRecord.units = line.units;
          existingRecord.amount = line.amount;
        } else {
          currentLines.push(line);
        }
      }
      const grouped = _.groupBy(currentLines, "ticker");

      const portfolio = _.map(grouped, (values, ticker) => {
        const units = _.sumBy(values, "units");
        const amount = _.sumBy(values, "amount");

        return {
          ticker,
          units,
          amount,
        };
      });

      return {
        ...state,
        portfolio,
        lines: currentLines,
      };
    }),
}));

export default useFakePortfolioStore;
