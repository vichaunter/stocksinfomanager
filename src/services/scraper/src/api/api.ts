import axios from "axios";
import dotenv from "dotenv";
import MUTATIONS from "./mutations";
import QUERIES from "./queries";
dotenv.config();

const SCRAPER_ID = process.env.SCRAPER_ID;

class Api {
  baseRequest: axios.AxiosRequestConfig = {};

  constructor() {
    this.baseRequest.url = "http://localhost:4000/graphql";
    this.baseRequest.headers = {
      "content-type": "application/json; charset=utf-8",
    };
    this.baseRequest.method = "POST";
  }

  setBaseUrl(url: string) {
    this.baseRequest.url = url;
  }

  getGraphqlRequest(
    name: string,
    query: string,
    variables?: Record<string, any>
  ) {
    const request: Record<string, any> = {
      query,
      variables: {
        scraperId: SCRAPER_ID,
      },
    };

    if (variables) {
      request.variables = { ...request.variables, ...variables };
    }

    if (name) {
      request.operationName = name;
    }

    return request;
  }

  async getNextTask() {
    const response = await axios({
      ...this.baseRequest,
      data: this.getGraphqlRequest("Task", QUERIES.task),
    });

    if (response.status === 200) {
      const task = response.data.data.task;

      if (task) {
        return task;
      }
    }

    return;
  }

  async sendTaskResult(url: string, source: string) {
    //TODO: send compressed data
    return await axios({
      ...this.baseRequest,
      data: this.getGraphqlRequest("SetTaskSource", MUTATIONS.setTaskSource, {
        url,
        source,
      }),
    });
  }
}

const api = new Api();
export default api;
