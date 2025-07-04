import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useEventByAccessCode } from '../hooks/useConvex';

interface EventCodeAccessProps {
  onClose: () => void;
  title: string;
  description: string;
  buttonText: string;
  icon: React.ReactNode;
  navigateTo: (eventId: string) => string;
}

const EventCodeAccess: React.FC<EventCodeAccessProps> = ({ onClose, title, description, buttonText, icon, navigateTo }) => {
  const [eventCode, setEventCode] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  
  // Use the Convex hook to search for event by access code
  const event = useEventByAccessCode(searchCode);
  
  // Effect to handle navigation when event is found
  React.useEffect(() => {
    if (!searchCode || !isSearching) return;
    
    // If we have a search code and we're searching
    if (event !== undefined) {
      // Query has completed
      if (event) {
        // Event found - navigate
        navigate(navigateTo(event._id));
        onClose();
      } else {
        // Event not found
        toast.error('Event not found. Please check your code.');
      }
      // Reset state
      setIsSearching(false);
      setSearchCode('');
    }
  }, [event, searchCode, isSearching, navigate, navigateTo, onClose]);

  const handleEventAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventCode.trim()) {
      toast.error('Please enter an event code');
      return;
    }

    setIsSearching(true);
    setSearchCode(eventCode.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-yellow-500/30 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            {icon}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-300">{description}</p>
        </div>

        <form onSubmit={handleEventAccess} className="space-y-4">
          <div>
            <label htmlFor="eventCode" className="block text-sm font-medium text-gray-300 mb-2">
              Event Code
            </label>
            <input
              type="text"
              id="eventCode"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value.toUpperCase())}
              placeholder="Enter event code (e.g., ABBIE-SKYE-2025)"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              disabled={isSearching}
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                Accessing Event...
              </div>
            ) : (
              <>
                {icon}
                {buttonText}
              </>
            )}
          </button>
        </form>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default EventCodeAccess;