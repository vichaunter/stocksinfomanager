import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import dotenv from "dotenv";
import path from "node:path";
import { resolvers, typeDefs } from "./api";
import database from "./services/database";

dotenv.config({ path: path.join("..", ".env") });
database.init();

async function api() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`server started at ${url}`);
}

api();
