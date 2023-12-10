import { PrismaClient, TickerHandler } from "@prisma/client";
import pc from "picocolors";
import TickerModel from "../../models/tickerModel";
import DatabaseHandler, { DbGetTickersParams } from "./DatabaseHandler";
import { ApiTickersArgs } from "../../api/resolvers";

class MongoDBDatabaseHandler extends DatabaseHandler {
  getRawTicker(symbol: string): Promise<Record<string, any>> {
    throw new Error("Method not implemented.");
  }
  prisma: PrismaClient;

  async init() {
    console.log("Init mongoDb");
    this.prisma = new PrismaClient(
      process.env.DEBUG && {
        log: ["query", "info", "warn", "error"],
      }
    );
    return this;
  }

  async getTicker(ticker: TickerModel["symbol"]): Promise<TickerModel | null> {
    //mongodb get one ticker by id
    const result = await this.prisma.ticker.findFirst({
      where: {
        symbol: ticker,
      },
      include: {
        tickerData: true,
        tickerHandlers: true,
      },
    });

    return result ? new TickerModel(result) : null;
  }

  async getTickerHandlers(tickerId: string): Promise<TickerHandler[] | null> {
    const result = await this.prisma.tickerHandler.findMany({
      where: {
        tickerId: tickerId,
      },
    });

    return result;
  }

  async getTickers(args: ApiTickersArgs): Promise<TickerModel[] | null> {
    const result = await this.prisma.ticker.findMany({
      include: {
        tickerData: true,
        tickerHandlers: true,
      },
    });

    return result.map((t) => new TickerModel(t));
  }

  // async getTickersFlatData(): Promise<TickerFlatData[] | null> {
  //   const result = await this.getTickers();
  //   const flat = result.map((item) => {
  //     let data;
  //     if (item.tickerData) {
  //       const { id, tickerId, ...tickerData } = item.tickerData;
  //       data = tickerData;
  //     }
  //     return {
  //       id: item.id,
  //       symbol: item.symbol,
  //       error: item.error,
  //       data,
  //     };
  //   });

  //   return flat;
  // }

  async getTickersList(): Promise<string[]> {
    //mongodb ticker list table
    const result = await this.prisma.ticker.findMany();

    return result.map((ticker) => ticker.symbol);
  }

  async saveHandlers(ticker: TickerModel): Promise<boolean> {
    if (ticker.handlers.length < 1) return true;

    try {
      for (const handler of ticker.handlers) {
        await this.prisma.tickerHandler.upsert({
          where: { id: handler.id },
          update: {
            url: handler.url,
          },
          create: {
            url: handler.url,
            enabled: handler.enabled,
            ticker: { connect: ticker.id } as any,
          },
        });
      }

      return true;
    } catch (e) {
      console.log(`ERROR Saving handlers for [${ticker.symbol}]:`, pc.red(e));
    }

    return false;
  }

  async saveTickerError(ticker: TickerModel, error: any) {
    try {
      if (!ticker.id)
        throw Error(
          `[saveTickerError] Invalid ticker not in database: ${ticker.symbol}, Skipping...`
        );

      const update = this.prisma.ticker.update({
        where: { id: ticker.id },
        data: {
          updatedAt: new Date(),
          error,
        },
      });

      await this.saveHandlers(ticker);
      this.prisma.$transaction([update]);
      return true;
    } catch (e) {
      console.log(pc.red(e));
      return false;
    }
  }

  async saveTicker(ticker: TickerModel): Promise<boolean> {
    try {
      if (!ticker.price)
        throw Error(`Price missing for ticker ${ticker.symbol} Skipping...`);

      if (Object.keys(ticker).length < 1)
        throw Error(pc.yellow(`Data was not provider to save [${ticker}]`));

      const { id, ...tickerDataWithoutId } = ticker;
      process.env.DEBUG && console.log("tickerData:", ticker);
      const update = this.prisma.ticker.update({
        where: { id: ticker.id },
        data: {
          updatedAt: new Date(),
          // tickerData: {
          //   upsert: {
          //     where: { tickerId: ticker.id },
          //     update: tickerDataWithoutId,
          //     create: tickerDataWithoutId,
          //   },
          // },
        },
      });

      await this.saveHandlers(ticker);

      this.prisma.$transaction([update]);

      return true;
    } catch (e) {
      console.log(pc.red(e));
      return false;
    }
  }

  async addTicker(symbol) {
    let ticker = await this.prisma.ticker.findUnique({
      where: {
        symbol,
      },
    });

    if (!ticker) {
      ticker = await this.prisma.ticker.create({
        data: {
          symbol,
        },
      });
    }

    return ticker;
  }

  saveRaw(handler: string, symbol: string, data: any): void {
    console.warn("saveRaw not implemented...");
  }
}

export default MongoDBDatabaseHandler;
