import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new thumbnail with the given input
export const createThumbnail = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("you've to be logged in to create thubmail");
    }
    await ctx.db.insert("thumbails", { title: args.title, user: user.subject });
  },
});

export const getThumbnails = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      return [];
    }
    return await ctx.db
      .query("thumbails")
      .filter((q) => q.eq(q.field("user"), user.subject))
      .collect();
  },
});
