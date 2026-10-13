import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LifeTimeClient } from "../client.js";
import { runTool } from "../tool-result.js";

export function registerRoleTools(
  server: McpServer,
  client: LifeTimeClient,
): void {
  server.registerTool(
    "list_roles",
    {
      title: "List roles",
      description: "Lists all LifeTime roles (11.5.0+).",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => runTool(() => client.get("/roles/")),
  );

  server.registerTool(
    "create_role",
    {
      title: "Create role",
      description: "Creates a role with the specified permissions (11.5.0+).",
      inputSchema: {
        body: z
          .record(z.string(), z.unknown())
          .describe("Role creation payload including permissions."),
      },
    },
    async (args) => runTool(() => client.post("/roles/", args.body)),
  );

  server.registerTool(
    "get_role",
    {
      title: "Get role",
      description: "Returns details of a given role.",
      inputSchema: {
        RoleKey: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(`/roles/${encodeURIComponent(args.RoleKey)}/`),
      ),
  );

  server.registerTool(
    "update_role",
    {
      title: "Update role",
      description: "Updates a role with the specified permissions.",
      inputSchema: {
        RoleKey: z.string(),
        body: z.record(z.string(), z.unknown()),
      },
    },
    async (args) =>
      runTool(() =>
        client.put(`/roles/${encodeURIComponent(args.RoleKey)}/`, args.body),
      ),
  );

  server.registerTool(
    "delete_role",
    {
      title: "Delete role",
      description: "Deletes a role.",
      inputSchema: {
        RoleKey: z.string(),
      },
      annotations: { destructiveHint: true },
    },
    async (args) =>
      runTool(() =>
        client.delete(`/roles/${encodeURIComponent(args.RoleKey)}/`),
      ),
  );

  server.registerTool(
    "list_permission_levels",
    {
      title: "List permission levels",
      description: "Gets available permission levels for roles.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => runTool(() => client.get("/roles/permissionlevels/")),
  );
}
