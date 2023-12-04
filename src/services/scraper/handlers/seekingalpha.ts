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

//https://seekingalpha.com/api/v3/symbol_data?fields[]=dividends&,fields[]=divDistribution&,fields[]=peRatioFwd&,fields[]=lastClosePriceEarningsRatio&,fields[]=estimateFfo&,fields[]=ffoPerShareDiluted&,fields[]=estimateEps&,fields[]=dilutedEpsExclExtraItmes&,fields[]=debtEq&,fields[]=totDebtCap&,fields[]=ltDebtEquity&,fields[]=ltDebtCap&,fields[]=totLiabTotAssets&,fields[]=divDistribution&,fields[]=dividends&slugs=WEC
const dataFields = [
  "divDistribution",
  "peRatioFwd",
  "lastClosePriceEarningsRatio",
  "estimateFfo",
  "ffoPerShareDiluted",
  "estimateEps",
  "dilutedEpsExclExtraItmes",
  "debtEq",
  "totDebtCap",
  "ltDebtEquity",
  "ltDebtCap",
  "totLiabTotAssets",
  "dividends",
];

// https://seekingalpha.com/api/v3/metrics?filter[fields]=div_yield_fwd
const metricFields = [
  "dividend_yield",
  "div_rate_fwd",
  "div_rate_ttm",
  "payout_ratio",
  "div_grow_rate5",
  "dividend_growth",
  "price_high_52w",
  "price_low_52w",
  "div_yield_fwd",
  "short_interest_percent_of_float",
  "marketcap",
  "impliedmarketcap",
];

const URLS = {
  forMetrics: (symbol: string) =>
    `https://seekingalpha.com/api/v3/metrics?filter[fields]=${metricFields.join(
      "%2C"
    )}&filter[slugs]=${symbol}&minified=false`,
  forRealTimeQuotes: (id: number) =>
    `https://finance-api.seekingalpha.com/real_time_quotes?sa_ids=${id}`, //id comes from metrics
  forSymbolData: (symbol: string) =>
    `https://seekingalpha.com/api/v3/symbol_data?fields[]=${dataFields.join(
      "&fields[]="
    )}&slugs=${symbol}`, //here is dividend dates
};

// const keyMap = {
//   "Div Yield (FWD)": "dividendYield",
//   "Annual Payout (FWD)": "dividendAnnualPayout",
//   "Payout Ratio": "dividendPayoutRatio",
//   "5 Year Growth Rate": "dividend5YearGrowhthRate",
//   "Dividend Growth": "dividendYearsGrowhth",
//   Amount: "dividendAmount",
//   "Ex-Div Date": "dividendExDate",
//   "Payout Date": "dividendPayoutDate",
//   "Record Date": "dividendRecordDate",
//   "Declare Date": "dividendDeclareDate",
//   "Div Frequency": "dividendFrequency",
// };

// const keyNumbers = [
//   "dividendYield",
//   "dividendAnnualPayout",
//   "dividendPayoutRatio",
//   "dividend5YearGrowhthRate",
//   "dividendYearsGrowhth",
//   "dividendAmount",
// ];
// const keyDates = [
//   "dividendExDate",
//   "dividendPayoutDate",
//   "dividendRecordDate",
//   "dividendDeclareDate",
// ];

// const formatValue = (key: string, value: string) => {
//   if (keyNumbers.includes(key)) {
//     return cleanNumber(value);
//   }
//   if (keyDates.includes(key)) {
//     return formatDate(value);
//   }

//   return value;
// };

// const parse = (
//   source: string
// ): [Record<string, string>, Record<string, string>] => {
//   if (!source) {
//     console.log(`${pc.yellow("Missing source skipping...")}`);
//     return;
//   }

//   const $ = cheerioLoad(source);
//   const data = $(`div[data-test-id="scorecard-section-content"]`);

//   const found = $(`div:contains('Div Yield (FWD)')`);
//   let dividendSummaryBlock = found;
//   if (dividendSummaryBlock.length > 0) {
//     const title = dividendSummaryBlock.text();
//     const value = dividendSummaryBlock.next("div").text();
//     console.log("found", title, value);
//   } else {
//     console.log("not found the block", $.text());
//   }

//   const extracted = {};
//   const raw = {};
//   data.each((i, block) => {
//     $(block)
//       .find("div")
//       .each((y, row) => {
//         const rowData = $(row).find("div");
//         const label = $(rowData[0]).text();
//         const value = $(rowData[1]).text();
//         if (value && label && keyMap[label]) {
//           raw[label] = value;
//           extracted[keyMap[label]] = formatValue(keyMap[label], value);
//         }
//       });
//   });

//   return [extracted, raw];
// };

const fetchData = async ({ item }) => {
  // const html = await browser.getPageSourceHtml(url);

  const symbolUrls = [URLS.forMetrics, URLS.forSymbolData];
  const idUrls = [URLS.forRealTimeQuotes];

  const raw: any = {};
  for (let symbolUrl of symbolUrls) {
    const response = await fetch(symbolUrl(item.symbol)).then((res) =>
      res.json()
    );
    if (!response.blockScript) {
      raw[symbolUrl.name] = response;
    }
    await sleep(1000);
  }

  const id = raw?.forMetrics?.included?.find((o) => o.type === "ticker")?.id;

  if (id) {
    for (let idUrl of idUrls) {
      const response = await fetch(idUrl(id)).then((res) => res.json());
      if (!response.blockScript) {
        raw[idUrl.name] = response;
      }
    }
    await sleep(1000);
  }

  database.saveRaw(name, item.symbol, raw);

  return raw;
};

const getMetric = (raw: SeekingAlphaData, id: string) =>
  raw.forMetrics?.data?.find(
    (m) =>
      m.relationships?.metric_type?.data?.type === "metric_type" &&
      m.relationships?.metric_type?.data?.id === id
  );

const rawToTicker = <T extends SeekingAlphaData>(
  symbol: string,
  raw: T
): TickerModel => {
  let model = new TickerModel();

  model.symbol = symbol;

  const tickerRealTimeQuote = raw.forRealTimeQuotes?.real_time_quotes.find(
    (q) => symbol === q.symbol
  );
  if (tickerRealTimeQuote) {
    model.price = tickerRealTimeQuote.last;
  }

  const dividendYield = getMetric(raw, "30");
  if (dividendYield) model.setDividendYield(dividendYield.attributes.value);

  const dividendYearsGrowhth = getMetric(raw, "41");
  if (dividendYearsGrowhth)
    model.setDividendYearsGrowhth(dividendYearsGrowhth.attributes.value);

  const dividend5YearGrowhthRate = getMetric(raw, "100");
  if (dividend5YearGrowhthRate)
    model.setDividend5YearGrowhthRate(
      dividend5YearGrowhthRate.attributes.value
    );

  const dividendAnnualPayout = getMetric(raw, "234839");
  if (dividendAnnualPayout)
    model.setDividendAnnualPayout(dividendAnnualPayout.attributes.value);

  const dividendPayoutRatio = getMetric(raw, "234841");
  if (dividendPayoutRatio)
    model.setDividendPayoutRatio(dividendPayoutRatio.attributes.value);

  const dividendDates =
    raw.forSymbolData?.data?.[0]?.attributes?.dividends?.[0];
  if (dividendDates) {
    model.setDividendExDate(dividendDates.exDate);
    model.setDividendPayoutDate(dividendDates.payDate);
    model.setDividendRecordDate(dividendDates.recordDate);
    model.setDividendDeclareDate(dividendDates.declareDate);
  }

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
