import { logLine } from "@packages/utils";
import axios from "axios";
import dotenv from "dotenv";
import pc from "picocolors";
import browser from "simppeteer";
import api from "./api/api";
dotenv.config();

const REMOTE_CONFIG_URL = process.env.REMOTE_CONFIG_URL;
const RUN_LOCAL = process.env.RUN_LOCAL;

async function getSource(url: string) {
  try {
    const source = await browser.getPageSourceHtml(url);

    return source;
  } catch (e) {
    console.log("Error fetching:", url);
    console.log(e);
  }

  return;
}

let processing: boolean;
async function listener() {
  processing = true;
  const task = await api.getNextTask();

  if (task?.url) {
    const source = await getSource(task.url);
    if (source) {
      api.sendTaskResult(task.url, source);
    }
  }
  processing = false;
}

async function fetchConfig() {
  const response = await axios.get(REMOTE_CONFIG_URL);
  if (response.status === 200) {
    if (response.data?.url) {
      return response.data;
    }
  }

  return false;
}

let serviceDaemon;
async function service() {
  logLine(pc.yellow("Start scraper service"));

  let url = RUN_LOCAL;
  if (!url) {
    const config = await fetchConfig();
    if (!config) {
      logLine(pc.red("Error getting config"));

      throw new Error("Config file not reachable, contact with provider");
    }
    url = config.url;
  }

  logLine(pc.blue("Config loaded"));
  api.setBaseUrl(url);

  serviceDaemon = setInterval(() => {
    if (api.baseRequest.url) {
      try {
        !processing && listener();
      } catch (e) {
        logLine(pc.red(`Error, api restarting...`));
      }
    }
  }, 2000);
}

export default service;
