import { Ticker, TickerHandler } from "@prisma/client";
import TickerModel, { TickerFlatData } from "../../models/tickerModel";

export type DbGetTickersParams = {
  historical?: boolean;
  financials?: boolean;
  dividends?: boolean;
};

abstract class DatabaseHandler {
  abstract init(): void;

  abstract getTicker(
    ticker: TickerModel["symbol"]
  ): Promise<TickerModel | null>;

  abstract getTickerHandlers(tickerId: string): Promise<TickerHandler[] | null>;

  abstract getTickers(
    options?: Partial<DbGetTickersParams>
  ): Promise<TickerModel[] | null>;

  abstract getTickersFlatData(): Promise<TickerFlatData[] | null>;

  abstract getTickersList(): Promise<string[]>;

  abstract saveTicker(ticker: TickerModel): Promise<boolean>;

  abstract saveTickerError(ticker: TickerModel, error: any): Promise<boolean>;

  abstract addTicker(symbol: string): Promise<Ticker>;
}
export default DatabaseHandler;
