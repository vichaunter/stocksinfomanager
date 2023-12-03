import { Ticker, TickerData, TickerHandler } from "@prisma/client";
import pc from "picocolors";
import database from "../services/database";
import { ScraperHandler, SortMode } from "../types";
import * as scraperHandlers from "../services/scraper/handlers";

class TickerModel {
  id?: string; // dbId

  symbol: string;
  price?: null;

  dividendYield?: string;
  dividendAnnualPayout?: string;
  dividendPayoutRatio?: string;
  dividend5YearGrowhthRate?: string;
  dividendYearsGrowhth?: string;
  dividendAmount?: string;
  dividendExDate?: null;
  dividendPayoutDate?: null;
  dividendRecordDate?: null;
  dividendDeclareDate?: null;
  dividendFrequency?: null;
  nextExDate?: null;
  nextPayDate?: null;
  //sector
  //industria

  error?: any;
  updatedAt?: Date;

  handlers: TickerHandler[] = [];

  constructor(ticker: Omit<Ticker, "id">) {
    Object.assign(this, ticker);
    this.updatedAt = new Date(ticker.updatedAt);

    return this;
  }

  invalidate() {
    console.warn("invalidate not implemented...");
    // this.tickerData = undefined;
  }

  getRawData() {
    //TODO: return the raw data for given ticker
    // raw?: {
    //   financials: "";
    //   dividends: "";
    //   historical: "";
    // };
    return {};
  }

  getDefaultHandlers() {
    console.log("getDefaultHandlers...");
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

    return {
      ...this,
      financials: undefined,
      dividends: undefined,
      historical: undefined,
    };
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

  setData(data: TickerModel) {
    Object.assign(this, {
      ...this,
      ...data,
    });

    return this;
  }

  async saveError(error: any) {
    this.error = error;
    await database.saveTicker(this);
  }

  async saveTicker() {
    try {
      if (this.symbol) {
        if (!this.id) this.id = this.symbol;
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
    console.log({ scraperHandlers });
    return Object.values(scraperHandlers).filter((h) => h.defaultHandler);
  }
}

export default TickerModel;
