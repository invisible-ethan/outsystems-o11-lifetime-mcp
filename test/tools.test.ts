import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TOOL_NAMES } from "../src/tool-catalog.js";
import { apiPath, withMockMcp } from "./helpers/mcp-harness.js";

type ToolCase = {
  name: (typeof TOOL_NAMES)[number];
  args: Record<string, unknown>;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  /** Substrings that must appear in the query string (already encoded form OK). */
  queryIncludes?: string[];
  body?: unknown;
  mockStatus?: number;
  mockBody?: unknown;
};

const APP = "app-key";
const ENV = "env-key";
const VER = "ver-key";
const DEP = "dep-key";
const MOD = "mod-key";
const MVER = "mod-ver-key";
const ROLE = "role-key";
const TEAM = "team-key";
const USER = "user-key";

const CASES: ToolCase[] = [
  // Applications
  {
    name: "list_applications",
    args: { IncludeModules: true, IncludeEnvStatus: true },
    method: "GET",
    path: "/lifetimeapi/rest/v2/applications/",
    queryIncludes: ["IncludeModules=true", "IncludeEnvStatus=true"],
    mockBody: [],
  },
  {
    name: "get_application",
    args: { ApplicationKey: APP },
    method: "GET",
    path: `/lifetimeapi/rest/v2/applications/${APP}/`,
    mockBody: { Key: APP },
  },
  {
    name: "list_application_versions",
    args: {
      ApplicationKey: APP,
      ChangeLogFilter: "fix",
      MaximumVersionsToReturn: 3,
    },
    method: "GET",
    path: `/lifetimeapi/rest/v2/applications/${APP}/versions/`,
    queryIncludes: ["ChangeLogFilter=fix", "MaximumVersionsToReturn=3"],
    mockBody: [],
  },
  {
    name: "get_application_version",
    args: { ApplicationKey: APP, VersionKey: VER },
    method: "GET",
    path: `/lifetimeapi/rest/v2/applications/${APP}/versions/${VER}/`,
    mockBody: { Key: VER },
  },
  {
    name: "delete_application_version",
    args: { ApplicationKey: APP, VersionKey: VER },
    method: "DELETE",
    path: `/lifetimeapi/rest/v2/applications/${APP}/versions/${VER}/`,
    mockStatus: 204,
  },
  {
    name: "get_application_version_content",
    args: { ApplicationKey: APP, VersionKey: VER },
    method: "GET",
    path: `/lifetimeapi/rest/v2/applications/${APP}/versions/${VER}/content/`,
    mockBody: { URL: "https://download.example/file" },
  },

  // Environments
  {
    name: "list_environments",
    args: {},
    method: "GET",
    path: "/lifetimeapi/rest/v2/environments/",
    mockBody: [],
  },
  {
    name: "get_environment",
    args: { EnvironmentKey: ENV },
    method: "GET",
    path: `/lifetimeapi/rest/v2/environments/${ENV}/`,
    mockBody: { Key: ENV },
  },
  {
    name: "list_environment_applications",
    args: { EnvironmentKey: ENV, IncludeModules: false },
    method: "GET",
    path: `/lifetimeapi/rest/v2/environments/${ENV}/applications/`,
    queryIncludes: ["IncludeModules=false"],
    mockBody: [],
  },
  {
    name: "create_environment_application",
    args: { EnvironmentKey: ENV, body: { Name: "NewApp" } },
    method: "POST",
    path: `/lifetimeapi/rest/v2/environments/${ENV}/applications/`,
    body: { Name: "NewApp" },
    mockBody: { Key: "new" },
  },
  {
    name: "get_environment_application",
    args: { EnvironmentKey: ENV, ApplicationKey: APP },
    method: "GET",
    path: `/lifetimeapi/rest/v2/environments/${ENV}/applications/${APP}/`,
    mockBody: { Key: APP },
  },
  {
    name: "get_environment_application_content",
    args: { EnvironmentKey: ENV, ApplicationKey: APP },
    method: "GET",
    path: `/lifetimeapi/rest/v2/environments/${ENV}/applications/${APP}/content/`,
    mockBody: { URL: "https://download.example/app" },
  },
  {
    name: "create_application_version_from_environment",
    args: {
      EnvironmentKey: ENV,
      ApplicationKey: APP,
      body: { ChangeLog: "bump" },
    },
    method: "POST",
    path: `/lifetimeapi/rest/v2/environments/${ENV}/applications/${APP}/versions/`,
    body: { ChangeLog: "bump" },
    mockBody: { Key: VER },
  },
  {
    name: "list_deployment_zones",
    args: { EnvironmentKey: ENV },
    method: "GET",
    path: `/lifetimeapi/rest/v2/environments/${ENV}/deploymentzones/`,
    mockBody: [],
  },
  {
    name: "list_environment_templates",
    args: { EnvironmentKey: ENV },
    method: "GET",
    path: `/lifetimeapi/rest/v2/environments/${ENV}/templates/`,
    mockBody: [],
  },
  {
    name: "get_content_security_policies",
    args: { EnvironmentKey: ENV },
    method: "GET",
    path: `/lifetimeapi/rest/v2/environments/${ENV}/content_security_policies/`,
    mockBody: {},
  },
  {
    name: "set_content_security_policies",
    args: { EnvironmentKey: ENV, body: { DefaultSrc: ["'self'"] } },
    method: "PUT",
    path: `/lifetimeapi/rest/v2/environments/${ENV}/content_security_policies/`,
    body: { DefaultSrc: ["'self'"] },
    mockBody: {},
  },

  // Deployments
  {
    name: "list_deployments",
    args: {
      MinDate: "2026-01-01",
      MaxDate: "2026-01-31",
      TargetEnvironmentKey: ENV,
    },
    method: "GET",
    path: "/lifetimeapi/rest/v2/deployments/",
    queryIncludes: [
      "MinDate=2026-01-01",
      "MaxDate=2026-01-31",
      `TargetEnvironmentKey=${ENV}`,
    ],
    mockBody: [],
  },
  {
    name: "create_deployment",
    args: {
      body: {
        SourceEnvironmentKey: ENV,
        TargetEnvironmentKey: "prod",
      },
    },
    method: "POST",
    path: "/lifetimeapi/rest/v2/deployments/",
    body: {
      SourceEnvironmentKey: ENV,
      TargetEnvironmentKey: "prod",
    },
    mockBody: DEP,
  },
  {
    name: "get_deployment",
    args: { DeploymentKey: DEP },
    method: "GET",
    path: `/lifetimeapi/rest/v2/deployments/${DEP}/`,
    mockBody: { Key: DEP },
  },
  {
    name: "update_deployment",
    args: { DeploymentKey: DEP, body: { Notes: "n" } },
    method: "PUT",
    path: `/lifetimeapi/rest/v2/deployments/${DEP}/`,
    body: { Notes: "n" },
    mockBody: { Key: DEP },
  },
  {
    name: "delete_deployment",
    args: { DeploymentKey: DEP },
    method: "DELETE",
    path: `/lifetimeapi/rest/v2/deployments/${DEP}/`,
    mockStatus: 204,
  },
  {
    name: "get_deployment_status",
    args: { DeploymentKey: DEP },
    method: "GET",
    path: `/lifetimeapi/rest/v2/deployments/${DEP}/status/`,
    mockBody: { Status: "saved" },
  },
  {
    name: "execute_deployment_command",
    args: {
      DeploymentKey: DEP,
      Command: "start",
      RedeployOutdated: true,
    },
    method: "POST",
    path: `/lifetimeapi/rest/v2/deployments/${DEP}/start/`,
    queryIncludes: ["RedeployOutdated=true"],
    mockStatus: 202,
    mockBody: null,
  },

  // Modules
  {
    name: "list_modules",
    args: {},
    method: "GET",
    path: "/lifetimeapi/rest/v2/modules/",
    mockBody: [],
  },
  {
    name: "get_module",
    args: { ModuleKey: MOD },
    method: "GET",
    path: `/lifetimeapi/rest/v2/modules/${MOD}/`,
    mockBody: { Key: MOD },
  },
  {
    name: "list_module_versions",
    args: { ModuleKey: MOD },
    method: "GET",
    path: `/lifetimeapi/rest/v2/modules/${MOD}/versions/`,
    mockBody: [],
  },
  {
    name: "get_module_version",
    args: { ModuleKey: MOD, ModuleVersionKey: MVER },
    method: "GET",
    path: `/lifetimeapi/rest/v2/modules/${MOD}/versions/${MVER}/`,
    mockBody: { Key: MVER },
  },

  // Roles
  {
    name: "list_roles",
    args: {},
    method: "GET",
    path: "/lifetimeapi/rest/v2/roles/",
    mockBody: [],
  },
  {
    name: "create_role",
    args: { body: { Name: "Reviewer" } },
    method: "POST",
    path: "/lifetimeapi/rest/v2/roles/",
    body: { Name: "Reviewer" },
    mockBody: { Key: ROLE },
  },
  {
    name: "get_role",
    args: { RoleKey: ROLE },
    method: "GET",
    path: `/lifetimeapi/rest/v2/roles/${ROLE}/`,
    mockBody: { Key: ROLE },
  },
  {
    name: "update_role",
    args: { RoleKey: ROLE, body: { Name: "Reviewer2" } },
    method: "PUT",
    path: `/lifetimeapi/rest/v2/roles/${ROLE}/`,
    body: { Name: "Reviewer2" },
    mockBody: { Key: ROLE },
  },
  {
    name: "delete_role",
    args: { RoleKey: ROLE },
    method: "DELETE",
    path: `/lifetimeapi/rest/v2/roles/${ROLE}/`,
    mockStatus: 204,
  },
  {
    name: "list_permission_levels",
    args: {},
    method: "GET",
    path: "/lifetimeapi/rest/v2/roles/permissionlevels/",
    mockBody: [],
  },

  // Teams
  {
    name: "list_teams",
    args: {},
    method: "GET",
    path: "/lifetimeapi/rest/v2/teams/",
    mockBody: [],
  },
  {
    name: "create_team",
    args: { body: { Name: "Platform" } },
    method: "POST",
    path: "/lifetimeapi/rest/v2/teams/",
    body: { Name: "Platform" },
    mockBody: { Key: TEAM },
  },
  {
    name: "get_team",
    args: { TeamKey: TEAM },
    method: "GET",
    path: `/lifetimeapi/rest/v2/teams/${TEAM}/`,
    mockBody: { Key: TEAM },
  },
  {
    name: "update_team",
    args: { TeamKey: TEAM, body: { Name: "Platform2" } },
    method: "PUT",
    path: `/lifetimeapi/rest/v2/teams/${TEAM}/`,
    body: { Name: "Platform2" },
    mockBody: { Key: TEAM },
  },
  {
    name: "delete_team",
    args: { TeamKey: TEAM },
    method: "DELETE",
    path: `/lifetimeapi/rest/v2/teams/${TEAM}/`,
    mockStatus: 204,
  },
  {
    name: "add_team_application",
    args: { TeamKey: TEAM, body: { ApplicationKey: APP } },
    method: "POST",
    path: `/lifetimeapi/rest/v2/teams/${TEAM}/applications/`,
    body: { ApplicationKey: APP },
    mockStatus: 204,
  },
  {
    name: "remove_team_application",
    args: { TeamKey: TEAM, ApplicationKey: APP },
    method: "DELETE",
    path: `/lifetimeapi/rest/v2/teams/${TEAM}/applications/${APP}`,
    mockStatus: 204,
  },
  {
    name: "add_team_user",
    args: { TeamKey: TEAM, body: { UserKey: USER, RoleKey: ROLE } },
    method: "POST",
    path: `/lifetimeapi/rest/v2/teams/${TEAM}/users/`,
    body: { UserKey: USER, RoleKey: ROLE },
    mockStatus: 204,
  },
  {
    name: "remove_team_user",
    args: { TeamKey: TEAM, UserKey: USER },
    method: "DELETE",
    path: `/lifetimeapi/rest/v2/teams/${TEAM}/users/${USER}/`,
    mockStatus: 204,
  },

  // Users
  {
    name: "list_users",
    args: { IncludeInactive: true },
    method: "GET",
    path: "/lifetimeapi/rest/v2/users/",
    queryIncludes: ["IncludeInactive=true"],
    mockBody: [],
  },
  {
    name: "create_user",
    args: { body: { Username: "new.user" } },
    method: "POST",
    path: "/lifetimeapi/rest/v2/users/",
    body: { Username: "new.user" },
    mockBody: { Key: USER },
  },
  {
    name: "get_user",
    args: { UserKey: USER },
    method: "GET",
    path: `/lifetimeapi/rest/v2/users/${USER}/`,
    mockBody: { Key: USER },
  },
  {
    name: "update_user",
    args: { UserKey: USER, body: { FirstName: "Ada" } },
    method: "PUT",
    path: `/lifetimeapi/rest/v2/users/${USER}/`,
    body: { FirstName: "Ada" },
    mockBody: { Key: USER },
  },
  {
    name: "set_user_password",
    args: { UserKey: USER, body: { Password: "secret" } },
    method: "POST",
    path: `/lifetimeapi/rest/v2/users/${USER}/setpassword/`,
    body: { Password: "secret" },
    mockStatus: 204,
  },
  {
    name: "grant_user_application_role",
    args: {
      UserKey: USER,
      body: { ApplicationKey: APP, RoleKey: ROLE },
    },
    method: "POST",
    path: `/lifetimeapi/rest/v2/users/${USER}/applications/`,
    body: { ApplicationKey: APP, RoleKey: ROLE },
    mockStatus: 204,
  },
  {
    name: "revoke_user_application_role",
    args: { UserKey: USER, ApplicationKey: APP },
    method: "DELETE",
    path: `/lifetimeapi/rest/v2/users/${USER}/applications/${APP}/`,
    mockStatus: 204,
  },
];

