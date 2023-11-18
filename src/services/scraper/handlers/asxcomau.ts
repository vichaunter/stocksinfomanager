import { load as cheerioLoad } from "cheerio";
import pc from "picocolors";
import { camelizeText, cleanNumber } from "../../../utils";
import { ScraperHandler } from "../../../types";

const name = "asx.com.au";
const baseUrl = ``;
const tickerUrl = (symbol) => ``;

const keyMap = {
  dividendAmount: "dividend",
  annualYield: "dividendYield",
  previousClose: "price",
};

const parse = (source: string): Record<string, string> => {
  if (!source) {
    console.log(`${pc.yellow("Missing source skipping...")}`);
    return;
  }
  const $ = cheerioLoad(source);

  const data = {};
  // extract tables data
  const tables = $(`table.table.table-nv`);
  tables.each((i, table) => {
    $(table).each((i, element) => {
      $(element)
        .find("tr")
        .each((i, row) => {
          const key = camelizeText($(row).find("th").text());
          const value = cleanNumber($(row).find("td").text());
          data[key] = value;
        });
    });
    2;
  });

  //extract charts data
  // const charts = $(`figure`);
  // charts.each((i, chart) => {
  //   const caption = $(chart).find("figcaption");
  //   if (caption.text().trim() === "Dividends") {
  //     const gs = $(chart).find("g");
  //     gs.each((i, g) => {
  //       const texts = $(g).find("text");
  //       if (texts.length === 2) {
  //         const month = $(texts[0]).text();
  //         const year = $(texts[1]).text();
  //         console.log({ month, year });
  //       }
  //     });
  //   }
  // });

  const mapped = {};
  Object.keys(keyMap).map((k) => {
    mapped[keyMap[k]] = data[k];
  });

  return mapped;
};

const scraper: ScraperHandler = {
  name,
  baseUrl,
  tickerUrl,
  parse,
};

export default scraper;
