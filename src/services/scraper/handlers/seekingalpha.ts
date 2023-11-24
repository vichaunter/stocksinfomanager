import { load as cheerioLoad } from "cheerio";
import pc from "picocolors";
import ScraperError from "../../../errors/scraperError";
import { ScraperHandler } from "../../../types";
import { camelizeText } from "../../../utils";
import { browser } from "../../browser";

const name = "seekingalpha";
const baseUrl = `https://seekingalpha.com`;

const keyMap = {
  "Payout Ratio": "dividendPayoutRatio",
  "5 Year Growth Rate": "dividend5YearGrowhthRate",
  "Dividend Growth": "dividendYearsGrowhth",
  "Ex-Div Date": "lastExDate",
  "Payout Date": "lastPayoutDate",
  "Div Frequency": "dividendFrequency"
}

const validKeys = [
  "price", "dividend", "dividendYield"
];
const parse = (source: string): Record<string, string> => {
  if (!source) {
    console.log(`${pc.yellow("Missing source skipping...")}`);
    return;
  }
  const $ = cheerioLoad(source);
  const data = $(`div[data-test-id="scorecard-section-content"]`);

  const extracted = {}
  data.each((i, block) => {
    $(block).find("div").each((y, row) => {
      const rowData = $(row).find("div")
      const label = $(rowData[0]).text()
      const value = $(rowData[1]).text()

      if(value && label && keyMap[label]){
         extracted[keyMap[label]] = value
      }
    })
  })


  return extracted

  // const rows = [];
  // const mapped = {};
  // const data = $(".screener_snapshot-table-wrapper table  tr");
  // if (!data.length) throw new ScraperError(`Invalid handler: Data not found`);

  // data.each((i, row) => {
  //   const rowData = [];
  //   $(row)
  //     .find("td")
  //     .each((j, cell) => {
  //       rowData.push($(cell).text().trim());
  //     });

  //   for (let i = 0; i < rowData.length; i += 2) {
  //     const key = rowData[i] === "Dividend %" ? "DividendYield" : rowData[i];
  //     const camelKey = camelizeText(key);

  //     if (!validKeys.includes(camelKey)) continue;
  //     mapped[camelKey] = rowData[i + 1];
  //   }
  //   rows.push(rowData);
  // });

  // console.log(mapped);
  // return mapped;
};

const fetchData = async ({ item }) => {
  const url = tickerUrl(item.symbol);
  const html = await browser.getPageSourceHtml(url);

  return parse(html);
};

const tickerUrl = (ticker: string) =>
  `${baseUrl}/symbol/${ticker}/dividends/scorecard`;

const defaultHandler = async (symbol: string): Promise<string | void> => {
  const url = tickerUrl(symbol);
  const html = await browser.getPageSourceHtml(url);

  try {
    parse(html);

    return url;
  } catch (e) {
    throw new ScraperError(
      `Seekingalpha default handler for symbol [${symbol}] failed parsing`
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