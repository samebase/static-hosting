import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const listing = v.object({ hostname: v.string(), title: v.string() });

export default defineSchema({
  listings: defineTable(listing).index("by_hostname", ["hostname"]),
});
