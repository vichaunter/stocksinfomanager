import { load as cheerioLoad } from "cheerio";
import pc from "picocolors";
import ScraperError from "../../../errors/scraperError";
import { ScraperHandler } from "../../../types";
import { camelizeText, cleanNumber, formatDate, sleep } from "../../../utils";
import { browser } from "../../browser";
import database from "../../database";
import { SeekingAlphaData } from "./types/seekingAlphaTypes";
import TickerModel from "../../../models/tickerModel";

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

function parseScorecard(source: string) {
  if (!source) {
    console.log(`${pc.yellow("Missing source skipping...")}`);
    return;
  }

  const raw = {};
  const $ = cheerioLoad(source);

  const head = $("h1:first");
  const name = head.find("span:eq(1)")?.text();
  if (name) raw["name"] = name;

  const headBlock = head.parent().parent().parent();
  const priceBlock = headBlock.find("div:nth-child(2) span:first");
  if (priceBlock) raw["price"] = cleanNumber(priceBlock.text());

  const noDividend = $('div:contains("does not currently pay a dividend")');
  raw["payDividend"] = noDividend?.length === 0;

  // extract sections data
  const sections = [];
  const dividendSummary = $('div:contains("Dividend Summary")')
    ?.parents("section")
    .find("div > div > div > div");
  if (dividendSummary) sections.push(dividendSummary);

  const lastAnnounced = $('div:contains("Last Announced Dividend")')
    ?.parents("section")
    .find("div > div > div > div");
  if (lastAnnounced) sections.push(lastAnnounced);

  if (sections.length > 0) {
    for (const section of sections) {
      section.each((i, el) => {
        const header = $(el).find("div:nth-child(1)").text().trim();
        const value = $(el).find("div:nth-child(2)").text().trim();

        if (header && value) raw[header] = value;
      });
    }
  }

  return raw;
}

const WEBURLS = [
  {
    name: "scorecard",
    getUrl: (symbol: string) =>
      `https://seekingalpha.com/symbol/${symbol}/dividends/scorecard`,
    parser: parseScorecard,
  },
];

const fetchData = async ({ item }) => {
  // const html = await browser.getPageSourceHtml(url);

  const raw = {};
  for (const urlObj of WEBURLS) {
    const url = urlObj.getUrl(item.symbol);
    const html = await browser.getPageSourceHtml(url);

    const parsed = urlObj.parser(html);

    raw[urlObj.name] = parsed;
  }

  database.saveRaw(name, item.symbol, raw);

  return raw;
};

const FREQUENCYMAP = {
  Quarterly: 4,
  Semiannual: 2,
  Monthly: 12,
  Annual: 1,
};

const rawToTicker = <T extends SeekingAlphaData>(
  symbol: string,
  raw: T
): TickerModel => {
  let model = new TickerModel();
  model.symbol = symbol;

  if (!raw) return;

  const price = raw.scorecard?.["price"];
  if (price) model.setPrice(price);

  const name = raw.scorecard?.["name"];
  if (name) model.setName(name);

  //TODO: move next ones to loop
  const dividendYield = raw.scorecard?.["Div Yield (FWD)"];
  if (dividendYield) model.setDividendYield(dividendYield);

  const payDividend = raw.scorecard?.["payDividend"];
  if (payDividend) model.setPayDividend(payDividend);

  const dividendYearsGrowhth = raw.scorecard?.["Dividend Growth"];
  if (dividendYearsGrowhth) model.setDividendYearsGrowhth(dividendYearsGrowhth);

  const dividend5YearGrowhthRate = raw.scorecard?.["5 Year Growth Rate"];
  if (dividend5YearGrowhthRate)
    model.setDividend5YearGrowhthRate(dividend5YearGrowhthRate);

  const dividendAnnualPayout = raw.scorecard?.["Annual Payout (FWD)"];
  if (dividendAnnualPayout) model.setDividendAnnualPayout(dividendAnnualPayout);

  const dividendAmount = raw.scorecard?.["Amount"];
  if (dividendAmount) model.setDividendAmount(dividendAmount);

  const dividendPayoutRatio = raw.scorecard?.["Payout Ratio"];
  if (dividendPayoutRatio) model.setDividendPayoutRatio(dividendPayoutRatio);

  const dividendExDate = raw.scorecard?.["Ex-Div Date"];
  if (dividendExDate) model.setDividendExDate(dividendExDate);

  const dividendPayoutDate = raw.scorecard?.["Payout Date"];
  if (dividendPayoutDate) model.setDividendPayoutDate(dividendPayoutDate);

  const dividendRecordDate = raw.scorecard?.["Record Date"];
  if (dividendRecordDate) model.setDividendRecordDate(dividendRecordDate);

  const dividendDeclareDate = raw.scorecard?.["Declare Date"];
  if (dividendDeclareDate) model.setDividendDeclareDate(dividendDeclareDate);

  const dividendFrequency = raw.scorecard?.["Div Frequency"];
  if (dividendFrequency)
    model.setDividendFrequency(FREQUENCYMAP["dividendFrequency"]);

  return model;
};

const tickerUrl = (ticker: string) =>
  `${baseUrl}/symbol/${ticker}/dividends/scorecard`;

const defaultHandler = async (symbol: string): Promise<string | void> => {
  const url = tickerUrl(symbol);
  const html = await browser.getPageSourceHtml(url);

  try {
    // parse(html);

    return url;
  } catch (e) {
    throw new ScraperError(
      `Seekingalpha default handler for symbol [${symbol}] failed parsing`
    );
  }

  return;
};

const scraperHandler: ScraperHandler<SeekingAlphaData> = {
  name,
  baseUrl,
  tickerUrl,
  defaultHandler,
  fetch: fetchData,
  rawToTicker,
};

export default scraperHandler;
