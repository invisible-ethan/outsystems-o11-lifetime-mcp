import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LifeTimeClient } from "../client.js";
import { runTool } from "../tool-result.js";

export function registerUserTools(
  server: McpServer,
  client: LifeTimeClient,
): void {
  server.registerTool(
    "list_users",
    {
      title: "List users",
      description:
        "Lists LifeTime users. By default only active users are returned (11.5.0+).",
      inputSchema: {
        IncludeInactive: z
          .boolean()
          .optional()
          .describe("When supported by the server, include inactive users."),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get("/users/", {
          IncludeInactive: args.IncludeInactive,
        }),
      ),
  );

  server.registerTool(
    "create_user",
    {
      title: "Create user",
      description:
        "Creates a user. Associate teams/applications via dedicated endpoints.",
      inputSchema: {
        body: z.record(z.string(), z.unknown()),
      },
    },
    async (args) => runTool(() => client.post("/users/", args.body)),
  );

  server.registerTool(
    "get_user",
    {
      title: "Get user",
      description: "Returns details of a given user.",
      inputSchema: {
        UserKey: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(`/users/${encodeURIComponent(args.UserKey)}/`),
      ),
  );

  server.registerTool(
    "update_user",
    {
      title: "Update user",
      description: "Updates user details.",
      inputSchema: {
        UserKey: z.string(),
        body: z.record(z.string(), z.unknown()),
      },
    },
    async (args) =>
      runTool(() =>
        client.put(`/users/${encodeURIComponent(args.UserKey)}/`, args.body),
      ),
  );

  server.registerTool(
    "set_user_password",
    {
      title: "Set user password",
      description: "Changes the password of a given user.",
      inputSchema: {
        UserKey: z.string(),
        body: z
          .record(z.string(), z.unknown())
          .describe("Password payload as required by LifeTime API."),
      },
      annotations: { destructiveHint: true },
    },
    async (args) =>
      runTool(() =>
        client.post(
          `/users/${encodeURIComponent(args.UserKey)}/setpassword/`,
          args.body,
        ),
      ),
  );

  server.registerTool(
    "grant_user_application_role",
    {
      title: "Grant user application role",
      description: "Grants a role on an application to a user.",
      inputSchema: {
        UserKey: z.string(),
        body: z
          .record(z.string(), z.unknown())
          .describe("Payload with ApplicationKey and RoleKey."),
      },
    },
    async (args) =>
      runTool(() =>
        client.post(
          `/users/${encodeURIComponent(args.UserKey)}/applications/`,
          args.body,
        ),
      ),
  );

  server.registerTool(
    "revoke_user_application_role",
    {
      title: "Revoke user application role",
      description: "Revokes a user's role on an application.",
      inputSchema: {
        UserKey: z.string(),
        ApplicationKey: z.string(),
      },
      annotations: { destructiveHint: true },
    },
    async (args) =>
      runTool(() =>
        client.delete(
          `/users/${encodeURIComponent(args.UserKey)}/applications/${encodeURIComponent(args.ApplicationKey)}/`,
        ),
      ),
  );
}
