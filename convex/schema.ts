import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Events table - stores wedding event information
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(), // ISO date string
    location: v.optional(v.string()),
    hostId: v.string(), // Clerk user ID
    accessCode: v.string(), // unique access code for guests
    isActive: v.boolean(),
    createdAt: v.number(), // timestamp
    updatedAt: v.number(), // timestamp
  })
    .index("by_host", ["hostId"])
    .index("by_active", ["isActive"])
    .index("by_access_code", ["accessCode"]),

  // Messages table - stores guest messages for events
  messages: defineTable({
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
    isApproved: v.boolean(),
    createdAt: v.number(), // timestamp
  })
    .index("by_event", ["eventId"])
    .index("by_event_approved", ["eventId", "isApproved"])
    .index("by_created_at", ["createdAt"]),

  // Media files table - stores metadata for uploaded files
  mediaFiles: defineTable({
    messageId: v.id("messages"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    convexFileId: v.optional(v.id("_storage")), // Convex file storage ID
    convexFileUrl: v.optional(v.string()), // Generated URL from Convex file storage
    duration: v.optional(v.number()), // for audio/video files in seconds
    thumbnailUrl: v.optional(v.string()), // for video files
    createdAt: v.number(), // timestamp
  })
    .index("by_message", ["messageId"])
    .index("by_created_at", ["createdAt"]),

  // Guest access tokens - for secure guest access to specific events
  guestTokens: defineTable({
    eventId: v.id("events"),
    token: v.string(), // unique access token
    guestEmail: v.optional(v.string()),
    expiresAt: v.optional(v.number()), // timestamp, null for no expiration
    isActive: v.boolean(),
    createdAt: v.number(), // timestamp
  })
    .index("by_token", ["token"])
    .index("by_event", ["eventId"])
    .index("by_active", ["isActive"]),
});