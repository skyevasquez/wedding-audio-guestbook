-- Audio Guestbook Platform Database Schema
-- PostgreSQL initialization script

-- Connect to the database
\c audio_guestbook;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (hosts)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE,
    location VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    qr_code_url TEXT,
    is_active BOOLEAN DEFAULT true,
    max_submissions INTEGER DEFAULT 1000,
    allow_audio BOOLEAN DEFAULT true,
    allow_video BOOLEAN DEFAULT true,
    allow_photos BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Media submissions table
CREATE TABLE IF NOT EXISTS media_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    message TEXT,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('audio', 'video', 'photo')),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    duration INTEGER, -- for audio/video in seconds
    uploadthing_key VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event analytics table
CREATE TABLE IF NOT EXISTS event_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    total_submissions INTEGER DEFAULT 0,
    audio_submissions INTEGER DEFAULT 0,
    video_submissions INTEGER DEFAULT 0,
    photo_submissions INTEGER DEFAULT 0,
    unique_guests INTEGER DEFAULT 0,
    last_submission_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_media_submissions_event_id ON media_submissions(event_id);
CREATE INDEX IF NOT EXISTS idx_media_submissions_type ON media_submissions(media_type);
CREATE INDEX IF NOT EXISTS idx_media_submissions_created_at ON media_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_event_analytics_event_id ON event_analytics(event_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_analytics_updated_at BEFORE UPDATE ON event_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update event analytics
CREATE OR REPLACE FUNCTION update_event_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update analytics when a new submission is added
    IF TG_OP = 'INSERT' THEN
        INSERT INTO event_analytics (event_id, total_submissions, audio_submissions, video_submissions, photo_submissions, unique_guests, last_submission_at)
        VALUES (NEW.event_id, 1, 
                CASE WHEN NEW.media_type = 'audio' THEN 1 ELSE 0 END,
                CASE WHEN NEW.media_type = 'video' THEN 1 ELSE 0 END,
                CASE WHEN NEW.media_type = 'photo' THEN 1 ELSE 0 END,
                1, NEW.created_at)
        ON CONFLICT (event_id) DO UPDATE SET
            total_submissions = event_analytics.total_submissions + 1,
            audio_submissions = event_analytics.audio_submissions + CASE WHEN NEW.media_type = 'audio' THEN 1 ELSE 0 END,
            video_submissions = event_analytics.video_submissions + CASE WHEN NEW.media_type = 'video' THEN 1 ELSE 0 END,
            photo_submissions = event_analytics.photo_submissions + CASE WHEN NEW.media_type = 'photo' THEN 1 ELSE 0 END,
            unique_guests = (
                SELECT COUNT(DISTINCT COALESCE(guest_email, guest_name, ip_address::text))
                FROM media_submissions 
                WHERE event_id = NEW.event_id
            ),
            last_submission_at = NEW.created_at,
            updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END IF;
    
    -- Update analytics when a submission is deleted
    IF TG_OP = 'DELETE' THEN
        UPDATE event_analytics SET
            total_submissions = GREATEST(0, total_submissions - 1),
            audio_submissions = GREATEST(0, audio_submissions - CASE WHEN OLD.media_type = 'audio' THEN 1 ELSE 0 END),
            video_submissions = GREATEST(0, video_submissions - CASE WHEN OLD.media_type = 'video' THEN 1 ELSE 0 END),
            photo_submissions = GREATEST(0, photo_submissions - CASE WHEN OLD.media_type = 'photo' THEN 1 ELSE 0 END),
            unique_guests = (
                SELECT COUNT(DISTINCT COALESCE(guest_email, guest_name, ip_address::text))
                FROM media_submissions 
                WHERE event_id = OLD.event_id
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE event_id = OLD.event_id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for analytics updates
CREATE TRIGGER update_analytics_on_submission
    AFTER INSERT OR DELETE ON media_submissions
    FOR EACH ROW EXECUTE FUNCTION update_event_analytics();

-- Add unique constraint for event analytics
ALTER TABLE event_analytics ADD CONSTRAINT unique_event_analytics UNIQUE (event_id);