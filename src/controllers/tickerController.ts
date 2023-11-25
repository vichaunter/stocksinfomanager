import TickerModel from "../models/tickerModel";
import { errorWrapper } from "../routes";
import database from "../services/database";
import updater from "../services/updater";
import { RouteHanlder } from "../types";

const getTicker: RouteHanlder = (req, res) => {
  errorWrapper(res, async () => {
    let { ticker, key } = req.params as { ticker: string; key: string };

    const dbTicker = await database.getTicker(ticker);

    const tickerModel = new TickerModel(dbTicker);
    const data = await tickerModel.getData();

    if (!data) {
      updater.addTickerToUpdate(tickerModel);
      res.status(503).send({
        status: "unavailable",
        message: "first load may take a while",
      });
      return;
    }

    const keyData = key && tickerModel.getKeyData(key);
    if (keyData) {
      return res.status(200).send(keyData);
    }

    return res.status(200).send({
      status: "success",
      ticker,
      data,
    });
  });
};

const getTickers: RouteHanlder = async (_, res) => {
  const tickers = await TickerModel.getTickersFlatData();

  return res.status(200).send(tickers ?? []);
};

const addTicker: RouteHanlder = async (req, res) => {
  let { symbol } = req.body;

  if (!symbol) {
    res.status(500).send({
      status: 0,
      error: `Missing parameter symbol`,
    });
  }

  const ticker = await TickerModel.addTicker({ symbol });

  return res.status(200).send(ticker);
};

const updateTicker: RouteHanlder = async (req, res) => {
  let { ticker } = req.params as { ticker: string };
  if (ticker) {
    const dbTicker = await database.getTicker(ticker);

    await updater.updateTicker(dbTicker);

    const updated = await database.getTicker(ticker);
    return res.status(200).send(updated);
  }
};

export default { getTicker, getTickers, addTicker, updateTicker };
