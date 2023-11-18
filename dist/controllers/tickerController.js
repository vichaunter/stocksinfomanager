"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tickerModel_1 = __importDefault(require("../models/tickerModel"));
const routes_1 = require("../routes");
const database_1 = __importDefault(require("../services/database"));
const updater_1 = __importDefault(require("../services/updater"));
const getTicker = (req, res) => {
    (0, routes_1.errorWrapper)(res, async () => {
        let { ticker, key } = req.params;
        const dbTicker = await database_1.default.getTicker(ticker);
        const tickerModel = new tickerModel_1.default(dbTicker);
        const data = await tickerModel.getData();
        if (!data) {
            updater_1.default.addTickerToUpdate(tickerModel);
            res.status(503).send({
                status: "unavailable",
                message: "first load may take a while",
            });
            return;
        }
        const keyData = key && tickerModel.getKeyData(key);
        if (keyData) {
            return res.status(200).send(keyData);
        }
        return res.status(200).send({
            status: "success",
            ticker,
            data,
        });
    });
};
const getTickers = async (_, res) => {
    const tickers = await tickerModel_1.default.getTickersFlatData();
    return res.status(200).send(tickers ?? []);
};
const addTicker = async (req, res) => {
    let { symbol } = req.body;
    if (!symbol) {
        res.status(500).send({
            status: 0,
            error: `Missing parameter symbol`,
        });
    }
    const ticker = await tickerModel_1.default.addTicker({ symbol });
    return res.status(200).send(ticker);
};
exports.default = { getTicker, getTickers, addTicker };
