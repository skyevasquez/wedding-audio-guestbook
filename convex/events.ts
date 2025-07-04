import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a random access code
function generateAccessCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to generate a unique access code
async function generateUniqueAccessCode(ctx: any): Promise<string> {
  let accessCode: string;
  let existingEvent;
  
  do {
    accessCode = generateAccessCode();
    existingEvent = await ctx.db
      .query("events")
      .withIndex("by_access_code", (q) => q.eq("accessCode", accessCode))
      .first();
  } while (existingEvent);
  
  return accessCode;
}

// Create a new event
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
    location: v.optional(v.string()),
    hostId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Generate a unique access code
    const accessCode = await generateUniqueAccessCode(ctx);
    
    const eventId = await ctx.db.insert("events", {
      title: args.title,
      description: args.description,
      date: args.date,
      location: args.location,
      hostId: args.hostId,
      accessCode,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    
    return eventId;
  },
});

// Get all events for a specific host
export const getEventsByHost = query({
  args: {
    hostId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_host", (q) => q.eq("hostId", args.hostId))
      .order("desc")
      .collect();
  },
});

// Get a specific event by ID
export const getEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId);
  },
});

// Get an event by access code (for guest access)
export const getEventByAccessCode = query({
  args: {
    accessCode: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_access_code", (q) => q.eq("accessCode", args.accessCode.toUpperCase()))
      .first();
  },
});

// Get active events (for public access)
export const getActiveEvents = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .collect();
  },
});

// Update an event
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
    location: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { eventId, ...updates } = args;
    
    // Only include defined fields in the update
    const updateData: { [key: string]: any } = {
      updatedAt: Date.now(),
    };
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });
    
    await ctx.db.patch(eventId, updateData);
    
    return await ctx.db.get(eventId);
  },
});

// Delete an event (soft delete by setting isActive to false)
export const deleteEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      isActive: false,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Get event statistics
export const getEventStats = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    const approvedMessages = messages.filter(m => m.isApproved);
    const pendingMessages = messages.filter(m => !m.isApproved);
    
    const messagesByType = {
      text: messages.filter(m => m.messageType === "text").length,
      audio: messages.filter(m => m.messageType === "audio").length,
      video: messages.filter(m => m.messageType === "video").length,
      photo: messages.filter(m => m.messageType === "photo").length,
    };
    
    return {
      totalMessages: messages.length,
      approvedMessages: approvedMessages.length,
      pendingMessages: pendingMessages.length,
      messagesByType,
    };
  },
});