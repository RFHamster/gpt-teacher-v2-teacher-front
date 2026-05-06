import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import type { ApiError } from "@/types";

function buildClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL,
    timeout: 15_000,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use((config) => {
    if (typeof window === "undefined" && env.API_TOKEN) {
      config.headers.set("Authorization", `Bearer ${env.API_TOKEN}`);
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const apiError: ApiError = {
        message: error.response?.data?.message ?? error.message ?? "Unknown error",
        status: error.response?.status,
        code: error.code,
        details: error.response?.data,
      };
      logger.error("HTTP error", apiError as unknown as Record<string, unknown>);
      return Promise.reject(apiError);
    },
  );

  return instance;
}

export const httpClient = buildClient();

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const { data } = await httpClient.request<T>(config);
  return data;
}
