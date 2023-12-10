import lodash from "lodash";
import { ChangeEvent, useEffect, useState } from "react";
import useEtoro from "./useEtoro";
import useRevolut from "./useRevolut";

const BROKERS = {
  etoro: "etoro",
  revolut: "revolut",
};

export type BrokerExtractBuyLine = {
  ticker: string;
  amount: number;
  currency: string;
  units: number;
  date: string;
  broker: keyof typeof BROKERS;
};

export type BrokerExtractDividendLine = {
  ticker: string;
  amount: number;
  currency: string;
  date: string;
  broker: keyof typeof BROKERS;
};

export type PortfolioData = {
  buys?: BrokerExtractBuyLine[];
  dividends?: BrokerExtractDividendLine[];
};

export type Portfolio = {
  ticker: string;
  units: number;
  amount: number;
};

type Return = {
  data: PortfolioData[];
  portfolio: Portfolio[];
  updateData: (broker: string, e: ChangeEvent<HTMLInputElement>) => void;
};

const useBrokersExtract = (): Return => {
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [revolutData, _, onChangeRevolut] = useRevolut();
  const [etoroData, onChangeEtoro] = useEtoro();
  const data: PortfolioData[] = [];
  if (revolutData?.buys) data.push(revolutData);
  if (etoroData?.buys) data.push(etoroData);

  useEffect(() => {
    const buys = lodash.flatten(data.map((d) => d.buys));
    const grouped = lodash.groupBy(buys, "ticker");
    const sum = lodash.map(grouped, (values, ticker) => {
      const units = lodash.sumBy(values, "units");
      const amount = lodash.sumBy(values, "amount");

      return {
        ticker,
        units: ["ARR"].includes(ticker) ? units / 5 : units,
        amount,
      };
    });

    setPortfolio(sum);
  }, [revolutData, etoroData]);

  const brokers: Record<string, (e: ChangeEvent<HTMLInputElement>) => void> = {
    etoro: onChangeEtoro,
    revolut: onChangeRevolut,
  };

  const updateData = (
    broker: keyof typeof brokers,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    brokers[broker](e);
  };

  return {
    data,
    portfolio,
    updateData,
  };
};

export default useBrokersExtract;
