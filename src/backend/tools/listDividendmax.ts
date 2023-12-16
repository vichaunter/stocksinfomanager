//@ts-nocheck
import fs from "node:fs";
import path from "node:path";
import pp from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import request from "request";
import { CheerioAPI, load as cheerioLoad } from "cheerio";

type Instrument = {
  symbol: string;
  url: string;
};

const FILE = "dividendmaxInstruments.json";

function getUrl(page: number) {
  return `https://www.dividendmax.com/company-dividend-coverage?page=${page}`;
}

async function saveInstruments(instruments: Instruments[]) {
  const fileRaw = fs.readFileSync(path.join(__dirname, FILE), "utf-8");

  const stored: Instrument[] = JSON.parse(fileRaw);

  instruments.forEach((instrument) => {
    if (stored.find((s) => s.url === instrument.url)) return;
    stored.push(instrument);
  });

  stored.sort((a, b) => (a.symbol < b.symbol ? -1 : 1));

  fs.writeFileSync(FILE, JSON.stringify(stored, null, 2));
}

async function getPageContent(pagenum: number) {
  pp.use(StealthPlugin());
  const browser = await pp.launch({
    // headless: "new",
  });
  const page = await browser.newPage();
  await page.goto(getUrl(pagenum));

  return page.content();
}

function getInstruments(source: string): Instrument[] {
  const $ = cheerioLoad(source);
  const instruments: Instrument[] = [];
  const items = $("td.mdc-data-table__cell a");
  items.map((i, it) => {
    const item = $(it);
    const match = item.text().match(/\((.*?)\)/);
    if (match) {
      const url = item.attr("href");
      instruments.push({
        symbol: match[1],
        url: `https://www.dividendmax.com${url}`,
      });
    }
  });

  return instruments;
}

async function sleep(ms: number = 1000): Promise<boolean> {
  new Promise((res, rej) =>
    setTimeout(() => {
      res(true);
    }, ms)
  );
}

async function saveList() {
  const source = await getPageContent(1);

  const $ = cheerioLoad(source);
  const paginationRaw = $("div.page-entry-info")?.text();
  const totalEntries = paginationRaw.split("of ")[1];

  const totalPages = Math.ceil(totalEntries / 30);
  const firstPageInstruments = getInstruments(source);
  saveInstruments(firstPageInstruments);

  //   for (let p = 76; p <= totalPages; p++) {
  //     const source = await getPageContent(p);
  //     saveInstruments(getInstruments(source));
  //     console.log(`Saved page ${p}/${totalPages}`);
  //     await sleep(2000);
  //   }
}

saveList();
