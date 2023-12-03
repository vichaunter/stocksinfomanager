"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATHS = void 0;
const node_path_1 = __importDefault(require("node:path"));
var BASE_PATH = process.cwd();
if (process.env.VERCEL_ENV === "production") {
    BASE_PATH = "/data";
}
exports.PATHS = {
    base: BASE_PATH,
    data: node_path_1.default.join(BASE_PATH, "data"),
    tickers: node_path_1.default.join(BASE_PATH, "data", "tickers"),
    raw: node_path_1.default.join(BASE_PATH, "data", "raw"),
    tickerFile: (ticker) => node_path_1.default.join(BASE_PATH, "data", "tickers", `${ticker}.json`),
    rawFile: (symbol, extension = null) => node_path_1.default.join(BASE_PATH, "data", "raw", `${symbol}${extension ? `.${extension}` : ""}`),
};
