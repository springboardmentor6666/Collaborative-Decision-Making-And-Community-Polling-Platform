-- V11: Enhance Existing Features (Polling Enhancements, Lifecycle Expiration, Comment Reputation, Full-Text & Query Tuning) (MySQL 8.0)

-- 1. Polling & Voting Enhancements
ALTER TABLE polls ADD COLUMN voting_method VARCHAR(25) DEFAULT 'SINGLE_CHOICE';
ALTER TABLE polls ADD COLUMN max_choices INT DEFAULT 1;
ALTER TABLE polls ADD COLUMN allow_revoting BOOLEAN DEFAULT FALSE;

ALTER TABLE votes ADD COLUMN rank_position INT NULL;
ALTER TABLE votes ADD COLUMN weight DECIMAL(5,2) DEFAULT 1.00;

-- Update unique constraint on votes: replace old single-vote unique key with multi-choice unique key
-- (Safe conditional drop if existing key exists)
SET @drop_vote_uk = (
    SELECT CONCAT('ALTER TABLE votes DROP INDEX ', CONSTRAINT_NAME)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'votes'
      AND CONSTRAINT_NAME IN ('uk_poll_voter', 'poll_id', 'UKitt3qji59rwq8n7it8rkgtbne')
      AND CONSTRAINT_TYPE = 'UNIQUE'
    LIMIT 1
);
SET @drop_vote_uk = IFNULL(@drop_vote_uk, 'SELECT 1');
PREPARE stmt_vote FROM @drop_vote_uk;
EXECUTE stmt_vote;
DEALLOCATE PREPARE stmt_vote;

ALTER TABLE votes ADD CONSTRAINT uk_poll_option_voter UNIQUE (poll_id, poll_option_id, voter_id);

-- 2. Decision Lifecycle & Expiration
ALTER TABLE decisions ADD COLUMN ends_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE decisions ADD COLUMN auto_close BOOLEAN DEFAULT FALSE;
ALTER TABLE decisions ADD COLUMN winning_option_id BIGINT NULL;
ALTER TABLE decisions ADD COLUMN view_count BIGINT DEFAULT 0;
ALTER TABLE decisions ADD COLUMN vote_count BIGINT DEFAULT 0;
ALTER TABLE decisions ADD CONSTRAINT fk_decision_winning_option FOREIGN KEY (winning_option_id) REFERENCES decision_options(id) ON DELETE SET NULL;

-- 3. Comment Reputation & Upvotes
ALTER TABLE comments ADD COLUMN upvotes_count INT DEFAULT 0;
ALTER TABLE comments ADD COLUMN downvotes_count INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS comment_reactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    comment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reaction_type VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_comment_reaction_type CHECK (reaction_type IN ('UPVOTE', 'DOWNVOTE', 'HEART')),
    CONSTRAINT fk_comment_reactions_comment FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_reactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_comment_user_reaction UNIQUE (comment_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Full-Text Search Indexes (MySQL)
ALTER TABLE decisions ADD FULLTEXT INDEX ft_decisions_title_desc (title, description);
ALTER TABLE communities ADD FULLTEXT INDEX ft_communities_name_desc (name, description);
ALTER TABLE comments ADD FULLTEXT INDEX ft_comments_content (content);

-- 5. Foreign Key & Performance Indexing Overhaul
CREATE INDEX idx_decisions_category_status ON decisions (category_id, status, is_deleted);
CREATE INDEX idx_decisions_created_status ON decisions (created_at DESC, status);
CREATE INDEX idx_decisions_auto_close ON decisions (status, auto_close, ends_at);
CREATE INDEX idx_comments_parent_created ON comments (parent_id, created_at ASC);
CREATE INDEX idx_votes_poll_option ON votes (poll_id, poll_option_id);
CREATE INDEX idx_comment_reactions_comment ON comment_reactions (comment_id);
