import QUERIES from "./queries";
import MUTATIONS from "./mutations";
import axios from "axios";

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
    };

    if (variables) {
      request.variables = variables;
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
