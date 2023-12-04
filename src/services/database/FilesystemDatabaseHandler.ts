import {
  Gzip,
  decompressSync,
  gzipSync,
  inflateSync,
  zlibSync,
  strToU8,
  compressSync,
} from "fflate";
import pc from "picocolors";
import fs from "node:fs";
import path from "node:path";
import { PATHS } from "../../constants";
import TickerModel from "../../models/tickerModel";
import DatabaseHandler from "./DatabaseHandler";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { formatDate, sortObjByKeys } from "../../utils";

async function compressAndWriteFile(filePath, data) {
  const jsonData = JSON.stringify(data, null, 2);
  const compressedData = zlibSync(strToU8(jsonData), { level: 9 });
  fs.writeFileSync(filePath, compressedData);
  console.log("File compressed and written successfully.");
  return true;
}

// Function to read a compressed file and decompress data
async function readAndDecompressFile(filePath) {
  const compressedData = fs.readFileSync(filePath);
  const decompressedData = decompressSync(compressedData);
  const decoded = new TextDecoder().decode(decompressedData);
  const jsonData = JSON.parse(decoded);
  console.log("File read and decompressed successfully.");
  return jsonData;
}

const updateOrCreate = async (path: string, data: any) => {
  let current: any = {};
  try {
    const currentRaw = fs.readFileSync(path, {
      encoding: "utf-8",
    });
    current = JSON.parse(currentRaw);
  } catch (e) {
    fs.writeFileSync(path, JSON.stringify(current));
  }

  const newData = sortObjByKeys({
    ...(current ?? {}),
    ...data,
  });

  fs.writeFileSync(path, JSON.stringify(data, null, 2));

  return newData;
};

class FilesystemDatabaseHandler extends DatabaseHandler {
  async init() {
    console.log("Init FilesystemDb");
    if (!fs.existsSync(PATHS.tickers)) {
      return !!fs.mkdirSync(PATHS.tickers, { recursive: true });
    }

    return true;
  }

  getTickerHandlers(tickerId: string): Promise<
    {
      id: string;
      tickerId: string;
      url: string;
      enabled: boolean;
      updatedAt: Date;
    }[]
  > {
    throw new Error("Method not implemented.");
  }

  async saveTickerError(ticker: TickerModel, error: any): Promise<boolean> {
    try {
      if (!ticker.id)
        throw Error(
          `[saveTickerError] Invalid ticker not in database: ${ticker.symbol}, Skipping...`
        );

      const storedTicker = await this.getTicker(ticker.symbol);
      storedTicker.saveError(error);

      return true;
    } catch (e) {
      console.log(pc.red(e));
      return false;
    }
  }

  addTicker(symbol: string): Promise<{
    id: string;
    symbol: string;
    error: Prisma.JsonValue;
    updatedAt: Date;
  }> {
    throw new Error("Method not implemented.");
  }

  async getTicker(
    symbol: TickerModel["symbol"]
  ): Promise<TickerModel | undefined> {
    const tickerFile = PATHS.tickerFile(symbol);

    if (!fs.existsSync(tickerFile)) return;

    return new TickerModel(JSON.parse(fs.readFileSync(tickerFile, "utf-8")));
  }

  async getRawTicker(symbol: string): Promise<Record<string, any>> {
    const tickerFile = PATHS.rawFile(symbol);
    console.log(tickerFile);
    if (!fs.existsSync(tickerFile)) return;

    // const rawData = fs.readFileSync(tickerFile, "utf-8");
    const rawData = await readAndDecompressFile(tickerFile);

    return rawData;
  }

  async getTickers(): Promise<TickerModel[]> {
    const list = await this.getTickersList();
    const data = [];

    for (let i = 0; i < list.length; i++) {
      const symbol = list[i];
      const ticker = await this.getTicker(symbol);
      ticker && data.push(ticker);
    }

    console.log(data);
    //TODO: check this
    return data as TickerModel[];
  }

  async getTickersList(): Promise<string[]> {
    return fs
      .readdirSync(PATHS.tickers)
      .filter((st) => path.basename(st) !== ".gitignore")
      .map((filePath) => path.basename(filePath, path.extname(filePath)));
  }

  async saveTicker(ticker: TickerModel): Promise<boolean> {
    try {
      if (Object.keys(ticker).length < 1)
        throw Error(
          pc.yellow(`Data was not provider to save [${ticker.symbol}]`)
        );

      if (!ticker.updatedAt) ticker.updatedAt = new Date();

      const newData = sortObjByKeys({
        ...ticker,
        updatedAt: formatDate(dayjs(new Date())),
      });

      await updateOrCreate(PATHS.tickerFile(ticker.symbol), newData);

      return true;
    } catch (e) {
      return false;
    }
  }

  async saveRaw(handler: string, symbol: string, data: any): Promise<void> {
    let current: any = {};
    try {
      current = await readAndDecompressFile(PATHS.rawFile(symbol));
      // const currentRaw =
      // fs.readFileSync(PATHS.rawFile(symbol), {
      //   encoding: "utf-8",
      // });
      // current = JSON.parse(currentRaw);
    } catch (e) {
      await compressAndWriteFile(PATHS.rawFile(symbol), current);
      // fs.writeFileSync(PATHS.rawFile(symbol), JSON.stringify(current));
    }

    console.log("saveRaw current:", Object.keys(current));

    const newData = {
      ...(current ?? {}),
      [handler]: data,
    };

    compressAndWriteFile(PATHS.rawFile(symbol), newData);
    //fs.writeFileSync(PATHS.rawFile(symbol), JSON.stringify(newData, null, 2));
  }
}

export default FilesystemDatabaseHandler;
