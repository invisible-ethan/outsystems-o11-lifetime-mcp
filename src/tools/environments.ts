import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LifeTimeClient } from "../client.js";
import { runTool } from "../tool-result.js";

export function registerEnvironmentTools(
  server: McpServer,
  client: LifeTimeClient,
): void {
  server.registerTool(
    "list_environments",
    {
      title: "List environments",
      description: "Lists all environments in the LifeTime infrastructure.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => runTool(() => client.get("/environments/")),
  );

  server.registerTool(
    "get_environment",
    {
      title: "Get environment",
      description: "Returns details of a given environment.",
      inputSchema: {
        EnvironmentKey: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(
          `/environments/${encodeURIComponent(args.EnvironmentKey)}/`,
        ),
      ),
  );

  server.registerTool(
    "list_environment_applications",
    {
      title: "List applications in environment",
      description:
        "Returns running application versions for a given environment.",
      inputSchema: {
        EnvironmentKey: z.string(),
        IncludeModules: z.boolean().optional(),
        IncludeEnvStatus: z.boolean().optional(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(
          `/environments/${encodeURIComponent(args.EnvironmentKey)}/applications/`,
          {
            IncludeModules: args.IncludeModules,
            IncludeEnvStatus: args.IncludeEnvStatus,
          },
        ),
      ),
  );

  server.registerTool(
    "create_environment_application",
    {
      title: "Create application in environment",
      description:
        "Creates a new application in the environment (LifeTime 11.5.0+).",
      inputSchema: {
        EnvironmentKey: z.string(),
        body: z
          .record(z.string(), z.unknown())
          .describe("Application creation payload (LifeTime Application object subset)."),
      },
      annotations: { destructiveHint: false },
    },
    async (args) =>
      runTool(() =>
        client.post(
          `/environments/${encodeURIComponent(args.EnvironmentKey)}/applications/`,
          args.body,
        ),
      ),
  );

  server.registerTool(
    "get_environment_application",
    {
      title: "Get application in environment",
      description:
        "Returns the running version of an application in a given environment.",
      inputSchema: {
        EnvironmentKey: z.string(),
        ApplicationKey: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(
          `/environments/${encodeURIComponent(args.EnvironmentKey)}/applications/${encodeURIComponent(args.ApplicationKey)}/`,
        ),
      ),
  );

  server.registerTool(
    "get_environment_application_content",
    {
      title: "Download environment application content link",
      description:
        "Returns a temporary link (expires in 60 minutes) to download the binary of the running application in an environment.",
      inputSchema: {
        EnvironmentKey: z.string(),
        ApplicationKey: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(
          `/environments/${encodeURIComponent(args.EnvironmentKey)}/applications/${encodeURIComponent(args.ApplicationKey)}/content/`,
        ),
      ),
  );

  server.registerTool(
    "create_application_version_from_environment",
    {
      title: "Create application version from environment",
      description:
        "Creates a new application version based on the current running application in the environment.",
      inputSchema: {
        EnvironmentKey: z.string(),
        ApplicationKey: z.string(),
        body: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Optional version creation payload (e.g. change log)."),
      },
    },
    async (args) =>
      runTool(() =>
        client.post(
          `/environments/${encodeURIComponent(args.EnvironmentKey)}/applications/${encodeURIComponent(args.ApplicationKey)}/versions/`,
          args.body ?? {},
        ),
      ),
  );

  server.registerTool(
    "list_deployment_zones",
    {
      title: "List deployment zones",
      description:
        "Returns deployment zones available in a given environment.",
      inputSchema: {
        EnvironmentKey: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(
          `/environments/${encodeURIComponent(args.EnvironmentKey)}/deploymentzones/`,
        ),
      ),
  );

  server.registerTool(
    "list_environment_templates",
    {
      title: "List environment templates",
      description:
        "Returns templates available in a given environment (LifeTime 11.5.0+).",
      inputSchema: {
        EnvironmentKey: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(
          `/environments/${encodeURIComponent(args.EnvironmentKey)}/templates/`,
        ),
      ),
  );

  server.registerTool(
    "get_content_security_policies",
    {
      title: "Get content security policies",
      description:
        "Returns Content Security Policy settings for an environment (LifeTime 11.10.3+).",
      inputSchema: {
        EnvironmentKey: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) =>
      runTool(() =>
        client.get(
          `/environments/${encodeURIComponent(args.EnvironmentKey)}/content_security_policies/`,
        ),
      ),
  );

  server.registerTool(
    "set_content_security_policies",
    {
      title: "Set content security policies",
      description:
        "Sets Content Security Policies for an environment (LifeTime 11.10.3+).",
      inputSchema: {
        EnvironmentKey: z.string(),
        body: z
          .record(z.string(), z.unknown())
          .describe("CSP payload as defined by LifeTime API v2."),
      },
    },
    async (args) =>
      runTool(() =>
        client.put(
          `/environments/${encodeURIComponent(args.EnvironmentKey)}/content_security_policies/`,
          args.body,
        ),
      ),
  );
}
