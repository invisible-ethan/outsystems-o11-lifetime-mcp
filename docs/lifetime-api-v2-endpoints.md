# LifeTime API v2 endpoint map

Source: [LifeTime API v2](https://success.outsystems.com/documentation/11/reference/outsystems_apis/lifetime_api_v2/)

Base URL: `<lifetime-domain>/lifetimeapi/rest/v2`  
Auth: `Authorization: Bearer <service-account-token>`

| MCP tool | Method | Path |
|----------|--------|------|
| `list_applications` | GET | `/applications/` |
| `get_application` | GET | `/applications/{ApplicationKey}/` |
| `list_application_versions` | GET | `/applications/{ApplicationKey}/versions/` |
| `delete_application_version` | DELETE | `/applications/{ApplicationKey}/versions/{VersionKey}/` |
| `get_application_version` | GET | `/applications/{ApplicationKey}/versions/{VersionKey}/` |
| `get_application_version_content` | GET | `/applications/{ApplicationKey}/versions/{VersionKey}/content/` |
| `list_environments` | GET | `/environments/` |
| `get_environment` | GET | `/environments/{EnvironmentKey}/` |
| `list_environment_applications` | GET | `/environments/{EnvironmentKey}/applications/` |
| `create_environment_application` | POST | `/environments/{EnvironmentKey}/applications/` |
| `get_environment_application` | GET | `/environments/{EnvironmentKey}/applications/{ApplicationKey}/` |
| `get_environment_application_content` | GET | `/environments/{EnvironmentKey}/applications/{ApplicationKey}/content/` |
| `create_application_version_from_environment` | POST | `/environments/{EnvironmentKey}/applications/{ApplicationKey}/versions/` |
| `list_deployment_zones` | GET | `/environments/{EnvironmentKey}/deploymentzones/` |
| `list_environment_templates` | GET | `/environments/{EnvironmentKey}/templates/` |
| `get_content_security_policies` | GET | `/environments/{EnvironmentKey}/content_security_policies/` |
| `set_content_security_policies` | PUT | `/environments/{EnvironmentKey}/content_security_policies/` |
| `create_deployment` | POST | `/deployments/` |
| `list_deployments` | GET | `/deployments/` |
| `delete_deployment` | DELETE | `/deployments/{DeploymentKey}/` |
| `update_deployment` | PUT | `/deployments/{DeploymentKey}/` |
| `get_deployment` | GET | `/deployments/{DeploymentKey}/` |
| `execute_deployment_command` | POST | `/deployments/{DeploymentKey}/{Command}/` |
| `get_deployment_status` | GET | `/deployments/{DeploymentKey}/status/` |
| `list_modules` | GET | `/modules/` |
| `get_module` | GET | `/modules/{ModuleKey}/` |
| `list_module_versions` | GET | `/modules/{ModuleKey}/versions/` |
| `get_module_version` | GET | `/modules/{ModuleKey}/versions/{ModuleVersionKey}/` |
| `list_roles` | GET | `/roles/` |
| `create_role` | POST | `/roles/` |
| `get_role` | GET | `/roles/{RoleKey}/` |
| `update_role` | PUT | `/roles/{RoleKey}/` |
| `delete_role` | DELETE | `/roles/{RoleKey}/` |
| `list_permission_levels` | GET | `/roles/permissionlevels/` |
| `list_teams` | GET | `/teams/` |
| `create_team` | POST | `/teams/` |
| `get_team` | GET | `/teams/{TeamKey}/` |
| `update_team` | PUT | `/teams/{TeamKey}/` |
| `delete_team` | DELETE | `/teams/{TeamKey}/` |
| `add_team_application` | POST | `/teams/{TeamKey}/applications/` |
| `remove_team_application` | DELETE | `/teams/{TeamKey}/applications/{ApplicationKey}` |
| `add_team_user` | POST | `/teams/{TeamKey}/users/` |
| `remove_team_user` | DELETE | `/teams/{TeamKey}/users/{UserKey}/` |
| `list_users` | GET | `/users/` |
| `create_user` | POST | `/users/` |
| `get_user` | GET | `/users/{UserKey}/` |
| `update_user` | PUT | `/users/{UserKey}/` |
| `set_user_password` | POST | `/users/{UserKey}/setpassword/` |
| `grant_user_application_role` | POST | `/users/{UserKey}/applications/` |
| `revoke_user_application_role` | DELETE | `/users/{UserKey}/applications/{ApplicationKey}/` |
