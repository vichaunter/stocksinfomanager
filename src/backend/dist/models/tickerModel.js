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
const utils_1 = require("../utils");
const dayjs_1 = __importDefault(require("dayjs"));
const dev_1 = __importDefault(require("../dev"));
class TickerModel {
    constructor(ticker) {
        this.handlers = [];
        if (ticker) {
            Object.assign(this, ticker);
            if (ticker.symbol && !this.id) {
                this.id = ticker.symbol;
            }
        }
        return this;
    }
    setPrice(value) {
        const parsed = (0, utils_1.cleanNumber)(`${value}`);
        if (isNaN(parsed))
            return;
        this.price = parsed;
        return this;
    }
    setName(value) {
        this.name = value;
    }
    setPayDividend(value) {
        this.payDividend = value;
    }
    setDividendYield(value) {
        const parsed = (0, utils_1.cleanNumber)(`${value}`);
        if (isNaN(parsed))
            return;
        this.dividendYield = parsed;
        return this;
    }
    setDividendYearsGrowhth(value) {
        const parsed = (0, utils_1.cleanNumber)(`${value}`);
        if (isNaN(parsed))
            return;
        this.dividendYearsGrowhth = parsed;
        return this;
    }
    setDividend5YearGrowhthRate(value) {
        const parsed = (0, utils_1.cleanNumber)(`${value}`);
        if (isNaN(parsed))
            return;
        this.dividend5YearGrowhthRate = parsed;
        return this;
    }
    setDividendAnnualPayout(value) {
        const parsed = (0, utils_1.cleanNumber)(`${value}`);
        if (isNaN(parsed))
            return;
        this.dividendAnnualPayout = parsed;
        return this;
    }
    setDividendPayoutRatio(value) {
        const parsed = (0, utils_1.cleanNumber)(`${value}`);
        if (isNaN(parsed))
            return;
        this.dividendPayoutRatio = parsed;
        return this;
    }
    setDividendAmount(value) {
        const parsed = (0, utils_1.cleanNumber)(`${value}`);
        if (isNaN(parsed))
            return;
        this.dividendAmount = parsed;
        return this;
    }
    setDividendExDate(value) {
        const parsed = (0, utils_1.formatDate)(value);
        if (!parsed)
            return;
        this.dividendExDate = parsed;
        return this;
    }
    setDividendPayoutDate(value) {
        const parsed = (0, utils_1.formatDate)(value);
        if (!parsed)
            return;
        this.dividendPayoutDate = parsed;
        return this;
    }
    setDividendRecordDate(value) {
        const parsed = (0, utils_1.formatDate)(value);
        if (!parsed)
            return;
        this.dividendRecordDate = parsed;
        return this;
    }
    setDividendDeclareDate(value) {
        const parsed = (0, utils_1.formatDate)(value);
        if (!parsed)
            return;
        this.dividendDeclareDate = parsed;
        return this;
    }
    setDividendFrequency(value) {
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
        dev_1.default.log("getDefaultHandlers...");
        return this.getHandlersWithDefault().map((d) => ({
            id: d.name,
            tickerId: this.id,
            url: d.tickerUrl(this.symbol),
            enabled: true,
            updatedAt: (0, utils_1.formatDate)((0, dayjs_1.default)()),
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
        Object.assign(this, {
            ...this,
            ...data,
        });
        return this;
    }
    async saveError(error) {
        this.error = error;
        await database_1.default.saveTicker(this);
    }
    async persist() {
        this.saveTicker();
    }
    async saveTicker() {
        try {
            if (this.symbol) {
                if (!this.id)
                    this.id = this.symbol;
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
        dev_1.default.log({ scraperHandlers });
        return Object.values(scraperHandlers).filter((h) => h.defaultHandler);
    }
}
exports.default = TickerModel;
