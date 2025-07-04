import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

// Event hooks
export const useEvents = () => {
  return useQuery(api.events.getActiveEvents);
};

export const useEventsByHost = (hostId: string) => {
  return useQuery(api.events.getEventsByHost, { hostId });
};

export const useEvent = (eventId: Id<"events">) => {
  return useQuery(api.events.getEvent, { eventId });
};

export const useEventByAccessCode = (accessCode: string) => {
  return useQuery(api.events.getEventByAccessCode, accessCode ? { accessCode } : "skip");
};

export const useEventStats = (eventId: Id<"events">) => {
  return useQuery(api.events.getEventStats, { eventId });
};

export const useCreateEvent = () => {
  return useMutation(api.events.createEvent);
};

export const useUpdateEvent = () => {
  return useMutation(api.events.updateEvent);
};

export const useDeleteEvent = () => {
  return useMutation(api.events.deleteEvent);
};

// Message hooks
export const useMessagesByEvent = (args: {
  eventId: Id<"events">;
  includeUnapproved?: boolean;
}) => {
  return useQuery(api.messages.getMessagesByEvent, args);
};

export const useApprovedMessages = (eventId: Id<"events">) => {
  return useQuery(api.messages.getApprovedMessages, { eventId });
};

export const usePendingMessages = (eventId: Id<"events">) => {
  return useQuery(api.messages.getPendingMessages, { eventId });
};

export const useSubmitMessage = () => {
  return useMutation(api.messages.submitMessage);
};

// Removed useSubmitMessageWithFile as it's no longer needed
// Files are now handled directly through Convex file storage

export const useApproveMessage = () => {
  return useMutation(api.messages.approveMessage);
};

export const useRejectMessage = () => {
  return useMutation(api.messages.rejectMessage);
};

// Guest token hooks
export const useValidateGuestToken = (token: string) => {
  return useQuery(api.guestTokens.validateGuestToken, { token });
};

export const useTokensByEvent = (eventId: Id<"events">) => {
  return useQuery(api.guestTokens.getTokensByEvent, { eventId });
};

export const useActiveTokensByEvent = (eventId: Id<"events">) => {
  return useQuery(api.guestTokens.getActiveTokensByEvent, { eventId });
};

export const useGenerateShareableLink = () => {
  return useMutation(api.guestTokens.generateShareableLink);
};

export const useDeactivateGuestToken = () => {
  return useMutation(api.guestTokens.deactivateGuestToken);
};

// Media file hooks
export const useMediaFilesByMessage = (messageId: Id<"messages">) => {
  return useQuery(api.mediaFiles.getMediaFilesByMessage, { messageId });
};

export const useMediaFilesByEvent = (eventId: Id<"events">) => {
  return useQuery(api.mediaFiles.getMediaFilesByEvent, { eventId });
};

export const useMediaStats = (eventId: Id<"events">) => {
  return useQuery(api.mediaFiles.getMediaStats, { eventId });
};

export const useStoreMediaFile = () => {
  return useMutation(api.mediaFiles.storeMediaFile);
};

export const useUpdateMediaFileWithStorage = () => {
  return useMutation(api.mediaFiles.updateMediaFileWithStorage);
};

export const useGenerateUploadUrl = () => {
  return useMutation(api.files.generateUploadUrl);
};

export const useDeleteMediaFile = () => {
  return useMutation(api.mediaFiles.deleteMediaFile);
};
