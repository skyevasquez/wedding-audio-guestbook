import React from 'react';
import { Heart } from 'lucide-react';
import EventCodeAccess from './EventCodeAccess';

interface GuestAccessProps {
  onClose: () => void;
}

const GuestAccess: React.FC<GuestAccessProps> = ({ onClose }) => {
  return (
    <EventCodeAccess
      onClose={onClose}
      title="Leave Your Message"
      description="Enter the event code to share your heartfelt wishes with the happy couple."
      buttonText="Access Event"
      icon={<Heart className="h-8 w-8 text-yellow-500" />}
      navigateTo={(eventId) => `/submit/${eventId}`}
    />
  );
};

export default GuestAccess;