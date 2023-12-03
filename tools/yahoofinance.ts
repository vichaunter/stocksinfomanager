//@ts-nocheck
import dayjs from "dayjs";
import { formatDate } from "../src/utils";

async function getDividendHistory() {
  const now = dayjs(new Date()).startOf("day").unix();
  const ticker = "T";
  const res = await fetch(
    `https://query1.finance.yahoo.com/v7/finance/download/${ticker}?period1=-999999252374400&period2=${now}&interval=1d&events=div&includeAdjustedClose=true`
  );

  const csv = await res.text();
  const data = csv.split("\n").map((l) => l.split(","));
  const headers = data.shift();
  const values = data.map(([date, dividend]) => [
    formatDate(date),
    Number(dividend),
  ]);

  //sort descending by date
  values.sort((a, b) => (dayjs(a[0]).isAfter(dayjs(b[0])) ? -1 : 1));

  console.log(headers, values);
}

getDividendHistory();
