import taskController from "../controllers/taskController";
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

export type ApiTickersArgs = {
  tickers?: string[] | string;
  withDividend?: boolean;
  withPrice?: boolean;
  minDivYield?: number;
  maxDivYield?: number;
};

const resolvers = {
  Query: {
    async ticker(_, { symbol }) {
      return await database.getTicker(symbol);
    },
    async tickers(root, args: ApiTickersArgs, context, info) {
      return await database.getTickers(args);
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
    async task() {
      const task = taskController.getTask();
      if (task) {
        return { __typename: "Task", ...task };
      }

      return { __typename: "Error", error: "Nothing to do" };
    },
  },
  TaskResult: {
    __resolveType(obj) {
      if (obj.error) {
        return "Error";
      }

      return "Task";
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
    async updateAllFromRaw(_) {
      try {
        await updater.updateFromStoredRaw();

        return true;
      } catch (e) {
        return {
          error: e,
        };
      }
    },
    async setTaskSource(_, { url, source }) {
      taskController.setTaskSource({ url, source });

      return { status: "ok" };
    },
  },
};

export default resolvers;
