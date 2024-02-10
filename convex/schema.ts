import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  thumbails: defineTable({
    title: v.string(),
    user: v.string(),
  }),
});
