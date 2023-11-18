import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { mapRoutes } from "./routes";
import database from "./services/database";
import updater from "./services/updater";

dotenv.config({ path: path.join("..", ".env") });
database.init();

if (process.env.MODE === "services") {
  const services = async () => {
    await updater.loadStoredTickers();
    updater.tickerUpdaterService();
  };

  services();
} else {
  const app = express();
  app.use(express.json());
  mapRoutes(app);
  const server = app.listen(4000, async () => {
    const { port } = server.address() as { port: number };
    console.log(`Server started on port: http://localhost:${port}`);
  });
}
