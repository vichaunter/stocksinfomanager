import dayjs from "dayjs";
import ScraperError from "../../../errors/scraperError";
import TickerModel from "../../../models/tickerModel";
import { ScraperHandler } from "../../../types";
import { cleanNumber, formatDate, sleep } from "../../../utils";
import database from "../../database";

const name = "nasdaq";
const baseUrl = `https://www.nasdaq.com`;
const apiUrl = `https://api.nasdaq.com/api`;
// https://api.nasdaq.com/api/quote/TEF/historical?assetclass=stocks&fromdate=1900-01-01&limit=99999&todate=2023-11-12
// https://api.nasdaq.com/api/quote/TEF/dividends?assetclass=stocks
// https://api.nasdaq.com/api/company/TEF/financials?frequency=1

const getUrls = (symbol: string) => ({
  main: `https://api.nasdaq.com/api/quote/${symbol}/info?assetclass=stocks`,
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

  const converted = {
    price: cleanNumber(data.main?.primaryData?.lastSalePrice),
    exDividendDate: formatDate(data.dividends?.exDividendDate),
    annualizedDividend: cleanNumber(data.dividends?.annualizedDividend),
    dividendYield: cleanNumber(data.dividends?.yield),
  };

  return converted;
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

const scraperHandler: ScraperHandler = {
  name,
  baseUrl,
  tickerUrl,
  fetch: fetchData,
  defaultHandler,
};

export default scraperHandler;