describe("tool catalog coverage", () => {
  it("has a case for every registered tool", () => {
    const covered = new Set(CASES.map((c) => c.name));
    const missing = TOOL_NAMES.filter((n) => !covered.has(n));
    assert.deepEqual(missing, [], `missing cases: ${missing.join(", ")}`);
    assert.equal(CASES.length, TOOL_NAMES.length);
  });
});

describe("MCP tools (mocked LifeTime API)", () => {
  for (const toolCase of CASES) {
    it(`${toolCase.method} ${toolCase.name}`, async () => {
      await withMockMcp(
        {
          status: toolCase.mockStatus ?? 200,
          body: toolCase.mockBody === undefined ? { ok: true } : toolCase.mockBody,
        },
        async ({ client, calls }) => {
          const result = await client.callTool({
            name: toolCase.name,
            arguments: toolCase.args,
          });
          assert.equal(
            result.isError,
            undefined,
            `tool error: ${JSON.stringify(result.content)}`,
          );
          assert.equal(calls.length, 1, "expected exactly one HTTP call");
          const call = calls[0]!;
          assert.equal(call.method, toolCase.method);
          assert.equal(
            call.headers.get("Authorization"),
            "Bearer test-token",
          );

          const full = apiPath(call.url);
          const [pathname, query = ""] = full.split("?");
          assert.equal(pathname, toolCase.path);
          for (const part of toolCase.queryIncludes ?? []) {
            assert.ok(
              query.includes(part),
              `expected query to include ${part}, got ${query}`,
            );
          }
          if (toolCase.body !== undefined) {
            assert.equal(call.body, JSON.stringify(toolCase.body));
          }
        },
      );
    });
  }

  it("surfaces LifeTime API errors as tool errors", async () => {
    await withMockMcp(
      { status: 403, body: { Errors: ["forbidden"] } },
      async ({ client }) => {
        const result = await client.callTool({
          name: "list_environments",
          arguments: {},
        });
        assert.equal(result.isError, true);
        const text = String(
          (result.content as Array<{ type: string; text?: string }>)[0]?.text ??
            "",
        );
        assert.match(text, /403/);
      },
    );
  });
});
