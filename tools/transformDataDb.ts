//@ts-nocheck
import dotenv from "dotenv";
import path from "node:path";
import database from "../src/services/database";
import { cleanNumber } from "../src/utils";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join("..", ".env") });
database.init();

async function updateDividendFromNasdaq() {
  const tickers = await database.getTickers({
    tickerData: {
      id: true,
      price: true,
      dividend: true,
      dividends: true,
    },
  });

  tickers?.forEach((ticker) => {
    const dividendAnnualized = Number(
      ticker.tickerData?.dividends?.annualizedDividend
    );

    if (!isNaN(dividendAnnualized)) {
      if (ticker.setData({ dividendAnnualized }).saveTicker()) {
        console.log("Saved: ", ticker.symbol);
      }
    }
  });
}

async function updatePercentValues() {
  const tickers = await database.getTickers({
    tickerData: true,
  });

  console.log(tickers[0]);

  //   tickers?.forEach((ticker) => {
  //     if (ticker.tickerData?.dividend5YearGrowhthRate) {
  //       const dividend5YearGrowhthRate = parseFloat(
  //         ticker.tickerData?.dividend5YearGrowhthRate
  //       ) as number;
  //       ticker.setData({ dividend5YearGrowhthRate }).saveTicker();
  //     }
  //   });
}

updatePercentValues();
