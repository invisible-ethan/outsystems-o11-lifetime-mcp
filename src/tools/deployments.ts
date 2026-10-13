import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LifeTimeClient } from "../client.js";
import { runTool } from "../tool-result.js";

const deploymentBody = z
  .record(z.string(), z.unknown())
  .describe(
    "Deployment object subset (e.g. SourceEnvironmentKey, TargetEnvironmentKey, Notes, ApplicationVersions).",
  );

export function registerDeploymentTools(
  server: McpServer,
  client: LifeTimeClient,
): void {
  server.registerTool(
    "list_deployments",
    {
      title: "List deployments",
      description:
        "Returns deployments ordered by creation date (newest first). Defaults to the last week.",
      inputSchema: {
        MinDate: z
          .string()
          .optional()
          .describe("Minimum creation date (YYYY-MM-DD). Default: 1 week ago."),
        MaxDate: z
          .string()
          .optional()
          .describe("Maximum creation date (YYYY-MM-DD). Default: today."),
        TargetEnvironmentKey: z
          .string()
          .optional()
          .describe("Filter by target environment key."),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get("/deployments/", {
          MinDate: args.MinDate,
          MaxDate: args.MaxDate,
          TargetEnvironmentKey: args.TargetEnvironmentKey,
        }),
      ),
  );

  server.registerTool(
    "create_deployment",
    {
      title: "Create deployment",
      description:
        "Creates a deployment plan to a target environment. Optionally include applications.",
      inputSchema: {
        body: deploymentBody,
      },
    },
    async (args) => runTool(() => client.post("/deployments/", args.body)),
  );

  server.registerTool(
    "get_deployment",
    {
      title: "Get deployment",
      description:
        "Returns deployment details including included applications and possible conflicts.",
      inputSchema: {
        DeploymentKey: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(`/deployments/${encodeURIComponent(args.DeploymentKey)}/`),
      ),
  );

  server.registerTool(
    "update_deployment",
    {
      title: "Update deployment",
      description:
        "Updates a deployment. Optionally include applications to deploy.",
      inputSchema: {
        DeploymentKey: z.string(),
        body: deploymentBody,
      },
    },
    async (args) =>
      runTool(() =>
        client.put(
          `/deployments/${encodeURIComponent(args.DeploymentKey)}/`,
          args.body,
        ),
      ),
  );

  server.registerTool(
    "delete_deployment",
    {
      title: "Delete deployment",
      description:
        'Discards a deployment if possible. Only deployments in state "saved" can be deleted.',
      inputSchema: {
        DeploymentKey: z.string(),
      },
      annotations: { destructiveHint: true },
    },
    async (args) =>
      runTool(() =>
        client.delete(
          `/deployments/${encodeURIComponent(args.DeploymentKey)}/`,
        ),
      ),
  );

  server.registerTool(
    "get_deployment_status",
    {
      title: "Get deployment status",
      description:
        "Returns deployment execution status and messages.",
      inputSchema: {
        DeploymentKey: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(
          `/deployments/${encodeURIComponent(args.DeploymentKey)}/status/`,
        ),
      ),
  );

  server.registerTool(
    "execute_deployment_command",
    {
      title: "Execute deployment command",
      description:
        'Executes a deployment command: "start", "continue", or "abort".',
      inputSchema: {
        DeploymentKey: z.string(),
        Command: z.enum(["start", "continue", "abort"]),
        RedeployOutdated: z
          .boolean()
          .optional()
          .describe(
            "If true, outdated applications in the target environment are redeployed.",
          ),
      },
    },
    async (args) =>
      runTool(() =>
        client.post(
          `/deployments/${encodeURIComponent(args.DeploymentKey)}/${encodeURIComponent(args.Command)}/`,
          undefined,
          { RedeployOutdated: args.RedeployOutdated },
        ),
      ),
  );
}
