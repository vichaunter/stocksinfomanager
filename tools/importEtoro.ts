//@ts-nocheck
import fs from "node:fs";
import path from "node:path";
import pp from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
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

//Instruments
const INSTRUMENTS_URL =
  "https://api.etorostatic.com/sapi/instrumentsmetadata/V1.1/instruments/bulk?bulkNumber=1&totalBulks=1";

//Instruments rates
const INSTRUMENTSDATA_URL = `https://www.etoro.com/sapi/trade-real/instruments?InstrumentDataFilters=Activity,Rates,ActivityInExchange`;

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
    path.join(__dirname, "etoroInstrumentsRaw.json"),
    "utf-8"
  );

  const { InstrumentDisplayDatas } = JSON.parse(instruments);

  for (const instrument of InstrumentDisplayDatas.filter(
    (ins) => ins.InstrumentTypeID === 5
  )) {
    if (!instrument.SymbolFull) continue;

    const url = `https://www.etoro.com/markets/${instrument.SymbolFull.toLowerCase()}`;
    const isValid = await isValidTicker(url, browser);
    console.log(isValid, url);
    if (isValid) {
      request(
        {
          url: "http://localhost:4000/graphql", // Replace with your GraphQL server endpoint
          method: "POST",
          json: true,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            query: `
              mutation CreateTicker($symbol: String!) {
                createTicker(symbol: $symbol) {
                  symbol
                }
              }
            `,
            variables: {
              symbol: instrument.SymbolFull,
            },
          },
        },
        function (error, response, body) {
          console.log(error, body);
        }
      );
    }
  }

  browser.close();
}

const downloadData = async () => {
  pp.use(StealthPlugin());
  const browser = await pp.launch({
    headless: "new",
  });

  try {
    const instruments = await browser.newPage();
    await instruments.goto(INSTRUMENTS_URL, { waitUntil: "networkidle0" });
    const source = await instruments.content();
    fs.writeFileSync(
      path.join(__dirname, "etoroInstrumentsRaw.json"),
      source.replace(/(<([^>]+)>)/gi, "")
    );
    instruments.close();

    const instrumentsData = await browser.newPage();
    await instrumentsData.goto(INSTRUMENTSDATA_URL, {
      waitUntil: "networkidle0",
    });
    const sourceData = await instrumentsData.content();
    fs.writeFileSync(
      path.join(__dirname, "etoroInstrumentsDataRaw.json"),
      sourceData.replace(/(<([^>]+)>)/gi, "")
    );
    instrumentsData.close();
  } catch (error) {
    console.log("Error occured:", error.message);
  }

  browser.close();
};

init();
