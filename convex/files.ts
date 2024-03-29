import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// export const saveStorageId = mutation({
//     // You can customize these as you like
//     args: {
//       uploaded: v.object({
//         storageId: v.string(),
//       }),
//       // other args...
//     },
//     handler: async (ctx, args) => {
//       // use `args` and/or `ctx.auth` to authorize the user
//       // ...

//       // Save the storageId to the database using `insert`
//       ctx.db.insert("someTable", {
//         storageId: args.uploaded.storageId,
//         // ...
//       });
//       // or `patch`/`replace`
//       ctx.db.patch(someId, {
//         storageId: args.uploaded.storageId,
//         // ...
//       });
//     },
//   });
