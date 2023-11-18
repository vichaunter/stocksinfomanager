import dotenv from "dotenv";
import path from "node:path";
import database from "../../src/services/database";
import updater from "../../src/services/updater";
import TickerModel from "../../src/models/tickerModel";

dotenv.config({ path: path.join("..", ".env") });
database.init();

async function init() {
  const ticker: TickerModel = new TickerModel({
    id: "1",
    symbol: "CQR",
    updatedAt: new Date(),
  });
  ticker.tickerHandlers = {
    id: "1",
    tickerId: "1",
    handlers: [
      {
        id: "dividendmax",
        enabled: true,
        url: "https://www.dividendmax.com/australia/australian-stock-exchange/real-estate-investment-trusts/charter-hall-retail-reit/dividends",
      },
    ],
  };

  updater.updateTicker(ticker);
}

init();
