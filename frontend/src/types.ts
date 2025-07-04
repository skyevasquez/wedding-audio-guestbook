import type { Id } from "../../convex/_generated/dataModel";

export interface Event {
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
  _creationTime: number;
}

export interface Message {
  _id: Id<"messages">;
  eventId: Id<"events">;
  guestName: string;
  guestEmail?: string;
  messageText?: string;
  messageType: "text" | "audio" | "video" | "photo" | "media";
  isApproved: boolean;
  _creationTime: number;
}
