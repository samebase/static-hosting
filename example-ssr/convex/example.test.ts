/// <reference types="vite/client" />
import { beforeEach, expect, test, vi } from "vitest";
import { convexTest } from "convex-test";
import component from "@convex-dev/static-hosting/test";
import server from "../dist/server/server.js";
import { api, internal } from "./_generated/api.js";
import schema from "./schema.js";

vi.mock("../dist/server/server.js", () => ({
  default: { fetch: vi.fn() },
}));

const modules = import.meta.glob("./**/*.ts");

function setup() {
  const t = convexTest(schema, modules);
  component.register(t);
  return t;
}

beforeEach(() => vi.clearAllMocks());

test("preserves TanStack's document status and disables HTML caching", async () => {
  const t = setup();
  vi.mocked(server.fetch).mockResolvedValue(
    new Response("<h1>Page not found</h1>", {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }),
  );

  const response = await t.fetch("/unknown?name=Convex");
  expect(response.status).toBe(404);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(await response.text()).toBe("<h1>Page not found</h1>");
  const request = vi.mocked(server.fetch).mock.calls[0][0];
  expect(new URL(request.url).search).toBe("?name=Convex");
});

test.each(["/assets/missing.js", "/%61ssets/missing.js"])(
  "missing browser asset %s never receives a rendered document",
  async (path) => {
    const response = await setup().fetch(path);
    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toBe("text/plain");
    expect(await response.text()).toBe("Not Found");
    expect(server.fetch).not.toHaveBeenCalled();
  },
);

test("seeding is repeatable and renamed data reaches the public query", async () => {
  const t = setup();
  await t.mutation(internal.listings.seed, {});
  await t.mutation(internal.listings.seed, {});
  await t.mutation(internal.listings.rename, {
    title: "Updated without rebuilding",
  });
  expect(await t.query(api.listings.list, {})).toEqual([
    { hostname: "alpha.example", title: "Updated without rebuilding" },
    { hostname: "beta.example", title: "Second server-rendered review" },
  ]);
});
