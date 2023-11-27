//@ts-nocheck
import fs from "node:fs";
import path from "node:path";
import pp from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { load as cheerioLoad } from "cheerio";
import request from "request";

/*
Type 1 - Forex Pairs:

This type includes various currency pairs, such as EURUSD, GBPUSD, and AUDJPY, representing the exchange rates between different currencies.
Type 2 - Commodities and Futures:

This type includes commodities like OIL, GOLD, and SILVER, as well as futures contracts for crude oil (CL.JAN20, CL.FEB20, etc.) and natural gas (NG.JAN23, NG.FEB23, etc.).
Type 4 - Stock Indices and Futures:

This type includes stock indices like SPX500, NSDQ100, and DJ30. It also includes futures contracts for these indices (SPX500.FUT, NSDQ100.FUT, etc.).
Type 5 - Individual Stocks:

This type includes individual stocks such as AAPL (Apple), GOOG (Alphabet/Google), MSFT (Microsoft), and many more.
Type 6 - ETFs and Funds:

This type includes ETFs (Exchange-Traded Funds) and funds such as RSP, ESGU, and GSLC. These may represent baskets of stocks or other assets.
Type 10 - Cryptocurrencies:

This type includes various cryptocurrencies like BTC (Bitcoin), ETH (Ethereum), and ADA (Cardano).
*/

async function isValidTicker(url, browser) {
  const page = await browser.newPage();
  try {
    await page.goto(url);

    const redirected = page.url() !== url;

    page.close();
    return !redirected;
  } catch (error) {
    console.log("Error occured:", error.message);
  }

  page.close();
}

async function init() {
  pp.use(StealthPlugin());
  const browser = await pp.launch({
    headless: "new",
  });

  const instruments = fs.readFileSync(
    path.join(__dirname, "etoroInstruments.json"),
    "utf-8"
  );

  const { InstrumentDisplayDatas } = JSON.parse(instruments);
  
  for (const instrument of InstrumentDisplayDatas.filter((ins) => ins.InstrumentTypeID === 5)) {
    if(!instrument.SymbolFull) continue

    const url = `https://www.etoro.com/markets/${instrument.SymbolFull.toLowerCase()}`
    const isValid = await isValidTicker(
      url,
      browser
    );
    console.log(isValid, url)
    if (isValid) {
      request(
        {
          url: "http://localhost:4000/ticker",
          method: "PUT",
          json: true,
          body: { symbol: instrument.SymbolFull },
        },
        function (error, response, body) {
          console.log(error);
        }
      );
    }
  }

  browser.close();
}

init();
