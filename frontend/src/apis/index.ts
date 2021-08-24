import Axios, { AxiosError, AxiosInstance, CancelTokenSource } from "axios";
import { siteRedirectToAuth } from "../@redux/actions";
import { AppDispatch } from "../@redux/store";
import { getBaseUrl } from "../utilities";
class Api {
  axios!: AxiosInstance;
  source!: CancelTokenSource;
  dispatch!: AppDispatch;

  constructor() {
    const baseUrl = `${getBaseUrl()}/api/`;
    if (process.env.NODE_ENV !== "production") {
      this.initialize(baseUrl, process.env["REACT_APP_APIKEY"]!);
    } else {
      this.initialize(baseUrl, window.Bazarr.apiKey);
    }
  }

  initialize(url: string, apikey?: string) {
    this.axios = Axios.create({
      baseURL: url,
    });

    this.axios.defaults.headers.post["Content-Type"] = "application/json";
    this.axios.defaults.headers.common["X-API-KEY"] = apikey ?? "AUTH_NEEDED";

    this.source = Axios.CancelToken.source();

    this.axios.interceptors.request.use((config) => {
      config.cancelToken = this.source.token;
      return config;
    });

    this.axios.interceptors.response.use(
      (resp) => {
        if (resp.status >= 200 && resp.status < 300) {
          return Promise.resolve(resp);
        } else {
          this.handleError(resp.status);
          return Promise.reject(resp);
        }
      },
      (error: AxiosError) => {
        if (error.response) {
          const response = error.response;
          this.handleError(response.status);
        } else {
          error.message = "You have disconnected to Bazarr backend";
        }
        return Promise.reject(error);
      }
    );
  }

  _resetApi(apikey: string) {
    if (process.env.NODE_ENV !== "production") {
      this.axios.defaults.headers.common["X-API-KEY"] = apikey;
    }
  }

  handleError(code: number) {
    switch (code) {
      case 401:
        this.dispatch(siteRedirectToAuth());
        break;
      case 500:
        break;
      default:
        break;
    }
  }
}

export default new Api();
export { default as BadgesApi } from "./badges";
export { default as EpisodesApi } from "./episodes";
export { default as FilesApi } from "./files";
export { default as HistoryApi } from "./history";
export * from "./hooks";
export { default as MoviesApi } from "./movies";
export { default as ProvidersApi } from "./providers";
export { default as SeriesApi } from "./series";
export { default as SubtitlesApi } from "./subtitles";
export { default as SystemApi } from "./system";
export { default as UtilsApi } from "./utils";
