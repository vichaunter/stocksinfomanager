"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-nocheck
const scraperError_1 = __importDefault(require("../../../errors/scraperError"));
const finviz_1 = __importDefault(require("./finviz"));
describe("finviz", () => {
    it("should load default handler", async () => {
        const symbol = "VZ";
        const str = await finviz_1.default.defaultHandler(symbol);
        expect(str).toEqual(finviz_1.default.tickerUrl(symbol));
    }, 30000);
    it("should throw error for invalid symbol data", async () => {
        const testFunction = async () => {
            await finviz_1.default.defaultHandler("VZZZ");
        };
        await expect(testFunction()).rejects.toThrow(scraperError_1.default);
    }, 30000);
});
