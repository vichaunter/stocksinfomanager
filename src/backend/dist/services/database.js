"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const picocolors_1 = __importDefault(require("picocolors"));
const index_1 = require("./database/index");
const dayjs_1 = __importDefault(require("dayjs"));
class Database {
    constructor(handler) {
        this.handler = handler;
    }
    init() {
        console.log(picocolors_1.default.blue("db init"));
        this.handler.init();
    }
    async getTicker(ticker) {
        return this.handler.getTicker(ticker);
    }
    async getRawTicker(symbol) {
        return this.handler.getRawTicker(symbol);
    }
    async getNextTickerToUpdate() {
        const tickers = await this.getTickers();
        const nextTicker = tickers
            .filter((t) => !t.error)
            .sort((a, b) => (0, dayjs_1.default)(a.updatedAt).unix() - (0, dayjs_1.default)(b.updatedAt).unix())?.[0];
        return nextTicker;
    }
    async getTickers(args) {
        return this.handler.getTickers(args);
    }
    async getTickersList() {
        return this.handler.getTickersList();
    }
    async getTickerHandlers(tickerId) {
        return (await this.handler.getTickerHandlers(tickerId));
    }
    async saveTicker(ticker) {
        return this.handler.saveTicker(ticker);
    }
    async saveTickerError(ticker, error) {
        return this.handler.saveTickerError(ticker, error);
    }
    async addTicker(symbol) {
        return this.handler.addTicker(symbol);
    }
    saveRaw(handler, symbol, data) {
        this.handler.saveRaw(handler, symbol, data);
    }
}
const database = new Database(new index_1.handlers[process.env.DB_HANDLER]());
exports.default = database;
