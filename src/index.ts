import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { mapRoutes } from "./routes";
import database from "./services/database";
import updater from "./services/updater";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers, typeDefs } from "./api";

dotenv.config({ path: path.join("..", ".env") });
database.init();

if (process.env.MODE === "services") {
  const services = async () => {
    await updater.loadStoredTickers();
    updater.tickerUpdaterService();
  };

  services();
} else {
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

  // const app = express();
  // app.use(express.json());
  // mapRoutes(app);

  // const server = app.listen(4000, async () => {
  //   const { port } = server.address() as { port: number };
  //   console.log(`Server started on port: http://localhost:${port}`);
  // });
}
