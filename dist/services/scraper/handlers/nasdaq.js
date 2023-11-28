"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const scraperError_1 = __importDefault(require("../../../errors/scraperError"));
const utils_1 = require("../../../utils");
const name = "nasdaq";
const baseUrl = `https://www.nasdaq.com`;
const apiUrl = `https://api.nasdaq.com/api`;
// https://api.nasdaq.com/api/quote/TEF/historical?assetclass=stocks&fromdate=1900-01-01&limit=99999&todate=2023-11-12
// https://api.nasdaq.com/api/quote/TEF/dividends?assetclass=stocks
// https://api.nasdaq.com/api/company/TEF/financials?frequency=1
const getUrls = (symbol) => ({
    financials: `${apiUrl}/company/${symbol}/financials?frequency=1`,
    dividends: `${apiUrl}/quote/${symbol}/dividends?assetclass=stocks`,
    historical: `${apiUrl}/quote/${symbol}/historical?assetclass=stocks&fromdate=1900-01-01&limit=99999&todate=${(0, dayjs_1.default)(new Date()).format("YYYY-MM-DD")}`,
});
const fetchData = async ({ url, item, }) => {
    const urls = item ? getUrls(item.symbol) : { unknown: url };
    const data = {};
    const endpoints = Object.keys(urls);
    for (const endpoint of endpoints) {
        console.log(urls[endpoint]);
        data[endpoint] = await fetch(urls[endpoint])
            .then((res) => res.json())
            .then((data) => data?.data);
        await (0, utils_1.sleep)(1000);
    }
    return data;
};
const tickerUrl = (ticker) => `${apiUrl}/company/${ticker}/financials?frequency=1`;
const defaultHandler = async (symbol) => {
    const url = tickerUrl(symbol);
    try {
        fetchData({ url });
        return url;
    }
    catch (e) {
        throw new scraperError_1.default(`Finviz default handler for symbol [${symbol}] failed parsing`);
    }
};
const scraperHandler = {
    name,
    baseUrl,
    tickerUrl,
    fetch: fetchData,
    defaultHandler,
};
exports.default = scraperHandler;
