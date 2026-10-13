import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadConfig, resolveApiBaseUrl } from "../src/config.js";

describe("resolveApiBaseUrl", () => {
  it("appends /lifetimeapi/rest/v2 to a host", () => {
    assert.equal(
      resolveApiBaseUrl("https://lt.example.com"),
      "https://lt.example.com/lifetimeapi/rest/v2",
    );
  });

  it("strips trailing /lifetime console path", () => {
    assert.equal(
      resolveApiBaseUrl("https://lt.example.com/lifetime"),
      "https://lt.example.com/lifetimeapi/rest/v2",
    );
  });

  it("adds https when scheme is missing", () => {
    assert.equal(
      resolveApiBaseUrl("lt.example.com"),
      "https://lt.example.com/lifetimeapi/rest/v2",
    );
  });

  it("keeps an explicit API base URL", () => {
    assert.equal(
      resolveApiBaseUrl(
        "ignored",
        "https://lt.example.com/lifetimeapi/rest/v2/",
      ),
      "https://lt.example.com/lifetimeapi/rest/v2",
    );
  });

  it("accepts a URL that already includes the API path", () => {
    assert.equal(
      resolveApiBaseUrl("https://lt.example.com/lifetimeapi/rest/v2"),
      "https://lt.example.com/lifetimeapi/rest/v2",
    );
  });
});

describe("loadConfig", () => {
  it("loads from LIFETIME_URL and LIFETIME_TOKEN", () => {
    const config = loadConfig({
      LIFETIME_URL: "https://lt.example.com",
      LIFETIME_TOKEN: "tok",
    });
    assert.equal(config.apiBaseUrl, "https://lt.example.com/lifetimeapi/rest/v2");
    assert.equal(config.token, "tok");
  });

  it("prefers LIFETIME_API_BASE_URL", () => {
    const config = loadConfig({
      LIFETIME_API_BASE_URL: "https://custom.example/api",
      LIFETIME_TOKEN: "tok",
    });
    assert.equal(config.apiBaseUrl, "https://custom.example/api");
  });

  it("throws when token is missing", () => {
    assert.throws(
      () => loadConfig({ LIFETIME_URL: "https://lt.example.com" }),
      /LIFETIME_TOKEN/,
    );
  });
});
