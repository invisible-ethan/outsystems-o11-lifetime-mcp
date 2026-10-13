import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LifeTimeClient } from "../client.js";
import { runTool } from "../tool-result.js";

export function registerModuleTools(
  server: McpServer,
  client: LifeTimeClient,
): void {
  server.registerTool(
    "list_modules",
    {
      title: "List modules",
      description: "Returns modules that exist in the infrastructure.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => runTool(() => client.get("/modules/")),
  );

  server.registerTool(
    "get_module",
    {
      title: "Get module",
      description: "Returns details of a given module.",
      inputSchema: {
        ModuleKey: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(`/modules/${encodeURIComponent(args.ModuleKey)}/`),
      ),
  );

  server.registerTool(
    "list_module_versions",
    {
      title: "List module versions",
      description: "Returns versions of a given module.",
      inputSchema: {
        ModuleKey: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(
          `/modules/${encodeURIComponent(args.ModuleKey)}/versions/`,
        ),
      ),
  );

  server.registerTool(
    "get_module_version",
    {
      title: "Get module version",
      description: "Returns details of a given module version.",
      inputSchema: {
        ModuleKey: z.string(),
        ModuleVersionKey: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(
          `/modules/${encodeURIComponent(args.ModuleKey)}/versions/${encodeURIComponent(args.ModuleVersionKey)}/`,
        ),
      ),
  );
}
