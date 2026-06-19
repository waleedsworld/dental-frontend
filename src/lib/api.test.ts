import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiFetch, BASE_URL } from "@/lib/api";

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const getCall = () => {
    const mock = fetch as unknown as ReturnType<typeof vi.fn>;
    return mock.mock.calls[0];
  };

  it("prefixes the endpoint with the base url", async () => {
    await apiFetch("/topics");
    const [url] = getCall();
    expect(url).toBe(`${BASE_URL}/topics`);
  });

  it("always sends the ngrok skip-warning and accept headers", async () => {
    await apiFetch("/topics");
    const [, options] = getCall();
    const headers = options.headers as Headers;
    expect(headers.get("ngrok-skip-browser-warning")).toBe("69420");
    expect(headers.get("Accept")).toBe("application/json");
  });

  it("adds a JSON content-type when a body is present", async () => {
    await apiFetch("/topics", { method: "POST", body: JSON.stringify({ a: 1 }) });
    const [, options] = getCall();
    const headers = options.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("does not override an explicit content-type", async () => {
    await apiFetch("/upload", {
      method: "POST",
      body: "raw",
      headers: { "Content-Type": "text/plain" },
    });
    const [, options] = getCall();
    const headers = options.headers as Headers;
    expect(headers.get("Content-Type")).toBe("text/plain");
  });

  it("omits content-type when there is no body", async () => {
    await apiFetch("/topics");
    const [, options] = getCall();
    const headers = options.headers as Headers;
    expect(headers.has("Content-Type")).toBe(false);
  });

  it("forwards the http method and returns the fetch response", async () => {
    const res = await apiFetch("/topics", { method: "DELETE" });
    const [, options] = getCall();
    expect(options.method).toBe("DELETE");
    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(200);
  });
});
