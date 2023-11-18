const pc = require("picocolors");
const { createNewTicker, saveDbToLocal, fetchTicker } = require("./utils");
const tickers = require("./createTickers.json") || [];

const run = async () => {
  for (let symbol of tickers) {
    try {
      const exists = !!(await fetchTicker(symbol));
      if (exists) {
        console.log(
          pc.yellow(`Ticker [${symbol}] already exists, skipping...`)
        );
        continue;
      }

      const newTicker = await createNewTicker(symbol);
      console.log(
        pc.green(
          `Ticker [${symbol}] correctly created with id [${newTicker.symbol}]`
        )
      );

      saveDbToLocal();
    } catch (e) {
      console.log(pc.red(`Error creating [${symbol}]`), e);
    }
  }
};

run();
