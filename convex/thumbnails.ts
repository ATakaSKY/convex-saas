import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getFullUser, isUserSubscribed } from "./users";
import { getUser, getUserId } from "./util";

// Create a new thumbnail with the given input
export const createThumbnail = mutation({
  args: {
    title: v.string(),
    imageA: v.string(),
    imageB: v.string(),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("you've to be logged in to create thubmail");
    }

    const hasSubscription = await isUserSubscribed(ctx);
    const user = await getFullUser(ctx, userId);

    if (!user) {
      throw new Error("no user with that id found");
    }

    if (!hasSubscription && user?.credits <= 0) {
      throw new Error("you must be subscribed to create thubmail");
    }

    await ctx.db.patch(user._id, {
      credits: Math.max(0, user.credits - 1),
    });

    return await ctx.db.insert("thumbnails", {
      title: args.title,
      user: userId,
      aImage: args.imageA,
      bImage: args.imageB,
      aVotes: 0,
      bVotes: 0,
      voteIds: [],
      profileImage: args.profileImage,
      comments: [],
    });
  },
});

export const addComment = mutation({
  args: { thumbnailId: v.id("thumbnails"), text: v.string() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("you've to be logged in to create thubmail");
    }

    const thumbnail = await ctx.db.get(args.thumbnailId);
    if (!thumbnail) {
      throw new Error("thumbnail does not exist");
    }

    if (!thumbnail.comments) {
      thumbnail.comments = [];
    }

    thumbnail.comments.unshift({
      createdAt: Date.now(),
      text: args.text,
      userId: user.subject,
      name: user.name ?? "Annoymous",
      profileUrl: user.pictureUrl ?? "",
    });

    await ctx.db.patch(thumbnail._id, {
      comments: thumbnail.comments,
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
    const thumbnail = await ctx.db.get(args.thumbnailId);

    if (!thumbnail) {
      return null;
    }
    const hasSubscription = await isUserSubscribed(ctx);

    let comments = thumbnail.comments?.length === 0 ? [] : [thumbnail.comments?.[0]];

    if(hasSubscription){
      comments = thumbnail.comments
    }

    return {
      ...thumbnail,
      comments,
    };
  },
});

export const getRecentThumbnails = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("thumbnails")
      .order("desc")
      .paginate(args.paginationOpts);
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
