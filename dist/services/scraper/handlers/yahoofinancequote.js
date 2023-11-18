"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const picocolors_1 = __importDefault(require("picocolors"));
const scraperError_1 = __importDefault(require("../../../errors/scraperError"));
const browser_1 = require("../../browser");
const name = "yahoofinance";
const baseUrl = `https://finance.yahoo.com`;
const parse = (source) => {
    if (!source) {
        console.log(`${picocolors_1.default.yellow("Missing source skipping...")}`);
        return;
    }
    const $ = (0, cheerio_1.load)(source);
    console.log(source);
    const mapped = {};
    const dataPrice = $('[data-test="qsp-price"]');
    if (!dataPrice.length)
        throw new scraperError_1.default(`Invalid handler: Data not found`);
    const price = dataPrice.attr("value");
    if (price)
        mapped["price"] = price;
    // dataPrice.each((i, row) => {
    //   const rowData = [];
    //   $(row)
    //     .find("td")
    //     .each((j, cell) => {
    //       rowData.push($(cell).text().trim());
    //     });
    //   for (let i = 0; i < rowData.length; i += 2) {
    //     const key = rowData[i] === "Dividend %" ? "DividendYield" : rowData[i];
    //     const camelKey = camelizeText(key);
    //     console.log({ camelKey });
    //     // if (!validKeys.includes(camelKey)) continue;
    //     mapped[camelKey] = rowData[i + 1];
    //   }
    //   rows.push(rowData);
    // });
    console.log(mapped);
    return mapped;
};
const tickerUrl = (ticker) => `${baseUrl}/quote/${ticker}`;
const defaultHandler = async (symbol) => {
    const url = tickerUrl(symbol);
    const html = await browser_1.browser.getPageSourceHtml(url);
    console.log(html);
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
    parse,
    defaultHandler,
};
exports.default = scraperHandler;
