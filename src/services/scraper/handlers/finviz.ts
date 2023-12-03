import { load as cheerioLoad } from "cheerio";
import pc from "picocolors";
import ScraperError from "../../../errors/scraperError";
import ScraperHandlerError from "../../../errors/scraperHandlerError";
import { ScraperHandler } from "../../../types";
import { camelizeText } from "../../../utils";
import { browser } from "../../browser";
import database from "../../database";

const name = "finviz";
const baseUrl = `https://finviz.com`;

const validKeys = ["price", "dividend", "dividendYield"];

const dataKeysCamelized = [
  "index",
  "pE",
  "ePSTtm",
  "insiderOwn",
  "shsOutstand",
  "perfWeek",
  "marketCap",
  "forwardPE",
  "ePSNextY",
  "insiderTrans",
  "shsFloat",
  "perfMonth",
  "income",
  "pEG",
  "ePSNextQ",
  "instOwn",
  "shortFloatRatio",
  "perfQuarter",
  "sales",
  "pS",
  "ePSThisY",
  "instTrans",
  "shortInterest",
  "perfHalfY",
  "booksh",
  "pB",
  "ePSNextY",
  "rOA",
  "targetPrice",
  "perfYear",
  "cashsh",
  "pC",
  "ePSNextY",
  "rOE",
  "wRange",
  "perfYTD",
  "dividend",
  "pFCF",
  "ePSPastY",
  "rOI",
  "wHigh",
  "beta",
  "dividendYield",
  "quickRatio",
  "salesPastY",
  "grossMargin",
  "wLow",
  "aTR",
  "employees",
  "currentRatio",
  "salesQQ",
  "operMargin",
  "rSI",
  "volatility",
  "optionable",
  "debtEq",
  "ePSQQ",
  "profitMargin",
  "relVolume",
  "prevClose",
  "shortable",
  "lTDebtEq",
  "earnings",
  "payout",
  "avgVolume",
  "price",
  "recom",
  "sMA",
  "sMA",
  "sMA",
  "volume",
  "change",
];

const parse = (source: string): Record<string, string> => {
  if (!source) {
    console.log(`${pc.yellow("Missing source skipping...")}`);
    return;
  }
  const $ = cheerioLoad(source);

  const rows = [];
  const mapped = {};
  const data = $(".screener_snapshot-table-wrapper table  tr");
  if (!data.length) throw new ScraperHandlerError(name, "DATA_NOT_FOUND");

  //ScraperError(`Invalid handler ${name}: Data not found`);

  data.each((i, row) => {
    const rowData = [];
    $(row)
      .find("td")
      .each((j, cell) => {
        rowData.push($(cell).text().trim());
      });

    for (let i = 0; i < rowData.length; i += 2) {
      const key = rowData[i] === "Dividend %" ? "DividendYield" : rowData[i];
      const camelKey = camelizeText(key);

      if (!validKeys.includes(camelKey)) continue;
      mapped[camelKey] = rowData[i + 1];
    }
    rows.push(rowData);
  });

  return mapped;
};

const fetchData = async ({ item }) => {
  const url = tickerUrl(item.symbol);
  const html = await browser.getPageSourceHtml(url);

  database.saveRaw(name, item.symbol, parse(html));

  return {};
};

const tickerUrl = (ticker: string) => `${baseUrl}/quote.ashx?t=${ticker}`;

const defaultHandler = async (symbol: string): Promise<string | void> => {
  const url = tickerUrl(symbol);
  const html = await browser.getPageSourceHtml(url);

  try {
    parse(html);

    return url;
  } catch (e) {
    throw new ScraperError(
      `Finviz default handler for symbol [${symbol}] failed parsing`
    );
  }

  return;
};

const scraperHandler: ScraperHandler = {
  name,
  baseUrl,
  tickerUrl,
  defaultHandler,
  fetch: fetchData,
};

export default scraperHandler;
