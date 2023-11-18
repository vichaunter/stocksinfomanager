// @ts-nocheck
const { PrismaClient } = require("@prisma/client");
const localTickers = require("./tickers.json");
const pc = require("picocolors");
const { differenceWith } = require("ramda");
const { saveDbToLocal, createNewTicker } = require("./utils");
require("dotenv").config();

const prisma = new PrismaClient();

const tickersClone = [...localTickers];

const getLocalTicker = (symbol) => {
  return tickersClone.find((localTicker) => localTicker.symbol === symbol);
};

const seed = async () => {
  let dbTickers = await prisma.ticker.findMany();
  console.log(dbTickers);
  if (!dbTickers) {
    console.log(pc.red(`Ticker not found in database`));
    return;
  }

  //find and create missing tickers
  const missingSymbols = differenceWith(
    (a, b) => a.symbol === b.symbol,
    tickersClone,
    dbTickers
  );
  if (missingSymbols.length) {
    for (let i = 0; i < missingSymbols.length; i++) {
      const newTicker = await createNewTicker(missingSymbols[i].symbol);
      if (newTicker) tickersClone.push(newTicker);
      console.log({ newTicker });
    }
  }

  for (let i = 0; i < dbTickers.length; i++) {
    const dbTicker = dbTickers[i];
    console.log({ dbTicker });
    const localTicker = getLocalTicker(dbTicker.symbol);

    if (!dbTicker || !localTicker)
      return console.log(pc.yellow(`Skip ${dbTicker.symbol}`));

    await prisma.tickerHandler.upsert({
      where: { tickerId: dbTicker.id },
      update: {
        handlers: { set: localTicker.tickerHandlers.handlers },
      },
      create: {
        tickerId: dbTicker.id,
        handlers: { set: localTicker.tickerHandlers.handlers },
      },
    });
    console.log(pc.green(`Saved ticker ${dbTicker.symbol}`));
  }

  saveDbToLocal();
  return true;
};

seed();
