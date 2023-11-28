"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDividendPercentage = exports.sleep = exports.formatDate = exports.parseDate = exports.cleanNumber = exports.camelizeText = exports.ucFirstAll = exports.lcFirst = exports.ucFirst = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const system_locale_1 = __importDefault(require("system-locale"));
const picocolors_1 = __importDefault(require("picocolors"));
(0, system_locale_1.default)().then((locale) => {
    console.log(picocolors_1.default.bgYellow(`Locale system loaded: ${locale}`));
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
    return str.replace(/[^0-9\.\% ]/g, "");
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
