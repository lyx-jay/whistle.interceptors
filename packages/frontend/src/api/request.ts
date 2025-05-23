import axios from "axios";
import type { AxiosRequestConfig } from "axios";
const BASE_RUL = "/whistle.interceptors";

const instance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// 封装一个请求方法
export const request = async ({
  url,
  method,
  headers,
  data,
  responseType
}: {
  url: string;
  method: "get" | "post" | "put" | "delete";
  headers?: AxiosRequestConfig['headers'];
  data?: any;
  responseType?: AxiosRequestConfig['responseType'];
}) => {
  const response = await instance({
    url: BASE_RUL + url,
    method,
    data,
    params: method === "get" ? data : undefined,
    headers,
    responseType
  });
  return response.data;
};
