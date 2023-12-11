import pc from "picocolors";
import { logLine } from "@packages/utils";
import axios from "axios";
import localtunnel from "localtunnel";
import dotenv from "dotenv";

dotenv.config();

const BEARER = process.env.BEARER;
const BASE_URL = process.env.BASE_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${BEARER}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
});

async function fetchConfig() {
  const response = await axiosInstance.get("/stckinfocfg.json");

  if (response.status === 200) {
    const jsonFile = response.data;
    if (jsonFile) {
      try {
        return JSON.parse(jsonFile);
      } catch (e) {
        return {};
      }
    }
  }

  return false;
}

async function updateConfigUrl(url: string) {
  const config = (await fetchConfig()) || {};
  config.url = url;

  const res = await axiosInstance.post("/stckinfocfg.php", {
    data: config,
  });

  if (res.status === 200) {
    logLine(pc.green("Remote config updated successfully!"));
    return true;
  } else {
    logLine(pc.red(`Error updating gist: ${res.status}`));
    return false;
  }
}

async function service() {
  const tunnel = await localtunnel({ port: 4000 });

  if (!updateConfigUrl(tunnel.url)) {
    //TODO: maybe retry in some time?
  }

  logLine(tunnel.url);
}

export default service;
