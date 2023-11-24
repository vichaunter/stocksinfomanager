import { Ticker, TickerData, TickerHandler } from "@prisma/client";
import pc from "picocolors";
import database from "../services/database";
import { ScraperHandler, SortMode } from "../types";
import * as scraperHandlers from "../services/scraper/handlers";

export type TickerFlatData = {
  id: string;
  symbol: string;
  data: {
    price: string;
    dividend: string;
    dividendYield: string;
  };
};

class TickerModel {
  id: string; // dbId
  symbol: string;
  updatedAt: Date;
  tickerHandlers: TickerHandler[];
  tickerData: TickerData | null = {
    id: null,
    dividend: null,
    dividendYield: null,
    dividend5YearGrowhthRate: null,
    dividendFrequency: null,
    dividendPayoutRatio: null,
    dividendYearsGrowhth: null,
    lastExDate: null,
    lastPayoutDate: null,
    nextExDate: null,
    nextPayDate: null,
    price: null,
    tickerId: null,
    financials: "",
    dividends: "",
    historical: "",
  };

  constructor(ticker: Ticker) {
    Object.assign(this, ticker);
    this.updatedAt = new Date(ticker.updatedAt);

    return this;
  }

  invalidate() {
    this.tickerData = undefined;
  }

  getDefaultHandlers() {
    return this.getHandlersWithDefault().map((d) => ({
      id: d.name,
      tickerId: this.id,
      url: d.tickerUrl(this.symbol),
      enabled: true,
      updatedAt: new Date(),
    }));
  }

  async getData() {
    // if (!this.data) {
    //   this.data = await database.getTicker(this.symbol);
    // }

    return this.tickerData;
  }

  async getKeyData(key: string): Promise<string | undefined> {
    const data = await this.getData();
    if (!data || !key) return;

    const k = Object.keys(data).find((k) => key && data[k][key]);
    if (data[k]?.[key]) return data[k][key];

    return;
  }

  async getHandlers(): Promise<any[] | null> {
    return database.getTickerHandlers(this.id);
  }

  static async getTickersList(sort?: SortMode): Promise<string[]> {
    const tickers = await database.getTickersList();

    return tickers;
    // return sort ? this.sortByMTime(tickers, sort) : tickers;
  }

  static async getTickers(): Promise<TickerModel[] | null> {
    return database.getTickers();
  }

  static async getTickersFlatData(): Promise<TickerFlatData[] | null> {
    return database.getTickersFlatData();
  }

  // static sortByMTime(
  //   tickers: TickerModel["symbol"][],
  //   mode: SortMode = SortMode.desc
  // ): string[] {
  //   return tickers
  //     .map((st) => {
  //       const stats = fs.statSync(
  //         path.join(PATHS.tickerFile(path.basename(st, path.extname(st))))
  //       );
  //       return {
  //         ...stats,
  //         fileName: st,
  //       };
  //     })
  //     .sort((a, b) =>
  //       mode === SortMode.desc
  //         ? getUnixTime(a.mtime) - getUnixTime(b.mtime)
  //         : getUnixTime(a.mtime) + getUnixTime(b.mtime)
  //     )
  //     .map((file) => file.fileName);
  // }

  setData(data: TickerModel["tickerData"]) {
    this.tickerData = { ...this.tickerData, ...data };

    return this;
  }

  async saveTicker() {
    try {
      if (this.symbol && this.id && this.tickerData) {
        await database.saveTicker(this);
      }

      return true;
    } catch (e) {
      console.log(pc.bgRed(`Problem writing ticker [${this.symbol}]`), e);
    }

    return false;
  }

  static async addTicker({ symbol }): Promise<Ticker | void> {
    try {
      return await database.addTicker(symbol);
    } catch (err) {
      console.error(`Error adding ticker:`, err);
    }
  }

  getHandlersWithDefault(): ScraperHandler[] {
    return Object.values(scraperHandlers).filter((h) => h.defaultHandler);
  }
}

export default TickerModel;
