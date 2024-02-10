import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new thumbnail with the given input
export const createThumbnail = mutation({
  args: { title: v.string(), imageA: v.string(), imageB: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("you've to be logged in to create thubmail");
    }
    return await ctx.db.insert("thumbnails", {
      title: args.title,
      user: user.subject,
      aImage: args.imageA,
      bImage: args.imageB,
      aVotes: 0,
      bVotes: 0,
      voteIds: [],
    });
  },
});

export const getThumbnailsForUser = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      return [];
    }
    return await ctx.db
      .query("thumbnails")
      .filter((q) => q.eq(q.field("user"), user.subject))
      .collect();
  },
});

export const getThumbnail = query({
  args: { thumbnailId: v.id("thumbnails") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.thumbnailId);
  },
});

export const voteOnThumbnail = mutation({
  args: { thumbnailId: v.id("thumbnails"), voteId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("you've to be logged to vote on a thumbnail");
    }

    const thumbnail = await ctx.db.get(args.thumbnailId);

    if (thumbnail?.voteIds.includes(user.subject)) {
      throw new Error("you've already voted");
    }

    if (!thumbnail) {
      throw new Error("thumbnail not found");
    }

    if (thumbnail?.aImage === args.voteId) {
      thumbnail.aVotes++;
      await ctx.db.patch(thumbnail._id, {
        aVotes: thumbnail.aVotes,
        voteIds: [...new Set([...thumbnail.voteIds, user.subject])],
      });
    } else {
      thumbnail.bVotes++;
      await ctx.db.patch(thumbnail._id, {
        bVotes: thumbnail?.bVotes,
        voteIds: [...new Set([...thumbnail.voteIds, user.subject])],
      });
    }
  },
});

// my naive implementation for checking if user has voted
// export const hasUserVoted = query({
//   args: { thumbnailId: v.id("thumbnails") },
//   handler: async (ctx, args) => {
//     const user = await ctx.auth.getUserIdentity();
//     if (!user) {
//       throw new Error("you've to be logged in");
//     }

//     const thumbnail = await ctx.db.get(args.thumbnailId);

//     return thumbnail?.voteIds.some((voteId) => voteId === user.subject);
//   },
// });
