import { query, internalMutation } from "./_generated/server.js";
import { v } from "convex/values";
import { listing } from "./schema.js";

export const list = query({
  args: {},
  returns: v.array(listing),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("listings")
      .withIndex("by_hostname")
      .take(6);
    return rows.map(({ hostname, title }) => ({ hostname, title }));
  },
});

export const seed = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    for (const row of [
      { hostname: "alpha.example", title: "First server-rendered review" },
      { hostname: "beta.example", title: "Second server-rendered review" },
    ]) {
      const existing = await ctx.db
        .query("listings")
        .withIndex("by_hostname", (q) => q.eq("hostname", row.hostname))
        .unique();
      if (existing) await ctx.db.patch("listings", existing._id, row);
      else await ctx.db.insert("listings", row);
    }
    return null;
  },
});

export const rename = internalMutation({
  args: { title: v.string() },
  returns: v.null(),
  handler: async (ctx, { title }) => {
    const row = await ctx.db
      .query("listings")
      .withIndex("by_hostname", (q) => q.eq("hostname", "alpha.example"))
      .unique();
    if (!row) throw new Error("Run listings:seed first.");
    await ctx.db.patch("listings", row._id, { title });
    return null;
  },
});
