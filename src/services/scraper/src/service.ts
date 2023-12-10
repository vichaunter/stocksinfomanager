import pc from "picocolors";
import api from "./api/api";
import { browser } from ".";

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

  if (task) {
    const source = await getSource(task.url);
    if (source) {
      api.sendTaskResult(task.url, source);
      processing = false;
    }
  }
}

let serviceDaemon;

function service() {
  console.log("====");
  console.log(pc.yellow("Start scraper service"));
  console.log("====");

  serviceDaemon = setInterval(() => {
    if (api.baseRequest.url) {
      !processing && listener();
    }
  }, 1000);
}

export default service;
