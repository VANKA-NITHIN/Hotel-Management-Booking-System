-- LuxuryStay Hotel Management Platform - Migration 003
-- Add missing notification preference columns to users table
-- Make password nullable since Clerk handles authentication

-- Add notification preference columns
ALTER TABLE users ADD COLUMN email_bookings BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN email_promotions BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN push_bookings BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN push_promotions BOOLEAN NOT NULL DEFAULT TRUE;

-- Make password column nullable since Clerk handles authentication
ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;
