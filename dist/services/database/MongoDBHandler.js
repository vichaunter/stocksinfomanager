"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const picocolors_1 = __importDefault(require("picocolors"));
const tickerModel_1 = __importDefault(require("../../models/tickerModel"));
const DatabaseHandler_1 = __importDefault(require("./DatabaseHandler"));
class MongoDBDatabaseHandler extends DatabaseHandler_1.default {
    getRawTicker(symbol) {
        throw new Error("Method not implemented.");
    }
    async init() {
        console.log("Init mongoDb");
        this.prisma = new client_1.PrismaClient(process.env.DEBUG && {
            log: ["query", "info", "warn", "error"],
        });
        return this;
    }
    async getTicker(ticker) {
        //mongodb get one ticker by id
        const result = await this.prisma.ticker.findFirst({
            where: {
                symbol: ticker,
            },
            include: {
                tickerData: true,
                tickerHandlers: true,
            },
        });
        return result ? new tickerModel_1.default(result) : null;
    }
    async getTickerHandlers(tickerId) {
        const result = await this.prisma.tickerHandler.findMany({
            where: {
                tickerId: tickerId,
            },
        });
        return result;
    }
    async getTickers({ historical = false, financials = false, dividends = false, } = {}) {
        const result = await this.prisma.ticker.findMany({
            include: {
                tickerData: true,
                tickerHandlers: true,
            },
        });
        return result.map((t) => new tickerModel_1.default(t));
    }
    // async getTickersFlatData(): Promise<TickerFlatData[] | null> {
    //   const result = await this.getTickers();
    //   const flat = result.map((item) => {
    //     let data;
    //     if (item.tickerData) {
    //       const { id, tickerId, ...tickerData } = item.tickerData;
    //       data = tickerData;
    //     }
    //     return {
    //       id: item.id,
    //       symbol: item.symbol,
    //       error: item.error,
    //       data,
    //     };
    //   });
    //   return flat;
    // }
    async getTickersList() {
        //mongodb ticker list table
        const result = await this.prisma.ticker.findMany();
        return result.map((ticker) => ticker.symbol);
    }
    async saveHandlers(ticker) {
        if (ticker.handlers.length < 1)
            return true;
        try {
            for (const handler of ticker.handlers) {
                await this.prisma.tickerHandler.upsert({
                    where: { id: handler.id },
                    update: {
                        url: handler.url,
                    },
                    create: {
                        url: handler.url,
                        enabled: handler.enabled,
                        ticker: { connect: ticker.id },
                    },
                });
            }
            return true;
        }
        catch (e) {
            console.log(`ERROR Saving handlers for [${ticker.symbol}]:`, picocolors_1.default.red(e));
        }
        return false;
    }
    async saveTickerError(ticker, error) {
        try {
            if (!ticker.id)
                throw Error(`[saveTickerError] Invalid ticker not in database: ${ticker.symbol}, Skipping...`);
            const update = this.prisma.ticker.update({
                where: { id: ticker.id },
                data: {
                    updatedAt: new Date(),
                    error,
                },
            });
            await this.saveHandlers(ticker);
            this.prisma.$transaction([update]);
            return true;
        }
        catch (e) {
            console.log(picocolors_1.default.red(e));
            return false;
        }
    }
    async saveTicker(ticker) {
        try {
            if (!ticker.price)
                throw Error(`Price missing for ticker ${ticker.symbol} Skipping...`);
            if (Object.keys(ticker).length < 1)
                throw Error(picocolors_1.default.yellow(`Data was not provider to save [${ticker}]`));
            const { id, ...tickerDataWithoutId } = ticker;
            process.env.DEBUG && console.log("tickerData:", ticker);
            const update = this.prisma.ticker.update({
                where: { id: ticker.id },
                data: {
                    updatedAt: new Date(),
                    // tickerData: {
                    //   upsert: {
                    //     where: { tickerId: ticker.id },
                    //     update: tickerDataWithoutId,
                    //     create: tickerDataWithoutId,
                    //   },
                    // },
                },
            });
            await this.saveHandlers(ticker);
            this.prisma.$transaction([update]);
            return true;
        }
        catch (e) {
            console.log(picocolors_1.default.red(e));
            return false;
        }
    }
    async addTicker(symbol) {
        let ticker = await this.prisma.ticker.findUnique({
            where: {
                symbol,
            },
        });
        if (!ticker) {
            ticker = await this.prisma.ticker.create({
                data: {
                    symbol,
                },
            });
        }
        return ticker;
    }
    saveRaw(handler, symbol, data) {
        console.warn("saveRaw not implemented...");
    }
}
exports.default = MongoDBDatabaseHandler;
