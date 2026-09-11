-- Add profile_image column to community table to separate profile avatar/icon from cover banner
ALTER TABLE community ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255);
