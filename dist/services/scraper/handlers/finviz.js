"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const picocolors_1 = __importDefault(require("picocolors"));
const scraperError_1 = __importDefault(require("../../../errors/scraperError"));
const utils_1 = require("../../../utils");
const browser_1 = require("../../browser");
const name = "finviz";
const baseUrl = `https://finviz.com`;
const validKeys = ["price", "dividend", "dividendYield"];
const dataKeysCamelized = [
    "index",
    "pE",
    "ePSTtm",
    "insiderOwn",
    "shsOutstand",
    "perfWeek",
    "marketCap",
    "forwardPE",
    "ePSNextY",
    "insiderTrans",
    "shsFloat",
    "perfMonth",
    "income",
    "pEG",
    "ePSNextQ",
    "instOwn",
    "shortFloatRatio",
    "perfQuarter",
    "sales",
    "pS",
    "ePSThisY",
    "instTrans",
    "shortInterest",
    "perfHalfY",
    "booksh",
    "pB",
    "ePSNextY",
    "rOA",
    "targetPrice",
    "perfYear",
    "cashsh",
    "pC",
    "ePSNextY",
    "rOE",
    "wRange",
    "perfYTD",
    "dividend",
    "pFCF",
    "ePSPastY",
    "rOI",
    "wHigh",
    "beta",
    "dividendYield",
    "quickRatio",
    "salesPastY",
    "grossMargin",
    "wLow",
    "aTR",
    "employees",
    "currentRatio",
    "salesQQ",
    "operMargin",
    "rSI",
    "volatility",
    "optionable",
    "debtEq",
    "ePSQQ",
    "profitMargin",
    "relVolume",
    "prevClose",
    "shortable",
    "lTDebtEq",
    "earnings",
    "payout",
    "avgVolume",
    "price",
    "recom",
    "sMA",
    "sMA",
    "sMA",
    "volume",
    "change",
];
const parse = (source) => {
    if (!source) {
        console.log(`${picocolors_1.default.yellow("Missing source skipping...")}`);
        return;
    }
    const $ = (0, cheerio_1.load)(source);
    const rows = [];
    const mapped = {};
    const data = $(".screener_snapshot-table-wrapper table  tr");
    if (!data.length)
        throw new scraperError_1.default(`Invalid handler: Data not found`);
    data.each((i, row) => {
        const rowData = [];
        $(row)
            .find("td")
            .each((j, cell) => {
            rowData.push($(cell).text().trim());
        });
        for (let i = 0; i < rowData.length; i += 2) {
            const key = rowData[i] === "Dividend %" ? "DividendYield" : rowData[i];
            const camelKey = (0, utils_1.camelizeText)(key);
            if (!validKeys.includes(camelKey))
                continue;
            mapped[camelKey] = rowData[i + 1];
        }
        rows.push(rowData);
    });
    console.log(mapped);
    return mapped;
};
const fetchData = async ({ item }) => {
    const url = tickerUrl(item.symbol);
    const html = await browser_1.browser.getPageSourceHtml(url);
    return parse(html);
};
const tickerUrl = (ticker) => `${baseUrl}/quote.ashx?t=${ticker}`;
const defaultHandler = async (symbol) => {
    const url = tickerUrl(symbol);
    const html = await browser_1.browser.getPageSourceHtml(url);
    try {
        parse(html);
        return url;
    }
    catch (e) {
        throw new scraperError_1.default(`Finviz default handler for symbol [${symbol}] failed parsing`);
    }
    return;
};
const scraperHandler = {
    name,
    baseUrl,
    tickerUrl,
    defaultHandler,
    fetch: fetchData,
};
exports.default = scraperHandler;
