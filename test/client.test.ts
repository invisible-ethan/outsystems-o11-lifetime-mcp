import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LifeTimeApiError, LifeTimeClient } from "../src/client.js";

describe("LifeTimeClient", () => {
  it("sends Bearer auth and builds query strings", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      calls.push({ url: String(input), init: init ?? {} });
      return new Response(JSON.stringify([{ Key: "env1" }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    };

    const client = new LifeTimeClient(
      {
        apiBaseUrl: "https://lt.example.com/lifetimeapi/rest/v2",
        token: "secret-token",
      },
      fetchImpl,
    );

    const result = await client.get("/environments/", { IncludeInactive: true });
    assert.deepEqual(result, [{ Key: "env1" }]);
    assert.equal(calls.length, 1);
    assert.equal(
      calls[0]?.url,
      "https://lt.example.com/lifetimeapi/rest/v2/environments/?IncludeInactive=true",
    );
    const headers = new Headers(calls[0]?.init.headers);
    assert.equal(headers.get("Authorization"), "Bearer secret-token");
  });

  it("throws LifeTimeApiError on non-2xx", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(JSON.stringify({ Errors: ["nope"] }), {
        status: 403,
        statusText: "Forbidden",
        headers: { "content-type": "application/json" },
      });

    const client = new LifeTimeClient(
      {
        apiBaseUrl: "https://lt.example.com/lifetimeapi/rest/v2",
        token: "tok",
      },
      fetchImpl,
    );

    await assert.rejects(
      () => client.get("/applications/"),
      (err: unknown) => {
        assert.ok(err instanceof LifeTimeApiError);
        assert.equal(err.status, 403);
        return true;
      },
    );
  });

  it("returns null for 204 responses", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(null, { status: 204 });
    const client = new LifeTimeClient(
      {
        apiBaseUrl: "https://lt.example.com/lifetimeapi/rest/v2",
        token: "tok",
      },
      fetchImpl,
    );
    assert.equal(await client.delete("/deployments/abc/"), null);
  });
});
