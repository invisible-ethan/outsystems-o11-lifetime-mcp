#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createLifeTimeMcpServer } from "./server.js";

async function main(): Promise<void> {
  const { server } = createLifeTimeMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`outsystems-o11-lifetime-mcp failed to start: ${message}`);
  process.exit(1);
});
