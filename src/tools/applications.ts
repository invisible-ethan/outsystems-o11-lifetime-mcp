import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LifeTimeClient } from "../client.js";
import { runTool } from "../tool-result.js";

export function registerApplicationTools(
  server: McpServer,
  client: LifeTimeClient,
): void {
  server.registerTool(
    "list_applications",
    {
      title: "List applications",
      description:
        "Returns applications in the LifeTime infrastructure. Optionally include modules and per-environment status.",
      inputSchema: {
        IncludeModules: z
          .boolean()
          .optional()
          .describe("When true, modules are also returned. Default false."),
        IncludeEnvStatus: z
          .boolean()
          .optional()
          .describe(
            "When true, application status per environment is returned. Default false. Required if IncludeModules is true.",
          ),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get("/applications/", {
          IncludeModules: args.IncludeModules,
          IncludeEnvStatus: args.IncludeEnvStatus,
        }),
      ),
  );

  server.registerTool(
    "get_application",
    {
      title: "Get application",
      description: "Returns details of an application by ApplicationKey.",
      inputSchema: {
        ApplicationKey: z.string().describe("Application key"),
        IncludeModules: z.boolean().optional(),
        IncludeEnvStatus: z.boolean().optional(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(`/applications/${encodeURIComponent(args.ApplicationKey)}/`, {
          IncludeModules: args.IncludeModules,
          IncludeEnvStatus: args.IncludeEnvStatus,
        }),
      ),
  );

  server.registerTool(
    "list_application_versions",
    {
      title: "List application versions",
      description: "Returns versions of an application.",
      inputSchema: {
        ApplicationKey: z.string(),
        ChangeLogFilter: z
          .string()
          .optional()
          .describe("Only versions whose change log contains this string."),
        MaximumVersionsToReturn: z
          .number()
          .int()
          .optional()
          .describe("Max versions to return. Default 5."),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(
          `/applications/${encodeURIComponent(args.ApplicationKey)}/versions/`,
          {
            ChangeLogFilter: args.ChangeLogFilter,
            MaximumVersionsToReturn: args.MaximumVersionsToReturn,
          },
        ),
      ),
  );

  server.registerTool(
    "get_application_version",
    {
      title: "Get application version",
      description: "Returns details of a specific application version.",
      inputSchema: {
        ApplicationKey: z.string(),
        VersionKey: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(
          `/applications/${encodeURIComponent(args.ApplicationKey)}/versions/${encodeURIComponent(args.VersionKey)}/`,
        ),
      ),
  );

  server.registerTool(
    "delete_application_version",
    {
      title: "Delete application version",
      description:
        "Discards an application version if possible. Running versions or versions used in deployments cannot be deleted.",
      inputSchema: {
        ApplicationKey: z.string(),
        VersionKey: z.string(),
      },
      annotations: { destructiveHint: true },
    },
    async (args) =>
      runTool(() =>
        client.delete(
          `/applications/${encodeURIComponent(args.ApplicationKey)}/versions/${encodeURIComponent(args.VersionKey)}/`,
        ),
      ),
  );

  server.registerTool(
    "get_application_version_content",
    {
      title: "Download application version content link",
      description:
        "Returns a temporary link (expires in 60 minutes) to download the binary for an application version.",
      inputSchema: {
        ApplicationKey: z.string(),
        VersionKey: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(
          `/applications/${encodeURIComponent(args.ApplicationKey)}/versions/${encodeURIComponent(args.VersionKey)}/content/`,
        ),
      ),
  );
}
