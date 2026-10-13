import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createLifeTimeMcpServer } from "../src/server.js";
import { loadConfig } from "../src/config.js";

function loadDotEnv(): void {
  const path = new URL("../.env", import.meta.url);
  const file = path.pathname;
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!(key in process.env) || !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

const liveEnabled =
  process.env.LIVE_LIFETIME_TESTS === "1" ||
  Boolean(process.env.LIFETIME_TOKEN && process.env.LIFETIME_URL);

const describeLive = liveEnabled ? describe : describe.skip;

/** Read-only tools safe to call against a real LifeTime. */
const READ_ONLY_LIVE_TOOLS: Array<{
  name: string;
  args: Record<string, unknown>;
  assert: (text: string) => void;
}> = [
  {
    name: "list_environments",
    args: {},
    assert: (text) => {
      const data = JSON.parse(text) as unknown;
      assert.ok(Array.isArray(data));
      assert.ok(data.length >= 1);
    },
  },
  {
    name: "list_applications",
    args: {},
    assert: (text) => {
      const data = JSON.parse(text) as unknown;
      assert.ok(Array.isArray(data));
    },
  },
  {
    name: "list_modules",
    args: {},
    assert: (text) => {
      const data = JSON.parse(text) as unknown;
      assert.ok(Array.isArray(data));
    },
  },
  {
    name: "list_users",
    args: {},
    assert: (text) => {
      const data = JSON.parse(text) as unknown;
      assert.ok(Array.isArray(data));
    },
  },
  {
    name: "list_roles",
    args: {},
    assert: (text) => {
      const data = JSON.parse(text) as unknown;
      assert.ok(Array.isArray(data) || data === null);
    },
  },
  {
    name: "list_teams",
    args: {},
    assert: (text) => {
      const data = JSON.parse(text) as unknown;
      assert.ok(Array.isArray(data) || data === null);
    },
  },
  {
    name: "list_permission_levels",
    args: {},
    assert: (text) => {
      const data = JSON.parse(text) as unknown;
      assert.ok(Array.isArray(data) || data === null || typeof data === "object");
    },
  },
  {
    name: "list_deployments",
    args: {},
    assert: (text) => {
      // may be null/204 -> "null"
      assert.ok(text === "null" || text.startsWith("[") || text.startsWith("{"));
    },
  },
];

describeLive("MCP tools (live LifeTime API, read-only)", () => {
  it("runs read-only tool suite", async () => {
    const config = loadConfig(process.env);
    const { server } = createLifeTimeMcpServer({ config });
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "live-test", version: "0.0.0" });
    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    try {
      // Seed keys from list_environments / list_applications for detail GETs
      const envRes = await client.callTool({
        name: "list_environments",
        arguments: {},
      });
      assert.notEqual(envRes.isError, true);
      const envs = JSON.parse(
        String((envRes.content as Array<{ text?: string }>)[0]?.text),
      ) as Array<{ Key: string }>;
      const envKey = envs[0]?.Key;
      assert.ok(envKey);

      const appRes = await client.callTool({
        name: "list_applications",
        arguments: {},
      });
      assert.notEqual(appRes.isError, true);
      const apps = JSON.parse(
        String((appRes.content as Array<{ text?: string }>)[0]?.text),
      ) as Array<{ Key: string }>;
      const appKey = apps[0]?.Key;
      assert.ok(appKey);

      const detailTools = [
        { name: "get_environment", args: { EnvironmentKey: envKey } },
        { name: "get_application", args: { ApplicationKey: appKey } },
        {
          name: "list_application_versions",
          args: { ApplicationKey: appKey, MaximumVersionsToReturn: 2 },
        },
        {
          name: "list_environment_applications",
          args: { EnvironmentKey: envKey },
        },
        {
          name: "list_deployment_zones",
          args: { EnvironmentKey: envKey },
        },
        {
          name: "get_environment_application",
          args: { EnvironmentKey: envKey, ApplicationKey: appKey },
        },
      ];

      for (const tool of [...READ_ONLY_LIVE_TOOLS, ...detailTools]) {
        const result = await client.callTool({
          name: tool.name,
          arguments: tool.args,
        });
        assert.notEqual(
          result.isError,
          true,
          `${tool.name} failed: ${JSON.stringify(result.content)}`,
        );
        const text = String(
          (result.content as Array<{ text?: string }>)[0]?.text ?? "",
        );
        const custom = READ_ONLY_LIVE_TOOLS.find((t) => t.name === tool.name);
        if (custom) {
          custom.assert(text);
        } else {
          assert.ok(text.length > 0, `${tool.name} returned empty`);
        }
      }
    } finally {
      await client.close();
      await server.close();
    }
  });
});
