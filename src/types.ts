import { Request, Response } from "express";
import TickerModel from "./models/tickerModel";
import { SeekingAlphaData } from "./services/scraper/handlers/types/seekingAlphaTypes";
import { NasdaqRawData } from "./services/scraper/handlers/types/nasdaqTypes";

export type RouteHanlder = (req: Request, res: Response) => any;

export enum SortMode {
  asc,
  desc,
}

export type HandlersData = SeekingAlphaData | NasdaqRawData;

export type ScraperHandler<T> = {
  name: string;
  baseUrl: string;
  tickerUrl: (symbol) => string;
  parse?: (source: string) => Record<string, string>;
  defaultHandler?: (symbol: string) => Promise<string | void>;
  mode?: "standalone";
  fetch?: ({
    item,
    url,
  }: {
    item: TickerModel;
    url: string;
  }) => Promise<Record<string, any>>;
  rawToTicker?: (symbol: string, raw: T) => TickerModel;
};
