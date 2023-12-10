"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ScraperError extends Error {
    constructor(args) {
        super(args);
        this.name = "ScraperError";
    }
}
exports.default = ScraperError;
