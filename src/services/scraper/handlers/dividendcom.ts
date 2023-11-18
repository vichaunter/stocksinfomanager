import { load as cheerioLoad } from "cheerio";
import pc from "picocolors";
import { formatDate, parseDate } from "../../../utils";
import { ScraperHandler } from "../../../types";

const name = "dividend.com";
const baseUrl = `https://www.dividend.com`;

const parse = (source: string): Record<string, string> => {
  if (!source) {
    console.log(`${pc.yellow("Missing source skipping...")}`);
    return;
  }
  const $ = cheerioLoad(source);

  const rows = [];
  const mapped = {};
  const cells = $(
    `div.t-flex.t-text-lg.t-font-medium.t-leading-tighter.t-h-5.t-mt-1.t-mb-3.md\\:t-mt-1.md\\:t-mb-1`
    // `.md\\:t-w-2/5 .sm\\:t-mr-4 .t-flex .t-flex-col .t-mr-0 .t-w-full`
  );
  mapped["nextPayDate"] = $(cells[1]).text();

  const nextExtCells = $(`div.t-flex.t-font-medium.t-text-xs.xl\\:t-mb-2`);

  mapped["nextExDate"] = $(cells[3]).text(); //.replace("Ex-Date:", "").trim();

  if (mapped["nextPayDate"])
    mapped["nextPayDate"] = formatDate(parseDate(mapped["nextPayDate"]));
  if (mapped["nextExDate"])
    mapped["nextExDate"] = formatDate(parseDate(mapped["nextExDate"]));

  return mapped;
};

const tickerUrl = (ticker: string) => `${baseUrl}/quote.ashx?t=${ticker}`;

const scraperHandler: ScraperHandler = {
  name,
  baseUrl,
  tickerUrl,
  parse,
};

export default scraperHandler;
