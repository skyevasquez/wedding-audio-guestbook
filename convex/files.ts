import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Generate upload URL for Convex file storage
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Get file URL from storage ID
export const getUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});