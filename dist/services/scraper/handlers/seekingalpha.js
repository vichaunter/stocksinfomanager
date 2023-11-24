"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const picocolors_1 = __importDefault(require("picocolors"));
const scraperError_1 = __importDefault(require("../../../errors/scraperError"));
const browser_1 = require("../../browser");
const name = "seekingalpha";
const baseUrl = `https://seekingalpha.com`;
const keyMap = {
    "Payout Ratio": "dividendPayoutRatio",
    "5 Year Growth Rate": "dividend5YearGrowhthRate",
    "Dividend Growth": "dividendYearsGrowhth",
    "Ex-Div Date": "lastExDate",
    "Payout Date": "lastPayoutDate",
    "Div Frequency": "dividendFrequency"
};
const validKeys = [
    "price", "dividend", "dividendYield"
];
const parse = (source) => {
    if (!source) {
        console.log(`${picocolors_1.default.yellow("Missing source skipping...")}`);
        return;
    }
    const $ = (0, cheerio_1.load)(source);
    const data = $(`div[data-test-id="scorecard-section-content"]`);
    const extracted = {};
    data.each((i, block) => {
        $(block).find("div").each((y, row) => {
            const rowData = $(row).find("div");
            const label = $(rowData[0]).text();
            const value = $(rowData[1]).text();
            if (value && label && keyMap[label]) {
                extracted[keyMap[label]] = value;
            }
        });
    });
    return extracted;
    // const rows = [];
    // const mapped = {};
    // const data = $(".screener_snapshot-table-wrapper table  tr");
    // if (!data.length) throw new ScraperError(`Invalid handler: Data not found`);
    // data.each((i, row) => {
    //   const rowData = [];
    //   $(row)
    //     .find("td")
    //     .each((j, cell) => {
    //       rowData.push($(cell).text().trim());
    //     });
    //   for (let i = 0; i < rowData.length; i += 2) {
    //     const key = rowData[i] === "Dividend %" ? "DividendYield" : rowData[i];
    //     const camelKey = camelizeText(key);
    //     if (!validKeys.includes(camelKey)) continue;
    //     mapped[camelKey] = rowData[i + 1];
    //   }
    //   rows.push(rowData);
    // });
    // console.log(mapped);
    // return mapped;
};
const fetchData = async ({ item }) => {
    const url = tickerUrl(item.symbol);
    const html = await browser_1.browser.getPageSourceHtml(url);
    return parse(html);
};
const tickerUrl = (ticker) => `${baseUrl}/symbol/${ticker}/dividends/scorecard`;
const defaultHandler = async (symbol) => {
    const url = tickerUrl(symbol);
    const html = await browser_1.browser.getPageSourceHtml(url);
    try {
        parse(html);
        return url;
    }
    catch (e) {
        throw new scraperError_1.default(`Seekingalpha default handler for symbol [${symbol}] failed parsing`);
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
