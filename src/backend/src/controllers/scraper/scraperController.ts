import { logLine } from "@packages/utils";
import pc from "picocolors";
import * as handlers from "./handlers";
import dayjs from "dayjs";
import database from "../../services/database";
import TickerModel from "../../models/tickerModel";

type Task = {
  symbol: string;
  url: string;
  handlerId: string;
};

type ScraperTask = {
  scraperId: string;
  symbol: string;
  url: string;
  handlerId: string;
  source?: string;
  date: dayjs.Dayjs;
};

type ReadyTask = {
  symbol: string;
  url: string;
  handlerId: string;
  source: string;
};

class ScraperController {
  running = false;

  queue: Task[] = [];
  processingQueue: ScraperTask[] = [];
  readyQueue: ReadyTask[] = [];

  // [scraper id]: failed times
  failedCount: Record<string, number> = {};

  constructor() {
    //init processing watcher
    this.start();
  }

  private async start() {
    this.running = true;

    while (this.readyQueue.length) {
      const readyTask = this.readyQueue.shift();
      try {
        const ticker = await this.getTicker(readyTask);
        if (ticker) {
          ticker.persist();
          this.finishTask(readyTask.url);
        }
        console.log({ ticker });
        this.resetStaleTasks();
      } catch (e) {
        console.log(e);
      }
    }

    this.running = false;
  }

  getNextTask(scraperId: string) {
    if (this.queue.length) {
      const nextTask = this.queue.shift();
      this.processingQueue.push({
        ...nextTask,
        scraperId,
        date: dayjs(),
      });

      return nextTask;
    }

    return;
  }

  private resetStaleTasks() {
    const staleTasks = this.processingQueue.filter((t) => {
      const secondsWaitingResponse = dayjs().diff(t.date, "seconds");
      return secondsWaitingResponse > 60;
    });

    staleTasks.forEach((t) => {
      this.retryTask(t.url);
    });
  }

  private retryTask(url: string) {
    const taskIndex = this.processingQueue.findIndex((t) => t.url === url);
    if (taskIndex > -1) {
      const task = this.processingQueue[taskIndex];
      this.queue.push({
        ...task,
      });
      this.processingQueue.splice(taskIndex, 1);
    }
  }

  private finishTask(url: string) {
    const taskIndex = this.readyQueue.findIndex((t) => t.url === url);
    if (taskIndex) {
      this.readyQueue.splice(taskIndex, 1);
    }
  }

  private setTaskReady(url: string, source: string) {
    const taskIndex = this.processingQueue.findIndex((t) => t.url === url);
    console.log({ taskIndex });
    if (taskIndex > -1) {
      const task = this.processingQueue[taskIndex];
      this.readyQueue.push({
        ...task,
        source,
      });
      this.processingQueue.splice(taskIndex, 1);

      return task;
    }

    return;
  }

  setTaskSource(scraperId: string, url: string, source: string) {
    if (!source) {
      this.incrementFailures(scraperId);
      this.retryTask(url);

      return;
    }

    const moved = this.setTaskReady(url, source);
    if (moved) {
      if (!this.running) this.start();
    }
  }

  async getTicker(task: ReadyTask): Promise<TickerModel | undefined> {
    const { symbol, handlerId, source } = task;
    let ticker = undefined;

    const handler = handlers?.[handlerId];
    if (!handler || !handler.parseRaw) {
      logLine(pc.red(`Cannot find handler ${handlerId}`));
      return ticker;
    }

    const raw = await handler.parseRaw(source);
    if (raw) {
      database.saveRaw(handlerId, symbol, raw);
      ticker = handler.rawToTicker(symbol, raw);
    }

    return ticker;
  }

  incrementFailures(scraperId: string) {
    if (!this.failedCount[scraperId]) this.failedCount[scraperId] = 0;
    this.failedCount[scraperId] = this.failedCount[scraperId] + 1;
  }
}

const scraperController = new ScraperController();

export default scraperController;
