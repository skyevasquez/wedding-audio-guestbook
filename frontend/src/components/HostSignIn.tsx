import React from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { Crown, Settings } from 'lucide-react';

interface HostSignInProps {
  onClose: () => void;
}

const HostSignIn: React.FC<HostSignInProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-yellow-500/30 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Host Access</h2>
          <p className="text-gray-300">
            Sign in to access your wedding dashboard, create events, and manage guest messages.
          </p>
        </div>

        <div className="space-y-4">
          <SignInButton 
            mode="modal" 
            redirectUrl="/dashboard"
            afterSignInUrl="/dashboard"
          >
            <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105">
              <Settings className="inline-block w-5 h-5 mr-2" />
              Sign In as Host
            </button>
          </SignInButton>

          <SignUpButton 
            mode="modal" 
            redirectUrl="/dashboard"
            afterSignUpUrl="/dashboard"
          >
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105">
              Create Host Account
            </button>
          </SignUpButton>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 text-center">
            Host accounts have access to:
          </p>
          <ul className="text-sm text-gray-300 mt-2 space-y-1">
            <li>• Create and manage wedding events</li>
            <li>• View all guest messages</li>
            <li>• Generate QR codes for guests</li>
            <li>• Download message collections</li>
          </ul>
        </div>

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

export default HostSignIn;