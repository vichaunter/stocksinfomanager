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
const database_1 = __importDefault(require("../../database"));
const name = "seekingalpha";
const baseUrl = `https://seekingalpha.com`;
const keyMap = {
    "Div Yield (FWD)": "dividendYield",
    "Annual Payout (FWD)": "dividendAnnualPayout",
    "Payout Ratio": "dividendPayoutRatio",
    "5 Year Growth Rate": "dividend5YearGrowhthRate",
    "Dividend Growth": "dividendYearsGrowhth",
    Amount: "dividendAmount",
    "Ex-Div Date": "dividendExDate",
    "Payout Date": "dividendPayoutDate",
    "Record Date": "dividendRecordDate",
    "Declare Date": "dividendDeclareDate",
    "Div Frequency": "dividendFrequency",
};
const keyNumbers = [
    "dividendYield",
    "dividendAnnualPayout",
    "dividendPayoutRatio",
    "dividend5YearGrowhthRate",
    "dividendYearsGrowhth",
    "dividendAmount",
];
const keyDates = [
    "dividendExDate",
    "dividendPayoutDate",
    "dividendRecordDate",
    "dividendDeclareDate",
];
const formatValue = (key, value) => {
    if (keyNumbers.includes(key)) {
        return (0, utils_1.cleanNumber)(value);
    }
    if (keyDates.includes(key)) {
        return (0, utils_1.formatDate)(value);
    }
    return value;
};
const parse = (source) => {
    if (!source) {
        console.log(`${picocolors_1.default.yellow("Missing source skipping...")}`);
        return;
    }
    const $ = (0, cheerio_1.load)(source);
    const data = $(`div[data-test-id="scorecard-section-content"]`);
    const found = $(`div:contains('Div Yield (FWD)')`);
    let dividendSummaryBlock = found;
    if (dividendSummaryBlock.length > 0) {
        const title = dividendSummaryBlock.text();
        const value = dividendSummaryBlock.next("div").text();
        console.log("found", title, value);
    }
    else {
        console.log("not found the block", $.text());
    }
    const extracted = {};
    const raw = {};
    data.each((i, block) => {
        $(block)
            .find("div")
            .each((y, row) => {
            const rowData = $(row).find("div");
            const label = $(rowData[0]).text();
            const value = $(rowData[1]).text();
            if (value && label && keyMap[label]) {
                raw[label] = value;
                extracted[keyMap[label]] = formatValue(keyMap[label], value);
            }
        });
    });
    return [extracted, raw];
};
const fetchData = async ({ item }) => {
    const url = tickerUrl(item.symbol);
    const html = await browser_1.browser.getPageSourceHtml(url);
    const [data, raw] = parse(html);
    database_1.default.saveRaw(name, item.symbol, raw);
    console.log("seekingalpha:", data);
    return data;
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
