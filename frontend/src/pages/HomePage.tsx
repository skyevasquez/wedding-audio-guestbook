import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import { useUser, SignInButton, SignUpButton } from '@clerk/clerk-react'
import { Mic, Video, Camera, Heart, Users, Sparkles, Crown, MessageCircle } from 'lucide-react'
import HostSignIn from '../components/HostSignIn'
import GuestAccess from '../components/GuestAccess'

const HomePage: React.FC = () => {
  const { isSignedIn, user } = useUser()
  const [showHostSignIn, setShowHostSignIn] = useState(false)
  const [showGuestAccess, setShowGuestAccess] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-sm border-b border-yellow-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2 hover-lift">
              <span className="text-2xl hover-glow hover-rotate">🖤💛</span>
              <span className="text-2xl font-bold text-gradient-gold">Abbie & Skye's Wedding</span>
            </div>
            <nav className="flex items-center space-x-4">
              {isSignedIn ? (
                <Link
                  to="/dashboard"
                  className="btn-primary hover-lift"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex items-center space-x-3">
                  <SignInButton mode="modal">
                    <button className="btn-secondary-gold hover-lift">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="btn-primary-gold hover-lift">
                      Join Celebration
                    </button>
                  </SignUpButton>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Celebrate <span className="text-gradient-gold">Abbie & Skye's</span> Special Day
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join us in celebrating the love story of Abbie and Skye! Leave your heartfelt
            audio, video, and photo messages to create lasting memories of their wedding day.
          </p>

          {/* Authentication Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center mb-12 max-w-2xl mx-auto">
            {/* Host Sign In */}
            {!isSignedIn ? (
              <button 
                onClick={() => setShowHostSignIn(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-6 px-8 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center text-lg"
              >
                <Crown className="w-6 h-6 mr-3" />
                Host Sign In
              </button>
            ) : (
              <Link to="/dashboard">
                <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-6 px-8 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center w-full text-lg">
                  <Crown className="w-6 h-6 mr-3" />
                  Dashboard
                </button>
              </Link>
            )}
            
            {/* Join Celebration (Guest Access) */}
            <button 
              onClick={() => setShowGuestAccess(true)}
              className="bg-transparent border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-semibold py-6 px-8 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center text-lg"
            >
              <Users className="w-6 h-6 mr-3" />
              Leave a Message
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      {showHostSignIn && (
        <HostSignIn onClose={() => setShowHostSignIn(false)} />
      )}
      
      {showGuestAccess && (
        <GuestAccess onClose={() => setShowGuestAccess(false)} />
      )}

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Share Your Love & Best Wishes
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Help us create a beautiful collection of memories from Abbie and Skye's
              special day. Every message will be treasured forever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-gold text-center hover-lift">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 hover-glow">
                <Mic className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Voice Messages
              </h3>
              <p className="text-gray-300">
                Record heartfelt voice messages sharing your favorite memories and well wishes.
              </p>
            </div>

            <div className="card-gold text-center hover-lift">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 hover-glow">
                <Video className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Video Messages
              </h3>
              <p className="text-gray-300">
                Share your congratulations and love through beautiful video messages.
              </p>
            </div>

            <div className="card-gold text-center hover-lift">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 hover-glow">
                <Camera className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Photo Memories
              </h3>
              <p className="text-gray-300">
                Upload photos and share written messages to celebrate the happy couple.
              </p>
            </div>

            <div className="card-gold text-center hover-lift">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 hover-glow">
                <Users className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Easy Access
              </h3>
              <p className="text-gray-300">
                Simple QR code or link access. No app downloads needed to share your love.
              </p>
            </div>

            <div className="card-gold text-center hover-lift">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 hover-glow">
                <Heart className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Wedding Collection
              </h3>
              <p className="text-gray-300">
                All messages beautifully organized for Abbie and Skye to treasure forever.
              </p>
            </div>

            <div className="card-gold text-center hover-lift">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 hover-glow">
                <Sparkles className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Live Celebration
              </h3>
              <p className="text-gray-300">
                Watch as love and well wishes pour in throughout the wedding celebration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-600 to-yellow-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Be Part of Their Love Story
          </h2>
          <p className="text-xl text-black/80 mb-8">
            Share your heartfelt wishes and help create beautiful memories for Abbie and Skye.
          </p>
          {!isSignedIn && (
            <SignUpButton mode="modal">
              <button className="bg-black text-yellow-500 hover:bg-gray-900 font-semibold py-3 px-8 rounded-lg text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25">
                Leave Your Message
              </button>
            </SignUpButton>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t border-yellow-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4 hover-lift">
              <span className="text-xl hover-glow hover-rotate">🖤💛</span>
              <span className="text-xl font-bold text-gradient-gold">Abbie & Skye's Wedding</span>
            </div>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              A special digital guestbook created with love for Abbie and Skye's wedding day.
              Every message will be treasured as part of their beautiful love story.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>💕 With Love</span>
              <span>✨ Forever Memories</span>
              <span>🎉 Celebrating Love</span>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Created by <a href="https://applylogics.com" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200">ApplyLogics.com</a> for 💛 Abbie & Skye's special day 💛</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage