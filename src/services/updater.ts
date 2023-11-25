import pc from "picocolors";
import TickerModel from "../models/tickerModel";
import database from "./database";
import { Browser } from "puppeteer";
import * as scraperHandlers from "./scraper/handlers";
import { browser } from "./browser";
import { ScraperHandler } from "../types";

type TickerToUpdateHandler = (ticker: TickerModel) => void;

export type QueueItem = TickerModel;

const queue: QueueItem[] = [];

type GetTickerDataProps = {
  item: TickerModel;
  url: string;
  parser: ScraperHandler;
};
const getTickerData = async ({ item, url, parser }: GetTickerDataProps) => {
  let parsed;
  if (parser.mode === "standalone") {
    const source = await browser.getPageSourceHtml(url);
    parsed = parser.parse(source);
  } else {
    parsed = await parser.fetch({ item, url });
  }

  console.log(pc.blue(parser.name), pc.green(url));
  console.log("parsed:", item.symbol);
  console.log(``);

  return parsed;
};

const updateTicker = async (item: QueueItem) => {
  try {
    process.env.DEBUG &&
      console.log("updateTicker_handlers:", item.tickerHandlers);

    const promises = [...item.tickerHandlers, ...item.getDefaultHandlers()]
      .filter((h) => h.enabled) //remove disabled handlers
      .map((handler) => {
        return new Promise<{
          key: string;
          data: Record<string, string | string[]>;
        }>(async (resolve, reject) => {
          const parser = scraperHandlers?.[handler.id];
          if (!parser || !handler.url)
            return reject(
              new Error(`Missing parser or handler url for ${item.symbol}`)
            );

          try {
            const data = await getTickerData({
              item,
              url: handler.url,
              parser,
            });

            if (data) {
              return resolve({ key: parser.name, data });
            }

            throw Error("Data not found");
          } catch (error) {
              await database.saveTickerError(item, {name: error.name, message: error.message})
            return reject(error);
          }
        });
      });

    const response = await Promise.all(promises.flat());
    if (process.env.DEV) return response;

    response.forEach((parsed) => {
      parsed.data && item.setData(parsed.data as any);
    });

    const saved = await item.saveTicker();
    if (saved) {
      console.log(pc.green(`${item.symbol} saved`));
    } else {
      console.log(pc.red(`${item.symbol} error saving`));
    }
    console.log(`☰☰☰`);
  } catch (error) {
    console.log(pc.bgYellow("!! Skipping ticker"), { error });
  }

  return undefined;
};

/**
 * Adds a new ticker to be retrieved
 */
const addTickerToUpdate: TickerToUpdateHandler = async (ticker) => {
  if (queue.find((q) => q.symbol === ticker.symbol)) return;

  const dbTicker = database.getTicker(ticker.symbol);
  if (!dbTicker) {
    queue.unshift(ticker);
  } else {
    queue.push(ticker);
  }
};

/**
 * Infinite loop that updates all the existing tickers that we
 * know, usually already stored ones or new added by api call
 */
const tickerUpdaterService = async () => {
  // get ticker from the queue removing it
  const nextTicker = queue.shift();
  if (nextTicker?.symbol) {
    console.log(``);
    console.log(pc.white(`----`));
    console.log(pc.blue(`let's update the ticker: ${nextTicker.symbol}`));
    console.log(pc.white(`----`));

    await updateTicker(nextTicker);

    // let's do one each xx seconds
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(true);
      }, (Math.random() * 5 + 10) * 1000);
    });

    // add it again at the end of the queue
    addTickerToUpdate(nextTicker);
    tickerUpdaterService();
  } else {
    console.log(
      pc.yellow(
        `${pc.red("!!")}This is an incomplete ticker... removed from queue`
      )
    );

    setTimeout(() => {
      tickerUpdaterService();
    }, 60 * 1000);
  }
};

/**
 * Load current stored tickers to be updated from the filesystem
 */
const loadStoredTickers = async () => {
  const tickers = await TickerModel.getTickers();

  //pick older updated first
  tickers.sort((a, b) => (a.updatedAt as any) - (b.updatedAt as any));

  const tickersWithoutErrors = tickers.filter((t) => !t.tickerData && !t.error);
  const validTickers = tickers.filter((t) => t.tickerData && !t.error);
  
  console.log("TICKERS", tickersWithoutErrors.length, validTickers.length);

  [...tickersWithoutErrors, ...validTickers].forEach((ticker) => {
    queue.push(ticker);
  });

  // console.log(queue);
  return queue;
};

export default {
  addTickerToUpdate,
  tickerUpdaterService,
  loadStoredTickers,
  updateTicker,
};
