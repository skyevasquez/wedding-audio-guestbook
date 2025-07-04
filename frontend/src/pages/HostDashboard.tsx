import React, { useState } from 'react';
import { useUser, SignOutButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useEventsByHost, useCreateEvent } from '../hooks/useConvex';
import type { Event } from '../types';

const HostDashboard: React.FC = () => {
  const { user } = useUser();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    description: '', 
    date: '', 
    location: '' 
  });

  // Use Convex hooks
  const events = useEventsByHost(user?.id || '');
  const createEventMutation = useCreateEvent();
  const loading = events === undefined;

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be signed in to create an event');
      return;
    }

    try {
      await createEventMutation({
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        location: newEvent.location,
        hostId: user.id
      });
      
      toast.success('Event created successfully!');
      setNewEvent({ title: '', description: '', date: '', location: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const shareEvent = (event: Event) => {
    const shareText = `Join our wedding event "${event.title}"!\n\nAccess Code: ${event.accessCode}\n\nDate: ${new Date(event.date).toLocaleDateString()}\nLocation: ${event.location}\n\nUse this code to leave your messages and memories!`;
    
    if (navigator.share) {
      navigator.share({
        title: `Wedding Event: ${event.title}`,
        text: shareText,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Event details copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-black/90 shadow-sm border-b border-yellow-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Wedding Dashboard</h1>
              <p className="text-gray-300">Welcome back, {user?.firstName || user?.fullName || 'Host'}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-yellow-500 hover:text-yellow-400 font-medium hover-lift transition-all duration-300"
              >
                ← Back to Home
              </Link>
              <SignOutButton>
                <button className="text-red-400 hover:text-red-300 font-medium hover-lift transition-all duration-300">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Event Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary-gold px-6 py-3 rounded-lg font-semibold hover-lift"
          >
            {showCreateForm ? 'Cancel' : '+ Create Wedding Memory Collection'}
          </button>
        </div>

        {/* Create Event Form */}
        {showCreateForm && (
          <div className="card-gold p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Create Wedding Memory Collection</h2>
            <form onSubmit={createEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-yellow-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-500 transition-all duration-300"
                  placeholder="e.g., Wedding Reception Messages"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-black border border-yellow-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-500 transition-all duration-300"
                  placeholder="Share your love and best wishes..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Date
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-yellow-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-500 transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-yellow-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-500 transition-all duration-300"
                  placeholder="e.g., Grand Ballroom, Hotel Paradise"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary-gold px-6 py-2 rounded-md hover-lift"
              >
                Create Event
              </button>
            </form>
          </div>
        )}

        {/* Events List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {!events || events.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-yellow-500 text-6xl mb-4">💕</div>
              <h3 className="text-lg font-medium text-white mb-2">No events yet</h3>
              <p className="text-gray-300">Create your first wedding event to start gathering love messages!</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event._id} className="card-gold hover-lift">
                <h3 className="text-xl font-semibold mb-2 text-white">{event.title}</h3>
                <p className="text-gray-300 mb-2">{event.description}</p>
                <div className="text-sm text-gray-400 mb-2">
                  <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                  <p>📍 {event.location}</p>
                  <div className="flex items-center justify-between mt-2 p-2 bg-black/50 rounded border border-yellow-500/30">
                    <div>
                      <p className="text-xs text-gray-400">Guest Access Code:</p>
                      <p className="text-yellow-500 font-mono font-bold text-lg">{event.accessCode}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(event.accessCode);
                        toast.success('Access code copied!');
                      }}
                      className="text-yellow-500 hover:text-yellow-400 p-1 hover-lift transition-all duration-300"
                      title="Copy access code"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    event.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {event.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span>{new Date(event._creationTime).toLocaleDateString()}</span>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/event/${event._id}`}
                    className="flex-1 btn-primary-gold text-center py-2 rounded-md hover-lift"
                  >
                    View Messages
                  </Link>
                  <button 
                    onClick={() => shareEvent(event)}
                    className="btn-secondary-gold px-4 py-2 rounded-md hover-lift"
                  >
                    Share
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;