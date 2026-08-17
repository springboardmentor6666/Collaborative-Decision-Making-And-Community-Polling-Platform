-- V5: Enhance Decision Discussion & Comment Support
-- Compatible with MySQL 8.0 / PostgreSQL
-- Adds updated_at timestamp tracking and optimizes discussion query indexes

-- --------------------------------------------------------
-- 1. ADD updated_at COLUMN TO comments TABLE
-- --------------------------------------------------------
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'comments'
      AND COLUMN_NAME = 'updated_at'
);

SET @sql = IF(
    @col_exists = 0,
    'ALTER TABLE comments ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'SELECT ''Column updated_at already exists in comments, skipping.'''
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- --------------------------------------------------------
-- 2. INDEXES FOR FAST DISCUSSION & THREAD RETRIEVAL
-- --------------------------------------------------------
-- Index on decision_id for fetching decision comments
SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'comments' AND INDEX_NAME = 'idx_comments_decision'
);
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_comments_decision ON comments(decision_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Index on parent_id for fetching threaded replies
SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'comments' AND INDEX_NAME = 'idx_comments_parent'
);
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_comments_parent ON comments(parent_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Index on author_id for user discussion history
SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'comments' AND INDEX_NAME = 'idx_comments_author'
);
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_comments_author ON comments(author_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Index on created_at for chronological discussion ordering
SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'comments' AND INDEX_NAME = 'idx_comments_created_at'
);
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_comments_created_at ON comments(created_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
