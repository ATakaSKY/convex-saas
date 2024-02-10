import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  thumbails: defineTable({
    title: v.string(),
    user: v.string(),
    aImage: v.optional(v.string()),
    bImage: v.optional(v.string()),
  }),
});
