import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createLifeTimeMcpServer } from "../../src/server.js";

export type CapturedRequest = {
  url: string;
  method: string;
  headers: Headers;
  body: string | null;
};

export type MockResponse =
  | { status?: number; body?: unknown; contentType?: string }
  | ((req: CapturedRequest) => {
      status?: number;
      body?: unknown;
      contentType?: string;
    });

export async function withMockMcp(
  mockResponse: MockResponse = { status: 200, body: { ok: true } },
  run: (ctx: {
    client: Client;
    calls: CapturedRequest[];
  }) => Promise<void>,
): Promise<void> {
  const calls: CapturedRequest[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const req: CapturedRequest = {
      url: String(input),
      method: (init?.method ?? "GET").toUpperCase(),
      headers: new Headers(init?.headers),
      body:
        typeof init?.body === "string"
          ? init.body
          : init?.body
            ? String(init.body)
            : null,
    };
    calls.push(req);
    const resolved =
      typeof mockResponse === "function" ? mockResponse(req) : mockResponse;
    const status = resolved.status ?? 200;
    if (status === 204) {
      return new Response(null, { status });
    }
    const body = resolved.body === undefined ? { ok: true } : resolved.body;
    return new Response(
      typeof body === "string" ? body : JSON.stringify(body),
      {
        status,
        headers: {
          "content-type": resolved.contentType ?? "application/json",
        },
      },
    );
  };

  const { server } = createLifeTimeMcpServer({
    config: {
      apiBaseUrl: "https://lt.test/lifetimeapi/rest/v2",
      token: "test-token",
    },
    fetchImpl,
  });

  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test", version: "0.0.0" });
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);

  try {
    await run({ client, calls });
  } finally {
    await client.close();
    await server.close();
  }
}

export function apiPath(url: string): string {
  const u = new URL(url);
  return `${u.pathname}${u.search}`;
}
