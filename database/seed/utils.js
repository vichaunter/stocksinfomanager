const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const saveDbToLocal = async () => {
  const tickers = await prisma.ticker.findMany({
    include: {
      tickerData: true,
      tickerHandlers: {
        include: {
          ticker: true,
        },
      },
    },
  });

  copyFileSync(
    path.join(__dirname, "tickers.json"),
    path.join(__dirname, "tickers.prev.json")
  );

  fs.writeFile(
    path.join(__dirname, "tickers.json"),
    JSON.stringify(tickers, null, 4),
    (err) => {
      if (err) {
        console.error("Error writing to the file:", err);
      } else {
        console.log("Data saved to updatedTickers.json");
      }
    }
  );
};

/**
 *
 * @param {string} symbol
 * @returns {Promise}
 */
const fetchTicker = (symbol) => {
  return prisma.ticker.findFirst({
    where: { symbol },
  });
};

/**
 *
 * @param {{symbol: string}} ticker
 */
const createNewTicker = async (symbol) => {
  return await prisma.ticker.create({
    data: {
      symbol,
    },
  });
};

const copyFileSync = (from, to, overwrite = true) => {
  if (overwrite && fs.existsSync(to)) {
    fs.unlinkSync(to);
  }

  return fs.copyFileSync(from, to);
};

module.exports = {
  saveDbToLocal,
  fetchTicker,
  createNewTicker,
  copyFileSync,
};
