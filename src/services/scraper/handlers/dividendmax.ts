import { load as cheerioLoad } from "cheerio";
import dayjs from "dayjs";
import pc from "picocolors";
import { formatDate, parseDate } from "../../../utils";
import { ScraperHandler } from "../../../types";

const name = "dividendmax.com";
const baseUrl = "";
const tickerUrl = (symbol) => ``;

const parse = (source: string): Record<string, string> => {
  if (!source) {
    console.log(`${pc.yellow("Missing source skipping...")}`);
    return;
  }
  const $ = cheerioLoad(source);

  const forecastExDates = [];
  // extract tables data
  const table = $(`table[aria-label*="Declared and forecast"]`);
  const allRows = table.find("tr");
  const rows = allRows.filter((_, row) =>
    $(row).find("td:first-child").text().includes("Forecast")
  );

  rows.each((_, row) => {
    const exdateCell = $(row).find("td:eq(3)");
    if (exdateCell.text()) {
      forecastExDates.push(parseDate(exdateCell.text()));
    }
  });

  forecastExDates.sort((a, b) => {
    const aDiff = dayjs(a).diff(dayjs(), "day");
    const bDiff = dayjs(b).diff(dayjs(), "day");
    return aDiff - bDiff;
  });

  const mappedDates = forecastExDates.map((date) => formatDate(date));

  return { nextExDate: mappedDates[0] };
};

const scraperHandler: ScraperHandler = {
  name,
  baseUrl,
  tickerUrl,
  parse,
};

export default scraperHandler;
