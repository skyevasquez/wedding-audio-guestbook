/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 */

export type Id<T extends string> = string & { __tableName: T };

export interface DataModel {
  events: {
    _id: Id<"events">;
    title: string;
    description?: string;
    date: string;
    location?: string;
    hostId: string;
    accessCode: string;
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
  };
  messages: {
    _id: Id<"messages">;
    eventId: Id<"events">;
    guestName: string;
    guestEmail?: string;
    messageText?: string;
    messageType: "text" | "audio" | "video" | "photo" | "media";
    isApproved: boolean;
    createdAt: number;
  };
  mediaFiles: {
    _id: Id<"mediaFiles">;
    messageId: Id<"messages">;
    fileName: string;
    fileSize: number;
    mimeType: string;
    convexFileId?: Id<"_storage">;
    convexFileUrl?: string;
    duration?: number;
    thumbnailUrl?: string;
    createdAt: number;
  };
  guestTokens: {
    _id: Id<"guestTokens">;
    eventId: Id<"events">;
    token: string;
    guestEmail?: string;
    expiresAt?: number;
    isActive: boolean;
    createdAt: number;
  };
  _storage: {
    _id: Id<"_storage">;
  };
}

export type TableNames = keyof DataModel;
