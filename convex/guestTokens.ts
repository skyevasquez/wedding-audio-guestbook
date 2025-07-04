import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a random token
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to generate a unique token
async function generateUniqueToken(ctx: any): Promise<string> {
  let token: string;
  let existingToken;
  
  do {
    token = generateToken();
    existingToken = await ctx.db
      .query("guestTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
  } while (existingToken);
  
  return token;
}

// Create a guest access token
export const createGuestToken = mutation({
  args: {
    eventId: v.id("events"),
    guestEmail: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify the event exists
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    // Generate a unique token
    const token = await generateUniqueToken(ctx);
    
    const tokenId = await ctx.db.insert("guestTokens", {
      eventId: args.eventId,
      token,
      guestEmail: args.guestEmail,
      expiresAt: args.expiresAt,
      isActive: true,
      createdAt: Date.now(),
    });
    
    return {
      tokenId,
      token,
    };
  },
});

// Validate a guest token
export const validateGuestToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const guestToken = await ctx.db
      .query("guestTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    
    if (!guestToken || !guestToken.isActive) {
      return { valid: false, reason: "Token not found or inactive" };
    }
    
    // Check expiration
    if (guestToken.expiresAt && guestToken.expiresAt < Date.now()) {
      return { valid: false, reason: "Token expired" };
    }
    
    // Get the associated event
    const event = await ctx.db.get(guestToken.eventId);
    if (!event || !event.isActive) {
      return { valid: false, reason: "Event not found or inactive" };
    }
    
    return {
      valid: true,
      eventId: guestToken.eventId,
      event,
      guestEmail: guestToken.guestEmail,
    };
  },
});

// Get all tokens for an event
export const getTokensByEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("guestTokens")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .collect();
  },
});

// Get active tokens for an event
export const getActiveTokensByEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const tokens = await ctx.db
      .query("guestTokens")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    const now = Date.now();
    
    return tokens.filter(token => 
      token.isActive && 
      (!token.expiresAt || token.expiresAt > now)
    );
  },
});

// Deactivate a guest token
export const deactivateGuestToken = mutation({
  args: {
    tokenId: v.id("guestTokens"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.tokenId, {
      isActive: false,
    });
    
    return await ctx.db.get(args.tokenId);
  },
});

// Delete a guest token
export const deleteGuestToken = mutation({
  args: {
    tokenId: v.id("guestTokens"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.tokenId);
    return { success: true };
  },
});

// Update token expiration
export const updateTokenExpiration = mutation({
  args: {
    tokenId: v.id("guestTokens"),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.tokenId, {
      expiresAt: args.expiresAt,
    });
    
    return await ctx.db.get(args.tokenId);
  },
});



// Generate a shareable link for an event
export const generateShareableLink = mutation({
  args: {
    eventId: v.id("events"),
    guestEmail: v.optional(v.string()),
    expiresInDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const expiresAt = args.expiresInDays 
      ? Date.now() + (args.expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;
    
    // Verify the event exists
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    // Generate a unique token
    const token = await generateUniqueToken(ctx);
    
    const tokenId = await ctx.db.insert("guestTokens", {
      eventId: args.eventId,
      token,
      guestEmail: args.guestEmail,
      expiresAt,
      isActive: true,
      createdAt: Date.now(),
    });
    
    // In a real app, you'd use your actual domain
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : 'http://localhost:3001';
    
    const shareableUrl = `${baseUrl}/guest/${token}`;
    
    return {
      tokenId,
      token,
      shareableUrl,
      expiresAt,
    };
  },
});

// Clean up expired tokens (utility function)
export const cleanupExpiredTokens = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const expiredTokens = await ctx.db
      .query("guestTokens")
      .filter((q) => 
        q.and(
          q.neq(q.field("expiresAt"), undefined),
          q.lt(q.field("expiresAt"), now)
        )
      )
      .collect();
    
    let deletedCount = 0;
    for (const token of expiredTokens) {
      await ctx.db.delete(token._id);
      deletedCount++;
    }
    
    return { deletedCount };
  },
});