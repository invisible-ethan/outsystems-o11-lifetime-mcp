# outsystems-o11-lifetime-mcp

[![npm version](https://img.shields.io/npm/v/outsystems-o11-lifetime-mcp.svg)](https://www.npmjs.com/package/outsystems-o11-lifetime-mcp)

MCP server that wraps the [OutSystems O11 LifeTime API V2](https://success.outsystems.com/documentation/11/reference/outsystems_apis/lifetime_api_v2/) so agents can manage an O11 infrastructure over the Model Context Protocol.

**npm:** [outsystems-o11-lifetime-mcp](https://www.npmjs.com/package/outsystems-o11-lifetime-mcp)

Tools map 1:1 to LifeTime REST endpoints for applications, environments, deployments, modules, roles, teams, and users.

## Requirements

- Node.js 20+
- A LifeTime **service account** and token ([REST API authentication](https://success.outsystems.com/documentation/11/reference/outsystems_apis/lifetime_api_v2/rest_api_authentication/))

## Install / run

```bash
npx -y outsystems-o11-lifetime-mcp
```

Set `LIFETIME_URL` and `LIFETIME_TOKEN` in the environment (or in your MCP client config). The server speaks MCP over **stdio**.

Do not commit tokens. Prefer environment variables or your MCP client’s secret/env settings.

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `LIFETIME_URL` | one of URL / API base | LifeTime environment root, e.g. `https://your-lt.example.com` or `…/lifetime` |
| `LIFETIME_API_BASE_URL` | one of URL / API base | Full API base override |
| `LIFETIME_TOKEN` | yes | Service account bearer token (`LIFETIME_API_TOKEN` also accepted) |

**URL resolution:** if LifeTime is at `https://host.example.com/lifetime`, the API base becomes `https://host.example.com/lifetimeapi/rest/v2`. Trailing `/lifetime` is stripped automatically.

See `.env.example` for a local template. The MCP server process does not load `.env` itself — export variables in the shell or set them in the MCP client config.

## MCP client setup

### Cursor

Add to `~/.cursor/mcp.json` or project `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "outsystems-o11-lifetime": {
      "command": "npx",
      "args": ["-y", "outsystems-o11-lifetime-mcp"],
      "env": {
        "LIFETIME_URL": "https://your-lt.example.com/lifetime",
        "LIFETIME_TOKEN": "your-service-account-token"
      }
    }
  }
}
```

Restart Cursor (or reload MCP servers), then call tools such as `list_environments` or `list_users`.

### Claude Code

Add a local stdio server with the Claude Code CLI ([MCP docs](https://code.claude.com/docs/en/mcp)):

```bash
claude mcp add \
  --transport stdio \
  --env LIFETIME_URL=https://your-lt.example.com/lifetime \
  --env LIFETIME_TOKEN=your-service-account-token \
  outsystems-o11-lifetime \
  -- npx -y outsystems-o11-lifetime-mcp
```

Notes:

- Put env vars with `--env` **before** the server name, and put the launch command after `--` so Claude Code does not treat `npx` flags as its own options.
- Default scope is local/user. Use `--scope project` to write a shared project `.mcp.json`, or `--scope user` for your user config.

Equivalent JSON (project `.mcp.json`, or `claude mcp add-json`):

```json
{
  "mcpServers": {
    "outsystems-o11-lifetime": {
      "command": "npx",
      "args": ["-y", "outsystems-o11-lifetime-mcp"],
      "env": {
        "LIFETIME_URL": "https://your-lt.example.com/lifetime",
        "LIFETIME_TOKEN": "your-service-account-token"
      }
    }
  }
}
```

Verify the server:

```bash
claude mcp get outsystems-o11-lifetime
claude mcp list
```

Then start Claude Code (`claude`) and ask it to use tools such as `list_environments` or `list_users`.

### Local checkout (optional)

```bash
git clone https://github.com/invisible-ethan/outsystems-o11-lifetime-mcp.git
cd outsystems-o11-lifetime-mcp
npm install
npm run build

export LIFETIME_URL="https://your-lt.example.com/lifetime"
export LIFETIME_TOKEN="your-service-account-token"
npm start
```

Point your MCP client at the built binary instead of `npx` if you prefer:

```json
{
  "command": "node",
  "args": ["/absolute/path/to/outsystems-o11-lifetime-mcp/dist/index.js"]
}
```

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

### Publishing

```bash
npm run build
npm version patch   # or minor / major
npm publish --access public
```

Requires an npm account with publish rights (2FA / granular token with bypass as needed).

## API reference

- [LifeTime API v2](https://success.outsystems.com/documentation/11/reference/outsystems_apis/lifetime_api_v2/)
- [REST API authentication](https://success.outsystems.com/documentation/11/reference/outsystems_apis/lifetime_api_v2/rest_api_authentication/)
- Swagger: download from LifeTime Management Console binaries (11.5.0+)

## License

Apache-2.0
