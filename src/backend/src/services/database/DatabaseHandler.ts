import { Ticker, TickerHandler } from "@prisma/client";
import { ApiTickersArgs } from "../../api/resolvers";
import TickerModel from "../../models/tickerModel";

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

  abstract getRawTicker(
    symbol: TickerModel["symbol"]
  ): Promise<Record<string, any> | null>;

  abstract getTickerHandlers(tickerId: string): Promise<TickerHandler[] | null>;

  abstract getTickers(args?: ApiTickersArgs): Promise<TickerModel[] | null>;

  abstract getTickersList(): Promise<string[]>;

  abstract saveTicker(ticker: TickerModel): Promise<boolean>;

  abstract saveTickerError(ticker: TickerModel, error: any): Promise<boolean>;

  abstract addTicker(symbol: string): Promise<Ticker>;

  abstract saveRaw(handler: string, symbol: string, data: any): void;
}
export default DatabaseHandler;
