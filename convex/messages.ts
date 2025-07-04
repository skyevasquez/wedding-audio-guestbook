import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Submit a new message from a guest
export const submitMessage = mutation({
  args: {
    eventId: v.id("events"),
    guestName: v.string(),
    guestEmail: v.optional(v.string()),
    messageText: v.optional(v.string()),
    messageType: v.union(
      v.literal("text"),
      v.literal("audio"),
      v.literal("video"),
      v.literal("photo"),
      v.literal("media")
    ),
  },
  handler: async (ctx, args) => {
    // Verify the event exists and is active
    const event = await ctx.db.get(args.eventId);
    if (!event || !event.isActive) {
      throw new Error("Event not found or inactive");
    }
    
    const messageId = await ctx.db.insert("messages", {
      eventId: args.eventId,
      guestName: args.guestName,
      guestEmail: args.guestEmail,
      messageText: args.messageText,
      messageType: args.messageType,
      isApproved: false, // All messages start as pending
      createdAt: Date.now(),
    });
    
    return messageId;
  },
});

async function getMessagesWithMedia(ctx: any, messages: any[]) {
  return await Promise.all(
    messages.map(async (message) => {
      const mediaFiles = await ctx.db
        .query("mediaFiles")
        .withIndex("by_message", (q) => q.eq("messageId", message._id))
        .collect();
      
      return {
        ...message,
        mediaFiles,
      };
    })
  );
}

// Get all messages for an event (host view - includes pending)
export const getMessagesByEvent = query({
  args: {
    eventId: v.id("events"),
    includeUnapproved: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let messages;
    
    if (args.includeUnapproved) {
      // Host view - show all messages
      messages = await ctx.db
        .query("messages")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .order("desc")
        .collect();
    } else {
      // Public view - only approved messages
      messages = await ctx.db
        .query("messages")
        .withIndex("by_event_approved", (q: any) => 
          q.eq("eventId", args.eventId).eq("isApproved", true)
        )
        .order("desc")
        .collect();
    }
    
    return await getMessagesWithMedia(ctx, messages);
  },
});

// Get approved messages for public display
export const getApprovedMessages = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_event_approved", (q) => 
        q.eq("eventId", args.eventId).eq("isApproved", true)
      )
      .order("desc")
      .collect();
    
    return await getMessagesWithMedia(ctx, messages);
  },
});

// Get pending messages for host moderation
export const getPendingMessages = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_event_approved", (q) => 
        q.eq("eventId", args.eventId).eq("isApproved", false)
      )
      .order("desc")
      .collect();
    
    return await getMessagesWithMedia(ctx, messages);
  },
});

// Approve a message
export const approveMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      isApproved: true,
    });
    
    return await ctx.db.get(args.messageId);
  },
});

// Reject/delete a message
export const rejectMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    // First, delete associated media files
    const mediaFiles = await ctx.db
      .query("mediaFiles")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .collect();
    
    // Delete media file records
    await Promise.all(
      mediaFiles.map(async (file) => {
        await ctx.db.delete(file._id);
      })
    );
    
    // Delete the message
    await ctx.db.delete(args.messageId);
    
    return { success: true, deletedMediaFiles: mediaFiles.length };
  },
});

// Get a specific message with media
export const getMessage = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) return null;
    
    const mediaFiles = await ctx.db
      .query("mediaFiles")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .collect();
    
    return {
      ...message,
      mediaFiles,
    };
  },
});