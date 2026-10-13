# outsystems-o11-lifetime-mcp

MCP server that wraps the [OutSystems O11 LifeTime API V2](https://success.outsystems.com/documentation/11/reference/outsystems_apis/lifetime_api_v2/) so agents can manage an O11 infrastructure over the Model Context Protocol.

Tools map 1:1 to LifeTime REST endpoints for applications, environments, deployments, modules, roles, teams, and users.

## Requirements

- Node.js 20+
- A LifeTime **service account** and token ([REST API authentication](https://success.outsystems.com/documentation/11/reference/outsystems_apis/lifetime_api_v2/rest_api_authentication/))

## Quick start

```bash
npm install
npm run build

export LIFETIME_URL="https://your-lt.example.com/lifetime"
export LIFETIME_TOKEN="your-service-account-token"

npm start
```

The server speaks MCP over **stdio**. Point your MCP client at `dist/index.js` (or `npm run dev` during development).

Do not commit tokens. Prefer environment variables or your MCP client’s secret/env settings. `.env` is gitignored if you use one locally for tests.

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `LIFETIME_URL` | one of URL / API base | LifeTime environment root, e.g. `https://your-lt.example.com` or `…/lifetime` |
| `LIFETIME_API_BASE_URL` | one of URL / API base | Full API base override |
| `LIFETIME_TOKEN` | yes | Service account bearer token (`LIFETIME_API_TOKEN` also accepted) |

**URL resolution:** if LifeTime is at `https://host.example.com/lifetime`, the API base becomes `https://host.example.com/lifetimeapi/rest/v2`. Trailing `/lifetime` is stripped automatically.

See `.env.example` for a local template. The MCP server process does not load `.env` itself — export variables in the shell or set them in the MCP client config.

## Cursor setup

Add to `~/.cursor/mcp.json` or project `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "outsystems-o11-lifetime": {
      "command": "node",
      "args": ["/absolute/path/to/outsystems-o11-lifetime-mcp/dist/index.js"],
      "env": {
        "LIFETIME_URL": "https://your-lt.example.com/lifetime",
        "LIFETIME_TOKEN": "your-service-account-token"
      }
    }
  }
}
```

Restart Cursor (or reload MCP servers), then call tools such as `list_environments` or `list_users`.

## Tools

50 tools, grouped by LifeTime resource:

| Area | Tools |
|------|--------|
| **Applications** | `list_applications`, `get_application`, `list_application_versions`, `get_application_version`, `delete_application_version`, `get_application_version_content` |
| **Environments** | `list_environments`, `get_environment`, `list_environment_applications`, `create_environment_application`, `get_environment_application`, `get_environment_application_content`, `create_application_version_from_environment`, `list_deployment_zones`, `list_environment_templates`, `get_content_security_policies`, `set_content_security_policies` |
| **Deployments** | `list_deployments`, `create_deployment`, `get_deployment`, `update_deployment`, `delete_deployment`, `get_deployment_status`, `execute_deployment_command` |
| **Modules** | `list_modules`, `get_module`, `list_module_versions`, `get_module_version` |
| **Roles** | `list_roles`, `create_role`, `get_role`, `update_role`, `delete_role`, `list_permission_levels` |
| **Teams** | `list_teams`, `create_team`, `get_team`, `update_team`, `delete_team`, `add_team_application`, `remove_team_application`, `add_team_user`, `remove_team_user` |
| **Users** | `list_users`, `create_user`, `get_user`, `update_user`, `set_user_password`, `grant_user_application_role`, `revoke_user_application_role` |

Full HTTP method/path map: [`docs/lifetime-api-v2-endpoints.md`](docs/lifetime-api-v2-endpoints.md).

All calls use `Authorization: Bearer <token>` over HTTPS. Effective permissions match the service account’s LifeTime roles and teams.

## Development

```bash
npm install
npm run typecheck
npm run test:unit    # config, client, and mocked cases for all 50 tools
npm run test:live    # read-only tools against a real LifeTime (needs env vars)
npm run smoke        # list registered tools + one mock call
npm run build
```

`npm test` runs every `test/**/*.test.ts` file. Live tests run when `LIVE_LIFETIME_TESTS=1` or when `LIFETIME_URL` + `LIFETIME_TOKEN` are set (including via a local `.env` loaded by the live test helper).

## API reference

- [LifeTime API v2](https://success.outsystems.com/documentation/11/reference/outsystems_apis/lifetime_api_v2/)
- [REST API authentication](https://success.outsystems.com/documentation/11/reference/outsystems_apis/lifetime_api_v2/rest_api_authentication/)
- Swagger: download from LifeTime Management Console binaries (11.5.0+)

## License

Apache-2.0
