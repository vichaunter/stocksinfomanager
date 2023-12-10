import Papa from "papaparse";
import { ChangeEvent, useState } from "react";
import { cleanNumber } from "@packages/utils";
import {
  BrokerExtractBuyLine,
  BrokerExtractDividendLine,
  PortfolioData,
} from "./useBrokersExtract";

export type RevolutData = {
  Date: string;
  Ticker: string;
  Type: string;
  Quantity: string;
  "Price per share": string;
  "Total Amount": string;
  Currency: string;
  "FX Rate": string;
};

export type RevolutHeaders = {
  date: string;
  ticker: string;
  Type: string;
  quantity: string;
  pps: string;
  total: string;
  currency: string;
  fxrate: string;
};

const useRevolut = (): [
  PortfolioData,
  RevolutHeaders | undefined,
  (event: ChangeEvent<HTMLInputElement>) => any
] => {
  const [headers, setHeaders] = useState<RevolutHeaders>();
  const [data, setData] = useState<PortfolioData>({});

  const parse = (data: RevolutData[]): PortfolioData => {
    const buys: BrokerExtractBuyLine[] = [];
    const dividends: BrokerExtractDividendLine[] = [];

    data.forEach((line: RevolutData) => {
      if (line.Type === "BUY - MARKET") {
        buys.push({
          ticker: line.Ticker,
          currency: line.Currency,
          amount: cleanNumber(line["Total Amount"]),
          units: cleanNumber(line.Quantity),
          date: line.Date,
          broker: "revolut",
        });
      } else if (line.Type === "DIVIDEND") {
        dividends.push({
          ticker: line.Ticker,
          currency: line.Currency,
          amount: cleanNumber(line["Total Amount"]),
          date: line.Date,
          broker: "revolut",
        });
      }
    });

    return { buys, dividends };
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event?.target?.files?.[0]) return;

    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results: { data: RevolutData[] }) {
        const parsed = parse(results.data);

        setData(parsed);
      },
    });
  };

  return [data, headers, onFileChange];
};

export default useRevolut;
