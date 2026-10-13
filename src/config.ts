export type LifeTimeConfig = {
  /** Fully resolved API base, e.g. https://host/lifetimeapi/rest/v2 */
  apiBaseUrl: string;
  token: string;
};

/**
 * Normalize a LifeTime environment URL into the V2 REST API base.
 *
 * Docs: if LifeTime is at example-lt.example.com/lifetime,
 * the API base is example-lt.example.com/lifetimeapi/rest/v2.
 */
export function resolveApiBaseUrl(
  lifetimeUrl: string,
  explicitApiBase?: string,
): string {
  if (explicitApiBase?.trim()) {
    return explicitApiBase.trim().replace(/\/+$/, "");
  }

  let url = lifetimeUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  const parsed = new URL(url);
  let path = parsed.pathname.replace(/\/+$/, "");

  // Strip trailing /lifetime or /LifeTime console path if present
  path = path.replace(/\/lifetime$/i, "");

  // If caller already pointed at the API base, keep it
  if (/\/lifetimeapi\/rest\/v2$/i.test(path)) {
    parsed.pathname = path;
    return parsed.toString().replace(/\/+$/, "");
  }

  // Strip any leftover /lifetimeapi suffix before re-appending
  path = path.replace(/\/lifetimeapi$/i, "");
  parsed.pathname = `${path}/lifetimeapi/rest/v2`.replace(/\/{2,}/g, "/");
  if (!parsed.pathname.startsWith("/")) {
    parsed.pathname = `/${parsed.pathname}`;
  }

  return parsed.toString().replace(/\/+$/, "");
}

export function loadConfig(
  env: NodeJS.ProcessEnv = process.env,
): LifeTimeConfig {
  const token = (env.LIFETIME_TOKEN ?? env.LIFETIME_API_TOKEN)?.trim();
  if (!token) {
    throw new Error(
      "Missing required environment variable LIFETIME_TOKEN. See .env.example.",
    );
  }

  const explicit = env.LIFETIME_API_BASE_URL?.trim();
  const lifetimeUrl = env.LIFETIME_URL?.trim();

  if (!explicit && !lifetimeUrl) {
    throw new Error(
      "Set LIFETIME_URL or LIFETIME_API_BASE_URL. See .env.example.",
    );
  }

  return {
    apiBaseUrl: resolveApiBaseUrl(lifetimeUrl ?? "", explicit),
    token,
  };
}

/** Validate env without throwing; returns Error on failure. */
export function tryLoadConfig(
  env: NodeJS.ProcessEnv = process.env,
): LifeTimeConfig | Error {
  try {
    return loadConfig(env);
  } catch (err) {
    return err instanceof Error ? err : new Error(String(err));
  }
}
