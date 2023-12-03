"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tickerModel_1 = __importDefault(require("../models/tickerModel"));
const database_1 = __importDefault(require("../services/database"));
const updater_1 = __importDefault(require("../services/updater"));
const apolloQueryToMongoProjectionParseSelections = (selections) => {
    const projection = {};
    selections.map((field) => {
        if (field.selectionSet) {
            projection[field.name.value] =
                apolloQueryToMongoProjectionParseSelections(field.selectionSet.selections);
        }
        else {
            const name = field.name.value === "id" ? "_id" : field.name.value;
            if (field.name.value !== "__typename") {
                projection[name] = true;
            }
        }
    });
    return projection;
};
const apolloQueryToMongoProjection = (fieldNodes) => {
    let projection = {};
    for (const fieldNode of fieldNodes) {
        if (fieldNode.selectionSet) {
            const parsed = apolloQueryToMongoProjectionParseSelections(fieldNode.selectionSet.selections);
            projection = {
                ...projection,
                ...parsed,
            };
        }
    }
    return projection;
};
const resolvers = {
    Query: {
        async ticker(_, { symbol }) {
            return await database_1.default.getTicker(symbol);
        },
        async tickers(root, args, context, info) {
            return await database_1.default.getTickers();
        },
        async rawTicker(_, { symbol }) {
            return await database_1.default.getRawTicker(symbol);
        },
    },
    Mutation: {
        async createTicker(_, { symbol }) {
            console.log("Mutator ticker:", symbol);
            try {
                const ticker = new tickerModel_1.default({ symbol });
                console.log("save ticker");
                await ticker.saveTicker();
                return ticker;
            }
            catch (e) {
                return {
                    error: e,
                };
            }
        },
        async updateTicker(_, { symbol }) {
            try {
                if (symbol) {
                    const dbTicker = await database_1.default.getTicker(symbol);
                    await updater_1.default.updateTicker(dbTicker);
                    const updated = await database_1.default.getTicker(symbol);
                    return updated;
                }
                else {
                    throw new Error("Missing symbol parameter");
                }
            }
            catch (e) {
                return {
                    error: e,
                };
            }
        },
    },
};
exports.default = resolvers;
