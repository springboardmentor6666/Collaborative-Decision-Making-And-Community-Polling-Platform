-- V5: Enhance Decision Discussion & Comment Support
-- Compatible with MySQL 8.0 & PostgreSQL

-- 1. Add updated_at column to comments table
ALTER TABLE comments ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Performance indexes for discussion retrieval
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
