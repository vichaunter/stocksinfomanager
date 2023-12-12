import { ChangeEvent, useEffect } from "react";
import usePortfolioStore from "../store/usePortfolioStore";
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
  broker: Broker;
};

export type BrokerExtractDividendLine = {
  ticker: string;
  amount: number;
  currency: string;
  date: string;
  broker: Broker;
};

export type PortfolioData = {
  buys: BrokerExtractBuyLine[];
  dividends: BrokerExtractDividendLine[];
};

export type Portfolio = {
  ticker: string;
  units: number;
  amount: number;
};

export type Broker = keyof typeof BROKERS;

type Return = {
  updateData: (broker: Broker, e: ChangeEvent<HTMLInputElement>) => void;
};

const useBrokers = (): Return => {
  const setExtract = usePortfolioStore((state) => state.setExtract);

  const [revolutData, _, onChangeRevolut] = useRevolut();
  const [etoroData, onChangeEtoro] = useEtoro();

  useEffect(() => {
    setExtract([revolutData, etoroData]);
  }, [revolutData, etoroData]);

  const brokerHandlers: Record<
    Partial<Broker>,
    (e: ChangeEvent<HTMLInputElement>) => void
  > = {
    etoro: onChangeEtoro,
    revolut: onChangeRevolut,
  };

  const updateData = (broker: Broker, e: ChangeEvent<HTMLInputElement>) => {
    brokerHandlers[broker](e);
  };

  return {
    updateData,
  };
};

export default useBrokers;
