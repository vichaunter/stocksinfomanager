"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    log: (...args) => process.env.DEV && console.log(...args),
};
