import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import {
  useMessagesByEvent,
  useMediaFilesByMessage,
  useApproveMessage,
  useRejectMessage,
} from "../hooks/useConvex";
import type { Id } from "../../../convex/_generated/dataModel";
import EventPage from "./EventPage";
import QRCode from "qrcode.react";
import type { Message } from "../types";
import QRCodeCustomizer from "../components/QRCodeCustomizer";

const MessageDetailModal: React.FC<{
  message: Message;
  onClose: () => void;
  isHost: boolean;
}> = ({ message, onClose, isHost }) => {
  const mediaFiles = useMediaFilesByMessage(message._id);
  const approveMessage = useApproveMessage();
  const rejectMessage = useRejectMessage();

  const handleApprove = async () => {
    try {
      await approveMessage({ messageId: message._id });
      toast.success("Message approved!");
      onClose();
    } catch (error) {
      console.error("Error approving message:", error);
      toast.error("Failed to approve message");
    }
  };

  const handleReject = async () => {
    try {
      await rejectMessage({ messageId: message._id });
      toast.success("Message rejected!");
      onClose();
    } catch (error) {
      console.error("Error rejecting message:", error);
      toast.error("Failed to reject message");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">
              Message from {message.guestName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {mediaFiles?.map((file) => (
            <div key={file._id} className="mb-4">
              {file.mimeType.startsWith("image/") && (
                <img
                  src={file.convexFileUrl || '#'}
                  alt="Love Message"
                  className="w-full rounded-lg"
                />
              )}
              {file.mimeType.startsWith("video/") && (
                <video
                  src={file.convexFileUrl || '#'}
                  controls
                  className="w-full rounded-lg"
                />
              )}
              {file.mimeType.startsWith("audio/") && (
                <audio src={file.convexFileUrl || '#'} controls className="w-full" />
              )}
            </div>
          ))}

          {message.messageText && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Message:
              </h4>
              <p className="text-white bg-gray-700 p-3 rounded">
                {message.messageText}
              </p>
            </div>
          )}

          <div className="text-sm text-gray-400">
            Submitted on {new Date(message._creationTime).toLocaleDateString()}{" "}
            at {new Date(message._creationTime).toLocaleTimeString()}
          </div>

          {isHost && !message.isApproved && (
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleApprove}
                className="btn-primary-gold px-4 py-2 rounded-lg"
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EventView: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  // We'll determine isHost inside the EventPage render function
  // For now, fetch messages without the includeUnapproved filter
  const messages = useMessagesByEvent({
    eventId: eventId as Id<"events">,
    includeUnapproved: true, // We'll filter this based on isHost later
  });
  const messagesLoading = messages === undefined;

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/submit/${eventId}`;
    navigator.clipboard.writeText(shareLink);
    toast.success("Share link copied to clipboard!");
  };

  const generateQRCode = () => {
    setShowQRCode(true);
  };

  return (
    <EventPage eventId={eventId as Id<"events">}>
      {(event) => {
        const isHost = user?.id === event.hostId;
        
        // Filter messages based on host status
        // Note: Backend uses isApproved (boolean), so we filter accordingly
        const filteredMessages = isHost ? messages : messages?.filter(msg => msg.isApproved === true);
        
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
            {/* Header */}
            <div className="bg-black shadow-lg border-b border-yellow-500/30">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-6">
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      {event.title}
                    </h1>
                    <p className="text-gray-300">{event.description}</p>
                    <div className="text-sm text-gray-400 mt-1">
                      <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                      <p>📍 {event.location}</p>
                      <p>
                        Created{" "}
                        {new Date(event._creationTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {isHost && (
                      <Link
                        to="/dashboard"
                        className="text-yellow-500 hover:text-yellow-400 font-medium hover-lift"
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => navigate("/")}
                      className="text-yellow-500 hover:text-yellow-400 font-medium hover-lift"
                    >
                      ← Home
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Action Buttons */}
              <div className="mb-8 flex flex-wrap gap-4">
                <Link
                  to={`/submit/${eventId}`}
                  className="btn-primary-gold px-6 py-3 rounded-lg font-semibold transition-colors hover-lift"
                >
                  💕 Share Your Love
                </Link>
                <button
                  onClick={copyShareLink}
                  className="btn-secondary-gold px-6 py-3 rounded-lg font-semibold transition-colors hover-lift"
                >
                  🔗 Copy Share Link
                </button>
                <button
                  onClick={generateQRCode}
                  className="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 border border-yellow-500/30 transition-colors hover-lift"
                >
                  📱 Show QR Code
                </button>
              </div>

              {/* QR Code Customizer Modal */}
              {showQRCode && (
                <QRCodeCustomizer
                  value={`${window.location.origin}/submit/${eventId}`}
                  onClose={() => setShowQRCode(false)}
                />
              )}

              {/* Submissions Section */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Love Messages ({filteredMessages?.length || 0})
                  </h2>
                </div>

                {messagesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
                  </div>
                ) : !filteredMessages || filteredMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-yellow-500 text-6xl mb-4">💕</div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      No love messages yet
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Be the first to share your love and best wishes!
                    </p>
                    <Link
                      to={`/submit/${eventId}`}
                      className="inline-block btn-primary-gold px-6 py-2 rounded-lg transition-colors hover-lift"
                    >
                      Share Your Love
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredMessages.map((message) => (
                      <div
                        key={message._id}
                        className={`card-gold hover:shadow-xl transition-shadow cursor-pointer hover-lift hover-glow ${
                          !message.isApproved && "opacity-60"
                        }`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-white">
                            {message.guestName}
                          </h3>
                          <span className="text-2xl">
                            {message.messageType === "text" && "💬"}
                            {message.messageType === "audio" && "🎤"}
                            {message.messageType === "video" && "📹"}
                            {message.messageType === "photo" && "📷"}
                          </span>
                        </div>

                        {message.messageText && (
                          <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                            {message.messageText}
                          </p>
                        )}

                        <div className="text-xs text-gray-400">
                          {new Date(message._creationTime).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(message._creationTime).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Detail Modal */}
              {selectedMessage && (
                <MessageDetailModal
                  message={selectedMessage}
                  onClose={() => setSelectedMessage(null)}
                  isHost={isHost}
                />
              )}
            </div>
          </div>
        );
      }}
    </EventPage>
  );
};

export default EventView;
