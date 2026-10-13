import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LifeTimeClient } from "./client.js";
import { loadConfig, type LifeTimeConfig } from "./config.js";
import { registerAllTools } from "./tools/index.js";

export type CreateServerOptions = {
  config?: LifeTimeConfig;
  fetchImpl?: typeof fetch;
};

export function createLifeTimeMcpServer(
  options: CreateServerOptions = {},
): { server: McpServer; client: LifeTimeClient } {
  const config = options.config ?? loadConfig();
  const client = new LifeTimeClient(config, options.fetchImpl);
  const server = new McpServer({
    name: "outsystems-o11-lifetime-mcp",
    version: "0.1.0",
  });

  registerAllTools(server, client);
  return { server, client };
}
