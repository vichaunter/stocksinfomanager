import dayjs from "dayjs";
import ScraperError from "../../../errors/scraperError";
import TickerModel from "../../../models/tickerModel";
import { ScraperHandler } from "../../../types";
import {
  formatDate,
  getDividendFrequency,
  getLastYearsPayingCount,
  sleep,
} from "../../../utils";
import database from "../../database";
import { NasdaqRawData } from "./types/nasdaqTypes";

const name = "nasdaq";
const baseUrl = `https://www.nasdaq.com`;
const apiUrl = `https://api.nasdaq.com/api`;
// https://api.nasdaq.com/api/quote/TEF/historical?assetclass=stocks&fromdate=1900-01-01&limit=99999&todate=2023-11-12
// https://api.nasdaq.com/api/quote/TEF/dividends?assetclass=stocks
// https://api.nasdaq.com/api/company/TEF/financials?frequency=1

const getUrls = (symbol: string) => ({
  main: `https://api.nasdaq.com/api/quote/${symbol}/info?assetclass=stocks`,
  profile: `https://api.nasdaq.com/api/company/${symbol}/company-profile`,
  financials: `${apiUrl}/company/${symbol}/financials?frequency=1`,
  dividends: `${apiUrl}/quote/${symbol}/dividends?assetclass=stocks`,
  historical: `${apiUrl}/quote/${symbol}/historical?assetclass=stocks&fromdate=1900-01-01&limit=99999&todate=${dayjs(
    new Date()
  ).format("YYYY-MM-DD")}`,
});

const fetchData = async ({
  url,
  item,
}: {
  url?: string;
  item?: TickerModel;
}): Promise<Record<string, any>> => {
  const urls = item ? getUrls(item.symbol) : { unknown: url };

  const data: any = {};
  const endpoints = Object.keys(urls);
  for (const endpoint of endpoints) {
    data[endpoint] = await fetch(urls[endpoint])
      .then((res) => res.json())
      .then((data: any) => data?.data);
    await sleep(1000);
  }

  database.saveRaw(name, item.symbol, data);

  return data;
};

const rawToTicker = <T extends NasdaqRawData>(
  symbol: string,
  raw: T
): TickerModel => {
  let model = new TickerModel();

  model.symbol = symbol;

  const price = raw?.main?.primaryData.lastSalePrice;
  if (price) {
    model.setPrice(price);
  }

  const sector = raw?.profile?.Sector.value;
  if (sector) model.setSector(sector);

  const industry = raw?.profile?.Industry.value;
  if (industry) model.setIndustry(industry);

  const dividendYield = raw?.dividends?.yield;
  if (dividendYield) model.setDividendYield(dividendYield);

  const dividendAnnualPayout = raw?.dividends?.annualizedDividend;
  if (dividendAnnualPayout) model.setDividendAnnualPayout(dividendAnnualPayout);

  const dividendPayoutRatio = raw?.dividends?.payoutRatio;
  if (dividendPayoutRatio) model.setDividendPayoutRatio(dividendPayoutRatio);

  const dividendDates = raw?.dividends?.dividends.rows?.[0];
  if (dividendDates) {
    model.setDividendExDate(dividendDates.exOrEffDate);
    model.setDividendPayoutDate(dividendDates.paymentDate);
    model.setDividendRecordDate(dividendDates.recordDate);
    model.setDividendDeclareDate(dividendDates.declarationDate);
    //TODO: determine when the stock pay dividends
  } else {
    model.setPayDividend(false);
  }

  const exDates = raw?.dividends?.dividends?.rows?.map(
    (dividend) => new Date(formatDate(dividend.exOrEffDate))
  );
  if (exDates?.length) {
    const frequency = getDividendFrequency(exDates);
    model.setDividendFrequency(frequency);

    const lastYearsPayingCount = getLastYearsPayingCount(exDates);
    model.setDividendLastYearsPayingCount(lastYearsPayingCount);
  }

  return model;
};

const tickerUrl = (ticker: string) =>
  `${apiUrl}/company/${ticker}/financials?frequency=1`;

const defaultHandler = async (symbol: string): Promise<string | void> => {
  const url = tickerUrl(symbol);

  try {
    fetchData({ url });

    return url;
  } catch (e) {
    throw new ScraperError(
      `Finviz default handler for symbol [${symbol}] failed parsing`
    );
  }
};

const scraperHandler: ScraperHandler<NasdaqRawData> = {
  name,
  baseUrl,
  tickerUrl,
  fetch: fetchData,
  defaultHandler,
  rawToTicker,
};

export default scraperHandler;
