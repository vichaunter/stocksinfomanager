"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const picocolors_1 = __importDefault(require("picocolors"));
const utils_1 = require("../../../utils");
const name = "asx.com.au";
const baseUrl = ``;
const tickerUrl = (symbol) => ``;
const keyMap = {
    dividendAmount: "dividend",
    annualYield: "dividendYield",
    previousClose: "price",
};
const parse = (source) => {
    if (!source) {
        console.log(`${picocolors_1.default.yellow("Missing source skipping...")}`);
        return;
    }
    const $ = (0, cheerio_1.load)(source);
    const data = {};
    // extract tables data
    const tables = $(`table.table.table-nv`);
    tables.each((i, table) => {
        $(table).each((i, element) => {
            $(element)
                .find("tr")
                .each((i, row) => {
                const key = (0, utils_1.camelizeText)($(row).find("th").text());
                const value = (0, utils_1.cleanNumber)($(row).find("td").text());
                data[key] = value;
            });
        });
        2;
    });
    //extract charts data
    // const charts = $(`figure`);
    // charts.each((i, chart) => {
    //   const caption = $(chart).find("figcaption");
    //   if (caption.text().trim() === "Dividends") {
    //     const gs = $(chart).find("g");
    //     gs.each((i, g) => {
    //       const texts = $(g).find("text");
    //       if (texts.length === 2) {
    //         const month = $(texts[0]).text();
    //         const year = $(texts[1]).text();
    //         console.log({ month, year });
    //       }
    //     });
    //   }
    // });
    const mapped = {};
    Object.keys(keyMap).map((k) => {
        mapped[keyMap[k]] = data[k];
    });
    return mapped;
};
const scraper = {
    name,
    baseUrl,
    tickerUrl,
    parse,
};
exports.default = scraper;
