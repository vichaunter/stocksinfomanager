import { Ticker, TickerHandler } from "@prisma/client";
import pc from "picocolors";
import TickerModel from "../models/tickerModel";
import DatabaseHandler from "./database/DatabaseHandler";
import { handlers } from "./database/index";
import dayjs from "dayjs";
import { ApiTickersArgs } from "../api/resolvers";

class Database {
  handler: DatabaseHandler;

  constructor(handler: DatabaseHandler) {
    this.handler = handler;
  }

  init(): void {
    console.log(pc.blue("db init"));
    this.handler.init();
  }

  async getTicker(ticker: TickerModel["symbol"]): Promise<TickerModel | null> {
    return this.handler.getTicker(ticker);
  }

  async getRawTicker(
    symbol: TickerModel["symbol"]
  ): Promise<Record<string, any> | null> {
    return this.handler.getRawTicker(symbol);
  }

  async getNextTickerToUpdate() {
    const tickers = await this.getTickers();
    const nextTicker = tickers
      .filter((t) => !t.error)
      .sort(
        (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix()
      )?.[0];

    return nextTicker;
  }

  async getTickers(args?: ApiTickersArgs): Promise<TickerModel[] | null> {
    return this.handler.getTickers(args);
  }

  async getTickersList(): Promise<string[]> {
    return this.handler.getTickersList();
  }

  async getTickerHandlers(tickerId: string): Promise<TickerHandler[]> {
    return (await this.handler.getTickerHandlers(tickerId)) as TickerHandler[];
  }

  async saveTicker(ticker: TickerModel): Promise<boolean> {
    return this.handler.saveTicker(ticker);
  }

  async saveTickerError(ticker: TickerModel, error: any): Promise<boolean> {
    return this.handler.saveTickerError(ticker, error);
  }

  async addTicker(symbol: string): Promise<Ticker> {
    return this.handler.addTicker(symbol);
  }

  saveRaw(handler: string, symbol: string, data: any): void {
    this.handler.saveRaw(handler, symbol, data);
  }
}

const database = new Database(
  new handlers[process.env.DB_HANDLER ?? "filesystem"]()
);

export default database;
