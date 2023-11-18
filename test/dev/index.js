"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const node_path_1 = __importDefault(require("node:path"));
const database_1 = __importDefault(require("../../src/services/database"));
const updater_1 = __importDefault(require("../../src/services/updater"));
const tickerModel_1 = __importDefault(require("../../src/models/tickerModel"));
dotenv_1.default.config({ path: node_path_1.default.join("..", ".env") });
database_1.default.init();
async function init() {
    const ticker = new tickerModel_1.default({
        id: "1",
        symbol: "O",
    });
    ticker.tickerHandlers = {
        id: "1",
        tickerId: "1",
        handlers: [
            {
                id: "dividendcom",
                enabled: true,
                url: "https://www.dividend.com/stocks/communications/telecommunication/telecom-carriers/vz-verizon/",
            },
        ],
    };
    updater_1.default.updateTicker(ticker);
}
init();
