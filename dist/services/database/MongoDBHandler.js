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
        return new tickerModel_1.default(result);
    }
    async getTickerHandlers(tickerId) {
        const result = await this.prisma.tickerHandler.findMany({
            where: {
                tickerId: tickerId,
            },
        });
        return result;
    }
    async getTickers() {
        const result = await this.prisma.ticker.findMany({
            include: {
                tickerData: true,
                tickerHandlers: true,
            },
        });
        return result.map((t) => new tickerModel_1.default(t));
    }
    async getTickersFlatData() {
        const result = await this.getTickers();
        const flat = result.map((item) => {
            let data;
            if (item.tickerData) {
                const { id, tickerId, ...tickerData } = item.tickerData;
                data = tickerData;
            }
            return {
                id: item.id,
                symbol: item.symbol,
                data,
            };
        });
        return flat;
    }
    async getTickersList() {
        //mongodb ticker list table
        const result = await this.prisma.ticker.findMany();
        return result.map((ticker) => ticker.symbol);
    }
    async saveHandlers(ticker) {
        if (ticker.tickerHandlers.length < 1)
            return true;
        try {
            for (const handler of ticker.tickerHandlers) {
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
    async saveTicker(ticker) {
        try {
            if (!ticker.tickerData.price)
                throw Error(`Price missing for ticker ${ticker.symbol} Skipping...`);
            if (Object.keys(ticker.tickerData).length < 1)
                throw Error(picocolors_1.default.yellow(`Data was not provider to save [${ticker}]`));
            const { id, tickerId, ...tickerDataWithoutId } = ticker.tickerData;
            process.env.DEBUG && console.log("tickerData:", ticker.tickerData);
            const update = this.prisma.ticker.update({
                where: { id: ticker.id },
                data: {
                    updatedAt: new Date(),
                    tickerData: {
                        upsert: {
                            where: { tickerId: ticker.id },
                            update: tickerDataWithoutId,
                            create: tickerDataWithoutId,
                        },
                    },
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
}
exports.default = MongoDBDatabaseHandler;
