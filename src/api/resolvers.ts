import TickerModel from "../models/tickerModel";
import database from "../services/database";
import updater from "../services/updater";

const apolloQueryToMongoProjectionParseSelections = (selections) => {
  const projection = {};

  selections.map((field) => {
    if (field.selectionSet) {
      projection[field.name.value] =
        apolloQueryToMongoProjectionParseSelections(
          field.selectionSet.selections
        );
    } else {
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
      const parsed = apolloQueryToMongoProjectionParseSelections(
        fieldNode.selectionSet.selections
      );
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
      return await database.getTicker(symbol);
    },
    async tickers(root, args, context, info) {
      return await database.getTickers();
    },
    async rawTicker(_, { symbol }) {
      return await database.getRawTicker(symbol);
    },
    async nextTickerToUpdate(_) {
      const nextTicker = await database.getNextTickerToUpdate();
      if (nextTicker) {
        await updater.updateTicker(nextTicker);
      }

      return await database.getTicker(nextTicker.symbol);
    },
  },
  Mutation: {
    async createTicker(_, { symbol }) {
      try {
        const ticker = new TickerModel({ symbol } as any);
        await ticker.saveTicker();

        return ticker;
      } catch (e) {
        return {
          error: e,
        };
      }
    },
    async updateTicker(_, { symbol }) {
      try {
        if (symbol) {
          const dbTicker = await database.getTicker(symbol);

          await updater.updateTicker(dbTicker);

          const updated = await database.getTicker(symbol);

          return updated;
        } else {
          throw new Error("Missing symbol parameter");
        }
      } catch (e) {
        return {
          error: e,
        };
      }
    },
  },
};

export default resolvers;
