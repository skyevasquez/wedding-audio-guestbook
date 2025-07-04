import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Store media file metadata with Convex file storage
export const storeMediaFile = mutation({
  args: {
    messageId: v.id("messages"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    duration: v.optional(v.number()),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify the message exists
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }
    
    const mediaFileId = await ctx.db.insert("mediaFiles", {
      messageId: args.messageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      mimeType: args.mimeType,
      convexFileId: undefined, // Will be set when file is uploaded
      convexFileUrl: undefined, // Will be generated when file is uploaded
      duration: args.duration,
      thumbnailUrl: args.thumbnailUrl,
      createdAt: Date.now(),
    });
    
    return mediaFileId;
  },
});

// Get media files for a specific message
export const getMediaFilesByMessage = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mediaFiles")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .order("desc")
      .collect();
  },
});

// Get a specific media file
export const getMediaFile = query({
  args: {
    mediaFileId: v.id("mediaFiles"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.mediaFileId);
  },
});

// Update media file with Convex file storage details
export const updateMediaFileWithStorage = mutation({
  args: {
    mediaFileId: v.id("mediaFiles"),
    convexFileId: v.id("_storage"),
    convexFileUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const mediaFile = await ctx.db.get(args.mediaFileId);
    if (!mediaFile) {
      throw new Error("Media file not found");
    }
    
    await ctx.db.patch(args.mediaFileId, {
      convexFileId: args.convexFileId,
      convexFileUrl: args.convexFileUrl,
    });
    
    return { success: true };
  },
});

// Delete a media file (for cleanup)
export const deleteMediaFile = mutation({
  args: {
    mediaFileId: v.id("mediaFiles"),
  },
  handler: async (ctx, args) => {
    const mediaFile = await ctx.db.get(args.mediaFileId);
    if (!mediaFile) {
      throw new Error("Media file not found");
    }
    
    // Delete from Convex storage if file exists
    if (mediaFile.convexFileId) {
      await ctx.storage.delete(mediaFile.convexFileId);
    }
    
    await ctx.db.delete(args.mediaFileId);
    
    return {
      success: true,
      fileName: mediaFile.fileName,
    };
  },
});

// Get all media files for an event (for host dashboard)
export const getMediaFilesByEvent = query({
  args: {
    eventId: v.id("events"),
    approvedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // First get messages for the event
    let messages;
    
    if (args.approvedOnly) {
      messages = await ctx.db
        .query("messages")
        .withIndex("by_event_approved", (q) => 
          q.eq("eventId", args.eventId).eq("isApproved", true)
        )
        .collect();
    } else {
      messages = await ctx.db
        .query("messages")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .collect();
    }
    
    // Get all media files for these messages
    const allMediaFiles = [];
    
    for (const message of messages) {
      const mediaFiles = await ctx.db
        .query("mediaFiles")
        .withIndex("by_message", (q) => q.eq("messageId", message._id))
        .collect();
      
      // Add message info to each media file
      const mediaFilesWithMessage = mediaFiles.map(file => ({
        ...file,
        message: {
          _id: message._id,
          guestName: message.guestName,
          messageText: message.messageText,
          isApproved: message.isApproved,
          createdAt: message.createdAt,
        },
      }));
      
      allMediaFiles.push(...mediaFilesWithMessage);
    }
    
    // Sort by creation date (newest first)
    return allMediaFiles.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get media file statistics for an event
export const getMediaStats = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const eventMessages = await ctx.db
      .query("messages")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    const messageIds = new Set(eventMessages.map(m => m._id));
    
    const eventMediaFiles = [];
    for (const messageId of messageIds) {
        const files = await ctx.db
            .query("mediaFiles")
            .withIndex("by_message", (q) => q.eq("messageId", messageId))
            .collect();
        eventMediaFiles.push(...files);
    }
    
    const totalSize = eventMediaFiles.reduce((sum, file) => sum + file.fileSize, 0);
    
    const filesByType = {
      image: eventMediaFiles.filter(f => f.mimeType.startsWith('image/')).length,
      video: eventMediaFiles.filter(f => f.mimeType.startsWith('video/')).length,
      audio: eventMediaFiles.filter(f => f.mimeType.startsWith('audio/')).length,
      other: eventMediaFiles.filter(f => 
        !f.mimeType.startsWith('image/') && 
        !f.mimeType.startsWith('video/') && 
        !f.mimeType.startsWith('audio/')
      ).length,
    };
    
    return {
      totalFiles: eventMediaFiles.length,
      totalSize,
      filesByType,
      averageFileSize: eventMediaFiles.length > 0 ? totalSize / eventMediaFiles.length : 0,
    };
  },
});