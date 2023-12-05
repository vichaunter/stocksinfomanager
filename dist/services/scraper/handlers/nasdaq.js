"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const scraperError_1 = __importDefault(require("../../../errors/scraperError"));
const tickerModel_1 = __importDefault(require("../../../models/tickerModel"));
const utils_1 = require("../../../utils");
const database_1 = __importDefault(require("../../database"));
const name = "nasdaq";
const baseUrl = `https://www.nasdaq.com`;
const apiUrl = `https://api.nasdaq.com/api`;
// https://api.nasdaq.com/api/quote/TEF/historical?assetclass=stocks&fromdate=1900-01-01&limit=99999&todate=2023-11-12
// https://api.nasdaq.com/api/quote/TEF/dividends?assetclass=stocks
// https://api.nasdaq.com/api/company/TEF/financials?frequency=1
const getUrls = (symbol) => ({
    main: `https://api.nasdaq.com/api/quote/${symbol}/info?assetclass=stocks`,
    financials: `${apiUrl}/company/${symbol}/financials?frequency=1`,
    dividends: `${apiUrl}/quote/${symbol}/dividends?assetclass=stocks`,
    historical: `${apiUrl}/quote/${symbol}/historical?assetclass=stocks&fromdate=1900-01-01&limit=99999&todate=${(0, dayjs_1.default)(new Date()).format("YYYY-MM-DD")}`,
});
const fetchData = async ({ url, item, }) => {
    const urls = item ? getUrls(item.symbol) : { unknown: url };
    const data = {};
    const endpoints = Object.keys(urls);
    for (const endpoint of endpoints) {
        data[endpoint] = await fetch(urls[endpoint])
            .then((res) => res.json())
            .then((data) => data?.data);
        await (0, utils_1.sleep)(1000);
    }
    database_1.default.saveRaw(name, item.symbol, data);
    return data;
};
const rawToTicker = (symbol, raw) => {
    let model = new tickerModel_1.default();
    model.symbol = symbol;
    const price = raw.main?.primaryData.lastSalePrice;
    if (price) {
        model.setPrice(price);
    }
    const dividendYield = raw.dividends?.yield;
    if (dividendYield)
        model.setDividendYield(dividendYield);
    const dividendAnnualPayout = raw.dividends?.annualizedDividend;
    if (dividendAnnualPayout)
        model.setDividendAnnualPayout(dividendAnnualPayout);
    const dividendPayoutRatio = raw.dividends?.payoutRatio;
    if (dividendPayoutRatio)
        model.setDividendPayoutRatio(dividendPayoutRatio);
    const dividendDates = raw.dividends?.dividends.rows?.[0];
    if (dividendDates) {
        model.setDividendExDate(dividendDates.exOrEffDate);
        model.setDividendPayoutDate(dividendDates.paymentDate);
        model.setDividendRecordDate(dividendDates.recordDate);
        model.setDividendDeclareDate(dividendDates.declarationDate);
        //TODO: determine when the stock pay dividends
    }
    else {
        model.setPayDividend(false);
    }
    const exDates = raw?.dividends?.dividends?.rows?.map((dividend) => new Date((0, utils_1.formatDate)(dividend.exOrEffDate)));
    if (exDates?.length) {
        const frequency = (0, utils_1.getDividendFrequency)(exDates);
        model.setDividendFrequency(frequency);
    }
    return model;
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
    rawToTicker,
};
exports.default = scraperHandler;
