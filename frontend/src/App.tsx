import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'
import HomePage from './pages/HomePage'
import HostDashboard from './pages/HostDashboard'
import GuestSubmission from './pages/GuestSubmission'
import EventView from './pages/EventView'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/event/:eventId" element={<EventView />} />
          <Route path="/submit/:eventId" element={<GuestSubmission />} />
          
          {/* Protected routes for hosts */}
          <Route 
            path="/dashboard" 
            element={
              <>
                <SignedIn>
                  <HostDashboard />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App