import { Request, Response } from "express";
import TickerModel from "./models/tickerModel";

export type RouteHanlder = (req: Request, res: Response) => any;

export enum SortMode {
  asc,
  desc,
}

export type ScraperHandler = {
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
};
