import type { LifeTimeConfig } from "./config.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type RequestOptions = {
  method?: HttpMethod;
  path: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  /** Override Accept / Content-Type when needed */
  headers?: Record<string, string>;
};

export class LifeTimeApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body: unknown;
  readonly path: string;

  constructor(args: {
    status: number;
    statusText: string;
    body: unknown;
    path: string;
  }) {
    const detail =
      typeof args.body === "string"
        ? args.body
        : args.body
          ? JSON.stringify(args.body)
          : args.statusText;
    super(`LifeTime API ${args.status} ${args.path}: ${detail}`);
    this.name = "LifeTimeApiError";
    this.status = args.status;
    this.statusText = args.statusText;
    this.body = args.body;
    this.path = args.path;
  }
}

function buildQuery(
  query?: RequestOptions["query"],
): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function joinUrl(base: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/+$/, "")}${normalizedPath}`;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export class LifeTimeClient {
  readonly apiBaseUrl: string;
  private readonly token: string;
  private readonly fetchImpl: typeof fetch;

  constructor(
    config: LifeTimeConfig,
    fetchImpl: typeof fetch = globalThis.fetch.bind(globalThis),
  ) {
    this.apiBaseUrl = config.apiBaseUrl;
    this.token = config.token;
    this.fetchImpl = fetchImpl;
  }

  async request<T = unknown>(options: RequestOptions): Promise<T> {
    const method = options.method ?? "GET";
    const url = `${joinUrl(this.apiBaseUrl, options.path)}${buildQuery(options.query)}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      Accept: "application/json",
      ...options.headers,
    };

    let body: string | undefined;
    if (options.body !== undefined && options.body !== null) {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
      body =
        typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body);
    }

    const response = await this.fetchImpl(url, { method, headers, body });
    const parsed = await parseBody(response);

    if (!response.ok) {
      throw new LifeTimeApiError({
        status: response.status,
        statusText: response.statusText,
        body: parsed,
        path: options.path,
      });
    }

    return parsed as T;
  }

  get<T = unknown>(
    path: string,
    query?: RequestOptions["query"],
  ): Promise<T> {
    return this.request<T>({ method: "GET", path, query });
  }

  post<T = unknown>(
    path: string,
    body?: unknown,
    query?: RequestOptions["query"],
  ): Promise<T> {
    return this.request<T>({ method: "POST", path, body, query });
  }

  put<T = unknown>(
    path: string,
    body?: unknown,
    query?: RequestOptions["query"],
  ): Promise<T> {
    return this.request<T>({ method: "PUT", path, body, query });
  }

  delete<T = unknown>(
    path: string,
    query?: RequestOptions["query"],
  ): Promise<T> {
    return this.request<T>({ method: "DELETE", path, query });
  }
}
