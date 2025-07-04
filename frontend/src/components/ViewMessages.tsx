import React from 'react';
import { Eye } from 'lucide-react';
import EventCodeAccess from './EventCodeAccess';

interface ViewMessagesProps {
  onClose: () => void;
}

const ViewMessages: React.FC<ViewMessagesProps> = ({ onClose }) => {
  return (
    <EventCodeAccess
      onClose={onClose}
      title="View Messages"
      description="Enter the event code to view all the beautiful messages shared for the happy couple."
      buttonText="View Messages"
      icon={<Eye className="h-8 w-8 text-yellow-500" />}
      navigateTo={(eventId) => `/event/${eventId}`}
    />
  );
};

export default ViewMessages;