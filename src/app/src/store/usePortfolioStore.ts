import _ from "lodash";
import { create } from "zustand";
import {
  BrokerExtractBuyLine,
  BrokerExtractDividendLine,
  Portfolio,
  PortfolioData,
} from "../hooks/useBrokers";

type State = {
  portfolio: Portfolio[];
  dividends: BrokerExtractDividendLine[];
  buys: BrokerExtractBuyLine[];
};

type Actions = {
  setExtract: (data: PortfolioData[]) => void;
};

const usePortfolioStore = create<State & Actions>((set) => ({
  portfolio: [],
  dividends: [],
  buys: [],
  setExtract: (data) =>
    set((state) => {
      const buys = _.flatten(data.map((d) => d.buys));
      const dividends = _.flatten(data.map((d) => d.dividends));

      const grouped = _.groupBy(buys, "ticker");
      const portfolio = _.map(grouped, (values, ticker) => {
        const units = _.sumBy(values, "units");
        const amount = _.sumBy(values, "amount");

        return {
          ticker,
          units: ["ARR"].includes(ticker) ? units / 5 : units,
          amount,
        };
      });

      return {
        ...state,
        portfolio,
        buys,
        dividends,
      };
    }),
}));

export default usePortfolioStore;
