//@ts-nocheck

const dayjs = require("dayjs");
const utils = require("./utils");

const prices = [
  { symbol: "ARCB", price: 118.0701 },
  { symbol: "NTB", price: 26.79 },
  { symbol: "CSTR", price: 15.95 },
  { symbol: "CBAN", price: 10.1816 },
  { symbol: "CCK", price: 82.32 },
  { symbol: "DCOMP", price: 15.6118 },
  { symbol: "EIG", price: 38.64 },
  { symbol: "EQT", price: 42.3525 },
  { symbol: "FHI", price: 32.54 },
  { symbol: "GLP", price: 32.185 },
  { symbol: "GBX", price: 36.79 },
  { symbol: "HNVR", price: 17.7129 },
  { symbol: "HMST", price: 6.2814 },
  { symbol: "KRNY", price: 7.4117 },
  { symbol: "KVUE", price: 19.35 },
  { symbol: "LH", price: 208.82 },
  { symbol: "MDC", price: 41.92 },
  { symbol: "MAIN", price: 40.555 },
  { symbol: "MKTX", price: 218.662 },
  { symbol: "NFBK", price: 9.2816 },
  { symbol: "POOL", price: 327.8126 },
  { symbol: "SASR", price: 21.7768 },
  { symbol: "ST", price: 31.86 },
  { symbol: "SFBC", price: 36.3688 },
  { symbol: "SCCO", price: 73.23 },
  { symbol: "FBMS", price: 25.6137 },
  { symbol: "URI", price: 437.06 },
  { symbol: "UVSP", price: 17.5575 },
  { symbol: "WCN", price: 132.135 },
  { symbol: "WTBA", price: 17.0291 },
  { symbol: "WST", price: 333.03 },
  { symbol: "WNEB", price: 7.3308 },
  { symbol: "WT", price: 6.38 },
  { symbol: "CCK", price: 82.32 },
  { symbol: "EQT", price: 42.3525 },
  { symbol: "SXI", price: 138.18 },
  { symbol: "WST", price: 333.03 },
  { symbol: "MDC", price: 41.92 },
  { symbol: "LH", price: 208.82 },
  { symbol: "GBX", price: 36.79 },
  { symbol: "SCCO", price: 73.23 },
  { symbol: "URI", price: 437.06 },
  { symbol: "FHI", price: 32.54 },
  { symbol: "GLP", price: 32.185 },
  { symbol: "EIG", price: 38.64 },
  { symbol: "WT", price: 6.38 },
  { symbol: "NTB", price: 26.79 },
  { symbol: "MAIN", price: 40.555 },
  { symbol: "ST", price: 31.86 },
  { symbol: "WCN", price: 132.135 },
];

async function fetchQuotes(tickers) {
  const prices = [];
  for (const symbol of tickers) {
    const etoroInstrument = utils.getEtoroInstrument(symbol);
    if (etoroInstrument && etoroInstrument.IsInternalInstrument) {
      console.log("skip in eToro but internal:", symbol);
      continue;
    } else if (!etoroInstrument) {
      console.log("skip not eToro:", symbol);
      continue;
    }

    console.log(symbol);
    const url = `https://api.iex.cloud/v1/data/CORE/QUOTE/${symbol}?token=pk_93a0f87519724029a21e119e44934e39`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();

        if (data.length > 0) {
          const latestData = data[data.length - 1];
          latestData && prices.push({ symbol, price: latestData.latestPrice });
        } else {
          console.error(`No data available for ${symbol}`);
        }
      } else {
        console.error(`Failed to fetch data for ${symbol}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return prices;
}

async function fetchDate(date) {
  const dateStr = dayjs(date).format("YYYY-MM-DD");

  return fetch(
    `https://api.nasdaq.com/api/calendar/dividends?date=${dateStr}`,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "es-ES,es;q=0.9",
        "sec-ch-ua": '"Opera";v="103", "Not;A=Brand";v="8", "Chromium";v="117"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
      referrer: "https://www.nasdaq.com/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "omit",
    }
  )
    .then((res) => res.json())
    .then((jsonRes) => jsonRes.data);
}

async function main() {
  const data = await fetchDate(dayjs(new Date()).add(5, "days"));

  if (!data?.calendar?.rows?.length) {
    console.error("There is not rows for given date");
  }

  const rows = utils.removeDuplesByKey(data?.calendar?.rows, "symbol");
  const symbols = rows.map((item) => item.symbol);
  const prices = await fetchQuotes(symbols);

  const fullData = rows
    .map((ticker) => {
      const price = prices.find((price) => {
        return price.symbol === ticker.symbol;
      })?.price;

      const yield = price
        ? (ticker.indicated_Annual_Dividend / price) * 100
        : null;

      return {
        ...ticker,
        price,
        yield,
      };
    })
    .filter((item) => !!item.price && item.yield > 5)
    .sort((a, b) => b.yield - a.yield);

  console.log("fullData", fullData);
}

main();
