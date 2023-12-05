"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDividendFrequency = exports.findMode = exports.sortObjByKeys = exports.getDividendPercentage = exports.sleep = exports.formatDate = exports.parseDate = exports.cleanNumber = exports.camelizeText = exports.ucFirstAll = exports.lcFirst = exports.ucFirst = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const system_locale_1 = __importDefault(require("system-locale"));
const picocolors_1 = __importDefault(require("picocolors"));
const dev_1 = __importDefault(require("./dev"));
(0, system_locale_1.default)().then((locale) => {
    dev_1.default.log(picocolors_1.default.bgYellow(`Locale system loaded: ${locale}`));
    dayjs_1.default.locale(locale);
});
const ucFirst = (str) => str.slice(0, 1).toUpperCase() + str.slice(1);
exports.ucFirst = ucFirst;
const lcFirst = (str) => str.slice(0, 1).toLowerCase() + str.slice(1);
exports.lcFirst = lcFirst;
const ucFirstAll = (str) => str
    .split(" ")
    .map((s) => (0, exports.ucFirst)(s))
    .join(" ");
exports.ucFirstAll = ucFirstAll;
const camelizeText = (str) => {
    return (0, exports.lcFirst)((0, exports.ucFirstAll)(str.replace(/[^a-zA-Z ]/, "")).replace(/[^a-zA-Z]/g, ""));
};
exports.camelizeText = camelizeText;
const cleanNumber = (str) => {
    return parseFloat(str.replace(/[^0-9\.\%\- ]/g, ""));
};
exports.cleanNumber = cleanNumber;
const parseDate = (str) => (0, dayjs_1.default)(str, ["MMM DD, YYYY", "DD MMM YYYY", "YYYY-MM-DD"]);
exports.parseDate = parseDate;
const formatDate = (date, format) => {
    const isDateString = typeof date === "string";
    let dayjsDate;
    if (isDateString) {
        dayjsDate = (0, exports.parseDate)(date);
    }
    else {
        dayjsDate = date;
    }
    return dayjsDate.format();
};
exports.formatDate = formatDate;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
exports.sleep = sleep;
const getDividendPercentage = (price, dividend) => {
    return (dividend / price) * 100;
};
exports.getDividendPercentage = getDividendPercentage;
const sortObjByKeys = (obj) => {
    const sorted = {};
    Object.keys(obj)
        .sort()
        .forEach((k) => {
        sorted[k] = obj[k];
    });
    return sorted;
};
exports.sortObjByKeys = sortObjByKeys;
const findMode = (arr) => {
    if (arr.length === 0)
        return;
    const counter = {};
    arr.forEach((n) => {
        counter[n] = (counter[n] ?? 0) + 1;
    });
    const sorted = Object.entries(counter)
        .map(([k, v]) => ({ value: k, frequency: v }))
        .sort((a, b) => b.frequency - a.frequency);
    return Number(sorted?.[0]?.value) ?? 0;
};
exports.findMode = findMode;
const getDividendFrequency = (dates) => {
    const countPerYear = {};
    for (const date of dates) {
        const year = date.getFullYear();
        countPerYear[year] = (countPerYear[year] ?? 0) + 1;
    }
    let frequency = 0; //0 means no dividends
    frequency = Math.floor((0, exports.findMode)(Object.values(countPerYear)));
    return frequency;
};
exports.getDividendFrequency = getDividendFrequency;
