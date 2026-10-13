import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createLifeTimeMcpServer } from "../src/server.js";
import { TOOL_NAMES } from "../src/tool-catalog.js";

const EXPECTED_TOOLS = TOOL_NAMES;

async function main(): Promise<void> {
  const { server } = createLifeTimeMcpServer({
    config: {
      apiBaseUrl: "https://example.com/lifetimeapi/rest/v2",
      token: "smoke-token",
    },
  });

  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "smoke", version: "0.0.0" });

  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);

  const listed = await client.listTools();
  const names = listed.tools.map((t) => t.name).sort();
  const expected = [...EXPECTED_TOOLS].sort();

  const missing = expected.filter((n) => !names.includes(n));
  const extra = names.filter((n) => !expected.includes(n as (typeof EXPECTED_TOOLS)[number]));

  console.log(`tools registered: ${names.length}`);
  console.log(names.join("\n"));

  if (missing.length || extra.length) {
    console.error("missing:", missing);
    console.error("extra:", extra);
    process.exit(1);
  }

  // Exercise one tool against a mock fetch via a second server instance
  const calls: string[] = [];
  const { server: server2 } = createLifeTimeMcpServer({
    config: {
      apiBaseUrl: "https://example.com/lifetimeapi/rest/v2",
      token: "smoke-token",
    },
    fetchImpl: async (input) => {
      calls.push(String(input));
      return new Response(JSON.stringify([{ Name: "Dev" }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  });
  const [c2t, s2t] = InMemoryTransport.createLinkedPair();
  const client2 = new Client({ name: "smoke2", version: "0.0.0" });
  await Promise.all([server2.connect(s2t), client2.connect(c2t)]);
  const result = await client2.callTool({ name: "list_environments", arguments: {} });
  if (result.isError) {
    console.error("list_environments failed", result);
    process.exit(1);
  }
  console.log("list_environments ok ->", calls[0]);
  await client.close();
  await client2.close();
  console.log("smoke passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
