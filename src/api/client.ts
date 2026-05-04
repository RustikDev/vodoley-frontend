import axios, { AxiosHeaders, type AxiosInstance } from 'axios';
import { Notify } from 'quasar';
import { getApiErrorMessage } from 'src/utils/apiError';

export function createApiClient(opts: {
  baseURL: string;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
}): AxiosInstance {
  const instance = axios.create({
    baseURL: opts.baseURL,
    withCredentials: true,
  });

  instance.interceptors.request.use((req) => {
    const token = opts.getToken?.();
    if (token) {
      req.headers = AxiosHeaders.from(req.headers ?? {});
      req.headers.set('Authorization', `Bearer ${token}`);
    }
    return req;
  });

  instance.interceptors.response.use(
    (res) => res,
    (error: unknown) => {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401) {
        opts.onUnauthorized?.();
      }
      Notify.create({
        type: 'negative',
        message: getApiErrorMessage(error),
        timeout: 6000,
      });

      const rejection = error instanceof Error ? error : new Error(getApiErrorMessage(error));
      return Promise.reject(rejection);
    },
  );

  return instance;
}


