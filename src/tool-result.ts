import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { LifeTimeApiError } from "./client.js";

export function jsonResult(data: unknown): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text:
          data === null || data === undefined
            ? "null"
            : typeof data === "string"
              ? data
              : JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function errorResult(err: unknown): CallToolResult {
  if (err instanceof LifeTimeApiError) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: err.message,
              status: err.status,
              path: err.path,
              body: err.body,
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  const message = err instanceof Error ? err.message : String(err);
  return {
    isError: true,
    content: [{ type: "text", text: message }],
  };
}

export async function runTool(
  fn: () => Promise<unknown>,
): Promise<CallToolResult> {
  try {
    return jsonResult(await fn());
  } catch (err) {
    return errorResult(err);
  }
}
