"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const dayjs_1 = __importDefault(require("dayjs"));
const picocolors_1 = __importDefault(require("picocolors"));
const utils_1 = require("../../../utils");
const name = "dividendmax.com";
const baseUrl = "";
const tickerUrl = (symbol) => ``;
const parse = (source) => {
    if (!source) {
        console.log(`${picocolors_1.default.yellow("Missing source skipping...")}`);
        return;
    }
    const $ = (0, cheerio_1.load)(source);
    const forecastExDates = [];
    // extract tables data
    const table = $(`table[aria-label*="Declared and forecast"]`);
    const allRows = table.find("tr");
    const rows = allRows.filter((_, row) => $(row).find("td:first-child").text().includes("Forecast"));
    rows.each((_, row) => {
        const exdateCell = $(row).find("td:eq(3)");
        if (exdateCell.text()) {
            forecastExDates.push((0, utils_1.parseDate)(exdateCell.text()));
        }
    });
    forecastExDates.sort((a, b) => {
        const aDiff = (0, dayjs_1.default)(a).diff((0, dayjs_1.default)(), "day");
        const bDiff = (0, dayjs_1.default)(b).diff((0, dayjs_1.default)(), "day");
        return aDiff - bDiff;
    });
    const mappedDates = forecastExDates.map((date) => (0, utils_1.formatDate)(date));
    return { nextExDate: mappedDates[0] };
};
const scraperHandler = {
    name,
    baseUrl,
    tickerUrl,
    parse,
};
exports.default = scraperHandler;
