"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../services/database"));
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
    },
};
exports.default = resolvers;
