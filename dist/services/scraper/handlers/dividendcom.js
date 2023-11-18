"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const picocolors_1 = __importDefault(require("picocolors"));
const utils_1 = require("../../../utils");
const name = "dividend.com";
const baseUrl = `https://www.dividend.com`;
const parse = (source) => {
    if (!source) {
        console.log(`${picocolors_1.default.yellow("Missing source skipping...")}`);
        return;
    }
    const $ = (0, cheerio_1.load)(source);
    const rows = [];
    const mapped = {};
    const cells = $(`div.t-flex.t-text-lg.t-font-medium.t-leading-tighter.t-h-5.t-mt-1.t-mb-3.md\\:t-mt-1.md\\:t-mb-1`
    // `.md\\:t-w-2/5 .sm\\:t-mr-4 .t-flex .t-flex-col .t-mr-0 .t-w-full`
    );
    mapped["nextPayDate"] = $(cells[1]).text();
    const nextExtCells = $(`div.t-flex.t-font-medium.t-text-xs.xl\\:t-mb-2`);
    mapped["nextExDate"] = $(cells[3]).text(); //.replace("Ex-Date:", "").trim();
    if (mapped["nextPayDate"])
        mapped["nextPayDate"] = (0, utils_1.formatDate)((0, utils_1.parseDate)(mapped["nextPayDate"]));
    if (mapped["nextExDate"])
        mapped["nextExDate"] = (0, utils_1.formatDate)((0, utils_1.parseDate)(mapped["nextExDate"]));
    return mapped;
};
const tickerUrl = (ticker) => `${baseUrl}/quote.ashx?t=${ticker}`;
const scraperHandler = {
    name,
    baseUrl,
    tickerUrl,
    parse,
};
exports.default = scraperHandler;
