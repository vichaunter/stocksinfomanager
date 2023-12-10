"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRoutes = exports.notExistingRoute = exports.errorWrapper = void 0;
const tickerController_1 = __importDefault(require("../controllers/tickerController"));
const express_1 = require("express");
const errorWrapper = (res, cb) => {
    try {
        cb();
    }
    catch (e) {
        console.error(e);
        return res.status(404).send({
            status: "error",
            message: "not found",
        });
    }
};
exports.errorWrapper = errorWrapper;
const notExistingRoute = (req, res) => {
    return res.status(404).send({ message: "invalid endpoint" });
};
exports.notExistingRoute = notExistingRoute;
const router = (0, express_1.Router)();
router.use("/tickers", tickerController_1.default.getTickers);
router.use("/ticker/:ticker/:key?", tickerController_1.default.getTicker);
router.use("/ticker/update/:ticker", tickerController_1.default.updateTicker);
router.put("/ticker", tickerController_1.default.addTicker);
const mapRoutes = (app) => {
    app.use("/", router);
    app.use(exports.notExistingRoute);
    return app;
};
exports.mapRoutes = mapRoutes;
