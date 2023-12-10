import { Ticker, TickerData, TickerHandler } from "@prisma/client";
import pc from "picocolors";
import database from "../services/database";
import { HandlersData, ScraperHandler, SortMode } from "../types";
import * as scraperHandlers from "../services/scraper/handlers";
import { cleanNumber, formatDate } from "../utils";
import dayjs from "dayjs";
import dev from "../dev";

class TickerModel {
  id?: string; // dbId

  symbol: string;
  price?: number;
  name?: string;

  payDividend?: boolean;
  dividendYield?: number;
  dividendAnnualPayout?: number;
  dividendPayoutRatio?: number;
  dividend5YearGrowhthRate?: number;
  dividendYearsGrowhth?: number;
  dividendAmount?: number;
  dividendExDate?: string;
  dividendPayoutDate?: string;
  dividendRecordDate?: string;
  dividendDeclareDate?: string;
  dividendFrequency?: number;
  nextExDate?: null;
  nextPayDate?: null;
  //sector
  //industria

  error?: any;
  updatedAt?: string;

  handlers: TickerHandler[] = [];

  constructor(ticker?: Omit<Ticker, "id">) {
    if (ticker) {
      Object.assign(this, ticker);
      if (ticker.symbol && !this.id) {
        this.id = ticker.symbol;
      }
    }

    return this;
  }

  setPrice(value: number | string) {
    const parsed = cleanNumber(`${value}`);
    if (isNaN(parsed)) return;

    this.price = parsed;

    return this;
  }

  setName(value: string) {
    this.name = value;
  }

  setPayDividend(value: boolean) {
    this.payDividend = value;
  }

  setDividendYield(value: number | string) {
    const parsed = cleanNumber(`${value}`);
    if (isNaN(parsed)) return;

    this.dividendYield = parsed;

    return this;
  }

  setDividendYearsGrowhth(value: number | string) {
    const parsed = cleanNumber(`${value}`);
    if (isNaN(parsed)) return;

    this.dividendYearsGrowhth = parsed;

    return this;
  }

  setDividend5YearGrowhthRate(value: number | string) {
    const parsed = cleanNumber(`${value}`);
    if (isNaN(parsed)) return;

    this.dividend5YearGrowhthRate = parsed;

    return this;
  }

  setDividendAnnualPayout(value: number | string) {
    const parsed = cleanNumber(`${value}`);
    if (isNaN(parsed)) return;

    this.dividendAnnualPayout = parsed;

    return this;
  }

  setDividendPayoutRatio(value: number | string) {
    const parsed = cleanNumber(`${value}`);
    if (isNaN(parsed)) return;

    this.dividendPayoutRatio = parsed;

    return this;
  }
  setDividendAmount(value: number | string) {
    const parsed = cleanNumber(`${value}`);
    if (isNaN(parsed)) return;

    this.dividendAmount = parsed;

    return this;
  }

  setDividendExDate(value: string) {
    const parsed = formatDate(value);
    if (!parsed) return;

    this.dividendExDate = parsed;

    return this;
  }

  setDividendPayoutDate(value: string) {
    const parsed = formatDate(value);
    if (!parsed) return;

    this.dividendPayoutDate = parsed;

    return this;
  }
  setDividendRecordDate(value: string) {
    const parsed = formatDate(value);
    if (!parsed) return;

    this.dividendRecordDate = parsed;

    return this;
  }
  setDividendDeclareDate(value: string) {
    const parsed = formatDate(value);
    if (!parsed) return;

    this.dividendDeclareDate = parsed;

    return this;
  }

  setDividendFrequency(value: number) {
    this.dividendFrequency = value;
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
    dev.log("getDefaultHandlers...");
    return this.getHandlersWithDefault().map((d) => ({
      id: d.name,
      tickerId: this.id,
      url: d.tickerUrl(this.symbol),
      enabled: true,
      updatedAt: formatDate(dayjs()),
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

  async persist() {
    this.saveTicker();
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

  getHandlersWithDefault(): ScraperHandler<HandlersData>[] {
    dev.log({ scraperHandlers });
    return Object.values(scraperHandlers).filter((h) => h.defaultHandler);
  }
}

export default TickerModel;
