import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createLifeTimeMcpServer } from "../src/server.js";

const EXPECTED_TOOLS = [
  "list_applications",
  "get_application",
  "list_application_versions",
  "get_application_version",
  "delete_application_version",
  "get_application_version_content",
  "list_environments",
  "get_environment",
  "list_environment_applications",
  "create_environment_application",
  "get_environment_application",
  "get_environment_application_content",
  "create_application_version_from_environment",
  "list_deployment_zones",
  "list_environment_templates",
  "get_content_security_policies",
  "set_content_security_policies",
  "list_deployments",
  "create_deployment",
  "get_deployment",
  "update_deployment",
  "delete_deployment",
  "get_deployment_status",
  "execute_deployment_command",
  "list_modules",
  "get_module",
  "list_module_versions",
  "get_module_version",
  "list_roles",
  "create_role",
  "get_role",
  "update_role",
  "delete_role",
  "list_permission_levels",
  "list_teams",
  "create_team",
  "get_team",
  "update_team",
  "delete_team",
  "add_team_application",
  "remove_team_application",
  "add_team_user",
  "remove_team_user",
  "list_users",
  "create_user",
  "get_user",
  "update_user",
  "set_user_password",
  "grant_user_application_role",
  "revoke_user_application_role",
] as const;

async function main(): Promise<void> {
  const { server } = createLifeTimeMcpServer({
    config: {
      apiBaseUrl: "https://example.com/lifetimeapi/rest/v2",
      token: "smoke-token",
    },
  });

  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "smoke", version: "0.0.0" });

  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);

  const listed = await client.listTools();
  const names = listed.tools.map((t) => t.name).sort();
  const expected = [...EXPECTED_TOOLS].sort();

  const missing = expected.filter((n) => !names.includes(n));
  const extra = names.filter((n) => !expected.includes(n as (typeof EXPECTED_TOOLS)[number]));

  console.log(`tools registered: ${names.length}`);
  console.log(names.join("\n"));

  if (missing.length || extra.length) {
    console.error("missing:", missing);
    console.error("extra:", extra);
    process.exit(1);
  }

  // Exercise one tool against a mock fetch via a second server instance
  const calls: string[] = [];
  const { server: server2 } = createLifeTimeMcpServer({
    config: {
      apiBaseUrl: "https://example.com/lifetimeapi/rest/v2",
      token: "smoke-token",
    },
    fetchImpl: async (input) => {
      calls.push(String(input));
      return new Response(JSON.stringify([{ Name: "Dev" }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  });
  const [c2t, s2t] = InMemoryTransport.createLinkedPair();
  const client2 = new Client({ name: "smoke2", version: "0.0.0" });
  await Promise.all([server2.connect(s2t), client2.connect(c2t)]);
  const result = await client2.callTool({ name: "list_environments", arguments: {} });
  if (result.isError) {
    console.error("list_environments failed", result);
    process.exit(1);
  }
  console.log("list_environments ok ->", calls[0]);
  await client.close();
  await client2.close();
  console.log("smoke passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
