import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LifeTimeClient } from "../client.js";
import { runTool } from "../tool-result.js";

export function registerTeamTools(
  server: McpServer,
  client: LifeTimeClient,
): void {
  server.registerTool(
    "list_teams",
    {
      title: "List teams",
      description: "Lists all LifeTime teams (11.5.0+).",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => runTool(() => client.get("/teams/")),
  );

  server.registerTool(
    "create_team",
    {
      title: "Create team",
      description:
        "Creates a team. Associate users and applications via dedicated endpoints.",
      inputSchema: {
        body: z.record(z.string(), z.unknown()),
      },
    },
    async (args) => runTool(() => client.post("/teams/", args.body)),
  );

  server.registerTool(
    "get_team",
    {
      title: "Get team",
      description: "Returns details of a given team.",
      inputSchema: {
        TeamKey: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(`/teams/${encodeURIComponent(args.TeamKey)}/`),
      ),
  );

  server.registerTool(
    "update_team",
    {
      title: "Update team",
      description:
        "Updates team details. Use dedicated endpoints to change users/applications.",
      inputSchema: {
        TeamKey: z.string(),
        body: z.record(z.string(), z.unknown()),
      },
    },
    async (args) =>
      runTool(() =>
        client.put(`/teams/${encodeURIComponent(args.TeamKey)}/`, args.body),
      ),
  );

  server.registerTool(
    "delete_team",
    {
      title: "Delete team",
      description: "Deletes a team.",
      inputSchema: {
        TeamKey: z.string(),
      },
      annotations: { destructiveHint: true },
    },
    async (args) =>
      runTool(() =>
        client.delete(`/teams/${encodeURIComponent(args.TeamKey)}/`),
      ),
  );

  server.registerTool(
    "add_team_application",
    {
      title: "Add application to team",
      description: "Adds an existing application to a team.",
      inputSchema: {
        TeamKey: z.string(),
        body: z
          .record(z.string(), z.unknown())
          .describe("Payload identifying the application to add."),
      },
    },
    async (args) =>
      runTool(() =>
        client.post(
          `/teams/${encodeURIComponent(args.TeamKey)}/applications/`,
          args.body,
        ),
      ),
  );

  server.registerTool(
    "remove_team_application",
    {
      title: "Remove application from team",
      description: "Removes an application from a team.",
      inputSchema: {
        TeamKey: z.string(),
        ApplicationKey: z.string(),
      },
      annotations: { destructiveHint: true },
    },
    async (args) =>
      runTool(() =>
        client.delete(
          `/teams/${encodeURIComponent(args.TeamKey)}/applications/${encodeURIComponent(args.ApplicationKey)}`,
        ),
      ),
  );

  server.registerTool(
    "add_team_user",
    {
      title: "Add user to team",
      description: "Adds a user to a team with a specified role.",
      inputSchema: {
        TeamKey: z.string(),
        body: z
          .record(z.string(), z.unknown())
          .describe("Payload with user and role keys."),
      },
    },
    async (args) =>
      runTool(() =>
        client.post(
          `/teams/${encodeURIComponent(args.TeamKey)}/users/`,
          args.body,
        ),
      ),
  );

  server.registerTool(
    "remove_team_user",
    {
      title: "Remove user from team",
      description: "Removes a user from a team.",
      inputSchema: {
        TeamKey: z.string(),
        UserKey: z.string(),
      },
      annotations: { destructiveHint: true },
    },
    async (args) =>
      runTool(() =>
        client.delete(
          `/teams/${encodeURIComponent(args.TeamKey)}/users/${encodeURIComponent(args.UserKey)}/`,
        ),
      ),
  );
}
