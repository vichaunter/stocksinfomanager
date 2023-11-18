"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = void 0;
const MongoDBHandler_1 = __importDefault(require("./MongoDBHandler"));
exports.handlers = {
    // filesystem: FilesystemDatabaseHandler,
    mongodb: MongoDBHandler_1.default,
};
