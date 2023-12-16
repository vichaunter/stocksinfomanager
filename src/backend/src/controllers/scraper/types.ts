import TickerModel from "../../models/tickerModel";

export type ScraperHandler<T> = {
  id: string;
  baseUrl: string;
  parseRaw?: (source: string) => Record<string, string>;
  test?: (symbol: string) => Promise<{} | void>;
  mode?: "standalone";
  rawToTicker?: (symbol: string, raw: T) => TickerModel;
};
