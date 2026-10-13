# outsystems-o11-lifetime-mcp

MCP server that wraps the [OutSystems O11 LifeTime API V2](https://success.outsystems.com/documentation/11/reference/outsystems_apis/lifetime_api_v2/).

Agents can manage applications, environments, deployments, modules, roles, teams, and users through MCP tools that map 1:1 to LifeTime REST endpoints.

## Requirements

- Node.js 20+
- A LifeTime **service account** token ([REST API authentication](https://success.outsystems.com/documentation/11/reference/outsystems_apis/lifetime_api_v2/rest_api_authentication/))

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `LIFETIME_URL` | one of URL / API base | LifeTime host, e.g. `https://example-lt.company.com` (trailing `/lifetime` is stripped) |
| `LIFETIME_API_BASE_URL` | one of URL / API base | Full API base override, e.g. `https://example-lt.company.com/lifetimeapi/rest/v2` |
| `LIFETIME_TOKEN` | yes | Service account bearer token (`LIFETIME_API_TOKEN` also accepted) |

API base resolution (from docs): if LifeTime is at `example-lt.example.com/lifetime`, the API is at `example-lt.example.com/lifetimeapi/rest/v2`.

Copy `.env.example` and fill in values for local runs.

## Install & run

```bash
npm install
npm run build
export LIFETIME_URL=https://your-lt.example.com
export LIFETIME_TOKEN=your-service-account-token
npm start
```

Dev (tsx, no build):

```bash
npm run dev
```

## Cursor MCP config

Add to `~/.cursor/mcp.json` or `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "outsystems-o11-lifetime": {
      "command": "node",
      "args": ["/absolute/path/to/outsystems-o11-lifetime-mcp/dist/index.js"],
      "env": {
        "LIFETIME_URL": "https://your-lt.example.com",
        "LIFETIME_TOKEN": "your-service-account-token"
      }
    }
  }
}
```

Or via `npx` after publish:

```json
{
  "mcpServers": {
    "outsystems-o11-lifetime": {
      "command": "npx",
      "args": ["-y", "outsystems-o11-lifetime-mcp"],
      "env": {
        "LIFETIME_URL": "https://your-lt.example.com",
        "LIFETIME_TOKEN": "your-service-account-token"
      }
    }
  }
}
```

## Tools

50 tools covering LifeTime API v2:

- **Applications** — list/get apps & versions, delete version, download content link
- **Environments** — list/get envs, running apps, create app/version, deploy zones, templates, CSP
- **Deployments** — create/list/update/delete, status, `start` / `continue` / `abort`
- **Modules** — list/get modules & versions
- **Roles** — CRUD + permission levels
- **Teams** — CRUD, add/remove apps & users
- **Users** — CRUD, set password, grant/revoke application roles

Every request sends `Authorization: Bearer <LIFETIME_TOKEN>` over HTTPS. Permissions match the service account’s LifeTime roles and teams.

## Development

```bash
npm run typecheck
npm test          # unit + mocked tool cases for all 50 tools; live read-only if .env present
npm run test:unit # mocked only
npm run test:live # read-only tools against real LifeTime (needs LIFETIME_URL + LIFETIME_TOKEN)
npm run smoke
```

## API reference

- [LifeTime API v2](https://success.outsystems.com/documentation/11/reference/outsystems_apis/lifetime_api_v2/)
- [REST API authentication](https://success.outsystems.com/documentation/11/reference/outsystems_apis/lifetime_api_v2/rest_api_authentication/)
- Swagger file: download from LifeTime Management Console binaries (11.5.0+)

## License

Apache-2.0
