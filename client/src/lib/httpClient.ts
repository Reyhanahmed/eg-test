import axios from 'axios';
import type { AxiosRequestConfig, Method } from 'axios';

// default headers, part of every request
const defaults = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// utility to remove undefined values from parameters if GET request
const removeUndefinedFromParams = (data: any) =>
  data &&
  Object.keys(data).reduce(
    (acc, key) => {
      if (data[key] !== undefined) {
        acc[key] = data[key];
      }
      return acc;
    },
    {} as typeof data,
  );

const request = async <T>(
  endpoint: string,
  method: Method,
  config: AxiosRequestConfig = {},
) => {
  const { data, headers, ...restConfig } = config;

  const result = await axios<T>({
    ...restConfig,
    url: `${import.meta.env.VITE_SERVER_BASE_URL}${endpoint}`,
    method,
    headers: { ...defaults.headers, ...headers },
    params: method === 'get' ? removeUndefinedFromParams(data) : undefined,
    data: method !== 'get' ? data : undefined,
    withCredentials: true, // required to let the browser know to include cookies for requests
  });

  return result.data;
};

export const httpClient = {
  get: <T>(endpoint: string, config?: AxiosRequestConfig) =>
    request<T>(endpoint, 'get', config),
  post: <T>(endpoint: string, config: AxiosRequestConfig) =>
    request<T>(endpoint, 'post', config),
  patch: <T>(endpoint: string, config: AxiosRequestConfig) =>
    request<T>(endpoint, 'patch', config),
  delete: <T>(endpoint: string) => request<T>(endpoint, 'delete'),
};
