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
const tickerModel_1 = __importDefault(require("../models/tickerModel"));
const browser_1 = require("./browser");
const database_1 = __importDefault(require("./database"));
const scraperHandlers = __importStar(require("./scraper/handlers"));
const queue = [];
const getTickerData = async ({ item, url, parser }) => {
    try {
        let parsed;
        if (parser.mode === "standalone") {
            const source = await browser_1.browser.getPageSourceHtml(url);
            parsed = parser.parse(source);
        }
        else {
            parsed = await parser.fetch({ item, url });
        }
        console.log(picocolors_1.default.blue(parser.name), picocolors_1.default.green(url));
        console.log("parsed:", item.symbol);
        console.log(``);
        return parsed;
    }
    catch (e) {
        console.log("Error fetching:", item.symbol, url);
        console.log(e);
    }
};
const updateTicker = async (item) => {
    try {
        process.env.DEBUG && console.log("updateTicker_handlers:", item.handlers);
        const promises = [...(item.handlers || []), ...item.getDefaultHandlers()]
            .filter((h) => h.enabled) //remove disabled handlers
            .map((handler) => {
            return new Promise(async (resolve, reject) => {
                const parser = scraperHandlers?.[handler.id];
                if (!parser || !handler.url)
                    return reject(new Error(`Missing parser or handler [${handler.id}] url for ${item.symbol}`));
                try {
                    const data = await getTickerData({
                        item,
                        url: handler.url,
                        parser,
                    });
                    if (data) {
                        return resolve({ key: parser.name, data });
                    }
                    throw Error("Data not found");
                }
                catch (error) {
                    await database_1.default.saveTickerError(item, {
                        name: error.name,
                        message: error.message,
                    });
                    return reject(error);
                }
            });
        });
        const response = await Promise.all(promises.flat());
        if (process.env.DEV)
            return response;
        response.forEach((parsed) => {
            parsed.data && item.setData(parsed.data);
        });
        const saved = await item.saveTicker();
        if (saved) {
            console.log(picocolors_1.default.green(`${item.symbol} saved`));
        }
        else {
            console.log(picocolors_1.default.red(`${item.symbol} error saving`));
        }
        console.log(`☰☰☰`);
    }
    catch (error) {
        console.log(picocolors_1.default.bgYellow("!! Skipping ticker"), { error });
    }
    return undefined;
};
/**
 * Adds a new ticker to be retrieved
 */
const addTickerToUpdate = async (ticker) => {
    if (queue.find((q) => q.symbol === ticker.symbol))
        return;
    const dbTicker = database_1.default.getTicker(ticker.symbol);
    if (!dbTicker) {
        queue.unshift(ticker);
    }
    else {
        queue.push(ticker);
    }
};
/**
 * Infinite loop that updates all the existing tickers that we
 * know, usually already stored ones or new added by api call
 */
const tickerUpdaterService = async () => {
    // get ticker from the queue removing it
    const nextTicker = queue.shift();
    if (nextTicker?.symbol) {
        console.log(``);
        console.log(picocolors_1.default.white(`----`));
        console.log(picocolors_1.default.blue(`let's update the ticker: ${nextTicker.symbol}`));
        console.log(picocolors_1.default.white(`----`));
        await updateTicker(nextTicker);
        // let's do one each xx seconds
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true);
            }, (Math.random() * 5 + 10) * 1000);
        });
        // add it again at the end of the queue
        addTickerToUpdate(nextTicker);
        tickerUpdaterService();
    }
    else {
        console.log(picocolors_1.default.yellow(`${picocolors_1.default.red("!!")}This is an incomplete ticker... removed from queue`));
        setTimeout(() => {
            tickerUpdaterService();
        }, 60 * 1000);
    }
};
/**
 * Load current stored tickers to be updated from the filesystem
 */
const loadStoredTickers = async () => {
    const tickers = await tickerModel_1.default.getTickers();
    //pick older updated first
    tickers.sort((a, b) => a.updatedAt - b.updatedAt);
    const tickersWithoutErrors = tickers.filter((t) => !t.price && !t.error);
    const validTickers = tickers.filter((t) => t.price && !t.error);
    console.log("TICKERS", tickersWithoutErrors.length, validTickers.length);
    [...tickersWithoutErrors, ...validTickers].forEach((ticker) => {
        queue.push(ticker);
    });
    // console.log(queue);
    return queue;
};
exports.default = {
    addTickerToUpdate,
    tickerUpdaterService,
    loadStoredTickers,
    updateTicker,
};
