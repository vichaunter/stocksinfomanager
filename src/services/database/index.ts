import MongoDBDatabaseHandler from "./MongoDBHandler";

export const handlers = {
  // filesystem: FilesystemDatabaseHandler,
  mongodb: MongoDBDatabaseHandler,
};

export type DbHandlers = keyof typeof handlers;
