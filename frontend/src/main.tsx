import React from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import './index.css'

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL

// Only throw errors in development or when not building
if (!PUBLISHABLE_KEY && import.meta.env.DEV) {
  console.warn("Missing Publishable Key - using placeholder for build")
}

if (!CONVEX_URL && import.meta.env.DEV) {
  console.warn("Missing Convex URL - using placeholder for build")
}

// Use fallback values for build time
const publishableKey = PUBLISHABLE_KEY || 'pk_test_placeholder'
const convexUrl = CONVEX_URL || 'https://placeholder.convex.cloud'

const convex = new ConvexReactClient(convexUrl)

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ClerkProvider publishableKey={publishableKey}>
        <ConvexProvider client={convex}>
          <App />
        </ConvexProvider>
      </ClerkProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)