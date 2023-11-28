"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const picocolors_1 = __importDefault(require("picocolors"));
const database_1 = __importDefault(require("../services/database"));
const scraperHandlers = __importStar(require("../services/scraper/handlers"));
class TickerModel {
    constructor(ticker) {
        this.tickerData = {
            id: null,
            dividend: null,
            dividendYield: null,
            dividendAnnualized: null,
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
    async getKeyData(key) {
        const data = await this.getData();
        if (!data || !key)
            return;
        const k = Object.keys(data).find((k) => key && data[k][key]);
        if (data[k]?.[key])
            return data[k][key];
        return;
    }
    async getHandlers() {
        return database_1.default.getTickerHandlers(this.id);
    }
    static async getTickersList(sort) {
        const tickers = await database_1.default.getTickersList();
        return tickers;
        // return sort ? this.sortByMTime(tickers, sort) : tickers;
    }
    static async getTickers() {
        return database_1.default.getTickers();
    }
    static async getTickersFlatData() {
        return database_1.default.getTickersFlatData();
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
    setData(data) {
        this.tickerData = { ...this.tickerData, ...data };
        return this;
    }
    async saveError(error) {
        this.error = error;
        await database_1.default.saveTicker(this);
    }
    async saveTicker() {
        try {
            if (this.symbol && this.id && this.tickerData) {
                await database_1.default.saveTicker(this);
            }
            return true;
        }
        catch (e) {
            console.log(picocolors_1.default.bgRed(`Problem writing ticker [${this.symbol}]`), e);
        }
        return false;
    }
    static async addTicker({ symbol }) {
        try {
            return await database_1.default.addTicker(symbol);
        }
        catch (err) {
            console.error(`Error adding ticker:`, err);
        }
    }
    getHandlersWithDefault() {
        return Object.values(scraperHandlers).filter((h) => h.defaultHandler);
    }
}
exports.default = TickerModel;
