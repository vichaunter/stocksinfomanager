import { load as cheerioLoad } from "cheerio";
import pc from "picocolors";
import ScraperError from "../../../errors/scraperError";
import { ScraperHandler } from "../../../types";
import { camelizeText } from "../../../utils";
import browser from "simppeteer";

const name = "yahoofinance";
const baseUrl = `https://finance.yahoo.com`;

const parse = (source: string): Record<string, string> => {
  if (!source) {
    console.log(`${pc.yellow("Missing source skipping...")}`);
    return;
  }
  const $ = cheerioLoad(source);

  console.log(source);
  const mapped = {};
  const dataPrice = $('[data-test="qsp-price"]');
  if (!dataPrice.length)
    throw new ScraperError(`Invalid handler: Data not found`);

  const price = dataPrice.attr("value");
  if (price) mapped["price"] = price;

  // dataPrice.each((i, row) => {
  //   const rowData = [];
  //   $(row)
  //     .find("td")
  //     .each((j, cell) => {
  //       rowData.push($(cell).text().trim());
  //     });

  //   for (let i = 0; i < rowData.length; i += 2) {
  //     const key = rowData[i] === "Dividend %" ? "DividendYield" : rowData[i];
  //     const camelKey = camelizeText(key);
  //     console.log({ camelKey });

  //     // if (!validKeys.includes(camelKey)) continue;
  //     mapped[camelKey] = rowData[i + 1];
  //   }
  //   rows.push(rowData);
  // });
  console.log(mapped);
  return mapped;
};

const tickerUrl = (ticker: string) => `${baseUrl}/quote/${ticker}`;

const defaultHandler = async (symbol: string): Promise<string | void> => {
  const url = tickerUrl(symbol);
  const html = await browser.getPageSourceHtml(url);
  console.log(html);
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

const scraperHandler: ScraperHandler<any> = {
  name,
  baseUrl,
  tickerUrl,
  parse,
  defaultHandler,
};

export default scraperHandler;
