import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LifeTimeClient } from "../client.js";
import { registerApplicationTools } from "./applications.js";
import { registerEnvironmentTools } from "./environments.js";
import { registerDeploymentTools } from "./deployments.js";
import { registerModuleTools } from "./modules.js";
import { registerRoleTools } from "./roles.js";
import { registerTeamTools } from "./teams.js";
import { registerUserTools } from "./users.js";

export function registerAllTools(
  server: McpServer,
  client: LifeTimeClient,
): void {
  registerApplicationTools(server, client);
  registerEnvironmentTools(server, client);
  registerDeploymentTools(server, client);
  registerModuleTools(server, client);
  registerRoleTools(server, client);
  registerTeamTools(server, client);
  registerUserTools(server, client);
}
