const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { clerkMiddleware, requireAuth } = require('@clerk/express');
const { query } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend API is working!' });
});

// Clerk middleware
app.use(clerkMiddleware());

// Protected route example
app.get('/api/protected', requireAuth(), (req, res) => {
  res.json({ message: 'This is a protected route', userId: req.auth.userId });
});

const ensureUserExists = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { email, given_name, family_name } = req.auth.sessionClaims || {};

    await query(
      `INSERT INTO users (clerk_id, email, first_name, last_name) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (clerk_id) DO NOTHING`,
      [userId, email || '', given_name || '', family_name || '']
    );

    const userResult = await query('SELECT id FROM users WHERE clerk_id = $1', [userId]);
    if (userResult.rows.length === 0) {
      // This case should ideally not happen if the INSERT worked
      return res.status(404).json({ error: 'User not found after upsert' });
    }
    
    req.userDbId = userResult.rows[0].id;
    next();
  } catch (error) {
    console.error('Error in ensureUserExists middleware:', error);
    res.status(500).json({ error: 'Failed to verify user existence' });
  }
};

// Events routes
app.get('/api/events', requireAuth(), ensureUserExists, async (req, res) => {
  try {
    const result = await query(
      `SELECT e.*, 
              COALESCE(submission_counts.count, 0) as submission_count
       FROM events e
       LEFT JOIN (
         SELECT event_id, COUNT(*) as count 
         FROM media_submissions 
         GROUP BY event_id
       ) submission_counts ON e.id = submission_counts.event_id
       WHERE e.user_id = $1
       ORDER BY e.created_at DESC`,
      [req.userDbId]
    );
    
    res.json({ events: result.rows });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/events', requireAuth(), ensureUserExists, async (req, res) => {
  try {
    const { title, description } = req.body;
    const userDbId = req.userDbId;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    // Generate a unique slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    
    // Create the event
    const eventResult = await query(
      `INSERT INTO events (user_id, title, description, slug) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [userDbId, title, description, slug]
    );
    
    const newEvent = eventResult.rows[0];
    
    res.status(201).json({ 
      message: 'Event created successfully',
      event: {
        ...newEvent,
        submission_count: 0
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Individual event route
app.get('/api/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const result = await query(
      'SELECT * FROM events WHERE id = $1',
      [eventId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ event: result.rows[0] });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Event lookup by code/slug (for guest access)
app.get('/api/events/by-code/:eventCode', async (req, res) => {
  try {
    const { eventCode } = req.params;
    
    const result = await query(
      'SELECT * FROM events WHERE slug = $1',
      [eventCode.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ event: result.rows[0] });
  } catch (error) {
    console.error('Error fetching event by code:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Media submissions routes
app.get('/api/events/:eventId/submissions', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const result = await query(
      'SELECT * FROM media_submissions WHERE event_id = $1 ORDER BY created_at DESC',
      [eventId]
    );
    
    res.json({ submissions: result.rows, eventId });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

app.post('/api/events/:eventId/submissions', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { guestName, guestEmail, message, mediaType, fileUrl, fileName, fileSize, duration } = req.body;
    
    if (!guestName || !mediaType || !fileUrl || !fileName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await query(
      `INSERT INTO media_submissions (event_id, guest_name, guest_email, message, media_type, file_url, file_name, file_size, duration, ip_address) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [eventId, guestName, guestEmail, message, mediaType, fileUrl, fileName, fileSize, duration, req.ip]
    );
    
    res.status(201).json({ 
      message: 'Submission created successfully',
      submission: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔐 Clerk configured: ${process.env.CLERK_SECRET_KEY ? 'Yes' : 'No'}`);
});

module.exports = app;