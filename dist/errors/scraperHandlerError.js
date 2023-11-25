"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ScraperHandlerError extends Error {
    constructor(handler, code) {
        super();
        if (!Object.keys(ScraperHandlerError.ERROR_CODES).includes(code)) {
            throw new Error(`ScraperHandlerError invalid ERROR_CODES: ${handler}, ${code}`);
        }
        this.name = "ScraperHandlerError";
        this.handler = handler;
        this.code = code;
        this.message = this.getErrorMessage();
    }
    getErrorMessage() {
        const messages = {
            1: `Invalid handler ${this.handler}: Data not found`
        };
        return messages[this.code];
    }
}
ScraperHandlerError.ERROR_CODES = [
    "DATA_NOT_FOUND"
];
exports.default = ScraperHandlerError;
