import { Ticker, TickerHandler } from "@prisma/client";
import TickerModel, { TickerFlatData } from "../../models/tickerModel";

abstract class DatabaseHandler {
  abstract init(): void;

  abstract getTicker(ticker: TickerModel["symbol"]): Promise<Ticker | null>;

  abstract getTickerHandlers(tickerId: string): Promise<TickerHandler[] | null>;

  abstract getTickers(): Promise<TickerModel[] | null>;

  abstract getTickersFlatData(): Promise<TickerFlatData[] | null>;

  abstract getTickersList(): Promise<string[]>;

  abstract saveTicker(ticker: TickerModel): Promise<boolean>;

  abstract addTicker(symbol: string): Promise<Ticker>;
}
export default DatabaseHandler;
