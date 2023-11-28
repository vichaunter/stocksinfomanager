import { Ticker, TickerHandler } from "@prisma/client";
import pc from "picocolors";
import TickerModel from "../models/tickerModel";
import DatabaseHandler from "./database/DatabaseHandler";
import { handlers } from "./database/index";

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

  async getTickers(): Promise<TickerModel[] | null> {
    return this.handler.getTickers();
  }

  async getTickersFlatData() {
    return this.handler.getTickersFlatData();
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
}

const database = new Database(new handlers[process.env.DB_HANDLER]());

export default database;
