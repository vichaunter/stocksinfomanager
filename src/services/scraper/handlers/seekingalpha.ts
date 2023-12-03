import { load as cheerioLoad } from "cheerio";
import pc from "picocolors";
import ScraperError from "../../../errors/scraperError";
import { ScraperHandler } from "../../../types";
import { camelizeText, cleanNumber, formatDate } from "../../../utils";
import { browser } from "../../browser";
import database from "../../database";

const name = "seekingalpha";
const baseUrl = `https://seekingalpha.com`;

const keyMap = {
  "Div Yield (FWD)": "dividendYield",
  "Annual Payout (FWD)": "dividendAnnualPayout",
  "Payout Ratio": "dividendPayoutRatio",
  "5 Year Growth Rate": "dividend5YearGrowhthRate",
  "Dividend Growth": "dividendYearsGrowhth",
  Amount: "dividendAmount",
  "Ex-Div Date": "dividendExDate",
  "Payout Date": "dividendPayoutDate",
  "Record Date": "dividendRecordDate",
  "Declare Date": "dividendDeclareDate",
  "Div Frequency": "dividendFrequency",
};

const keyNumbers = [
  "dividendYield",
  "dividendAnnualPayout",
  "dividendPayoutRatio",
  "dividend5YearGrowhthRate",
  "dividendYearsGrowhth",
  "dividendAmount",
];
const keyDates = [
  "dividendExDate",
  "dividendPayoutDate",
  "dividendRecordDate",
  "dividendDeclareDate",
];

const formatValue = (key: string, value: string) => {
  if (keyNumbers.includes(key)) {
    return cleanNumber(value);
  }
  if (keyDates.includes(key)) {
    return formatDate(value);
  }

  return value;
};

const parse = (
  source: string
): [Record<string, string>, Record<string, string>] => {
  if (!source) {
    console.log(`${pc.yellow("Missing source skipping...")}`);
    return;
  }

  const $ = cheerioLoad(source);
  const data = $(`div[data-test-id="scorecard-section-content"]`);

  const found = $(`div:contains('Div Yield (FWD)')`);
  let dividendSummaryBlock = found;
  if (dividendSummaryBlock.length > 0) {
    const title = dividendSummaryBlock.text();
    const value = dividendSummaryBlock.next("div").text();
    console.log("found", title, value);
  } else {
    console.log("not found the block", $.text());
  }

  const extracted = {};
  const raw = {};
  data.each((i, block) => {
    $(block)
      .find("div")
      .each((y, row) => {
        const rowData = $(row).find("div");
        const label = $(rowData[0]).text();
        const value = $(rowData[1]).text();
        if (value && label && keyMap[label]) {
          raw[label] = value;
          extracted[keyMap[label]] = formatValue(keyMap[label], value);
        }
      });
  });

  return [extracted, raw];
};

const fetchData = async ({ item }) => {
  const url = tickerUrl(item.symbol);
  const html = await browser.getPageSourceHtml(url);

  const [data, raw] = parse(html);
  database.saveRaw(name, item.symbol, raw);
  console.log("seekingalpha:", data);
  return data;
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
