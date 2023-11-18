import path from "node:path";

var BASE_PATH = process.cwd();
if (process.env.VERCEL_ENV === "production") {
  BASE_PATH = "/data";
}
export const PATHS = {
  base: BASE_PATH,
  data: path.join(BASE_PATH, "data"),
  tickers: path.join(BASE_PATH, "data", "tickers"),
  tickerFile: (ticker: string) =>
    path.join(BASE_PATH, "data", "tickers", `${ticker}.json`),
};
