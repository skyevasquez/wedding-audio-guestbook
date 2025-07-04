import React from "react";
import { useNavigate } from "react-router-dom";
import { useEvent } from "../hooks/useConvex";
import type { Id } from "../../../convex/_generated/dataModel";

import type { Event } from "../types";

interface EventPageProps {
  eventId: Id<"events">;
  children: (event: Event) => React.ReactNode;
}

// Helper function to validate if a string looks like a Convex ID
const isValidConvexId = (id: string): boolean => {
  // Convex IDs are typically base64-like strings with specific patterns
  return /^[a-zA-Z0-9_-]+$/.test(id) && id.length > 10;
};

const EventPage: React.FC<EventPageProps> = ({ eventId, children }) => {
  const navigate = useNavigate();
  
  // Validate the eventId format first
  if (!isValidConvexId(eventId as string)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Invalid Event Link
          </h2>
          <p className="text-gray-300 mb-6">
            The event link you're trying to access appears to be invalid or corrupted. Please check the link and try again.
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn-primary-gold px-6 py-3 rounded-lg font-semibold hover-lift"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  const event = useEvent(eventId);
  const loading = event === undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-yellow-500 text-6xl mb-4">💔</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Event Not Found
          </h2>
          <p className="text-gray-300 mb-6">
            The wedding event you're looking for doesn't exist or may have been removed. Please check with the event host for the correct link.
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn-primary-gold px-6 py-3 rounded-lg font-semibold hover-lift"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children(event)}</>;
};

export default EventPage;
