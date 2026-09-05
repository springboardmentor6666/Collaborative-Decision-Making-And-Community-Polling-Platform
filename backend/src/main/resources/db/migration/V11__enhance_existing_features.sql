-- V11: Enhance Existing Features (Ranked-Choice, Auto-Close, Comment Upvotes, Full-Text)
-- Compatible with MySQL 8.0, PostgreSQL, and H2

-- 1. Extend polls table
ALTER TABLE polls ADD COLUMN IF NOT EXISTS voting_method VARCHAR(20) DEFAULT 'SINGLE_CHOICE';
ALTER TABLE polls ADD COLUMN IF NOT EXISTS max_choices INT DEFAULT 1;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS allow_revoting BOOLEAN DEFAULT FALSE;

-- 2. Extend votes table
ALTER TABLE votes ADD COLUMN IF NOT EXISTS rank_position INT NULL;

-- 3. Extend decisions table
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS auto_close BOOLEAN DEFAULT FALSE;
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS ends_at TIMESTAMP NULL;
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS winning_option_id BIGINT NULL;

-- 4. Extend comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS upvotes_count INT DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS downvotes_count INT DEFAULT 0;

-- 5. Create comment_reactions table
CREATE TABLE IF NOT EXISTS comment_reactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    comment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reaction_type VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_reactions_comment FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_reactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_comment_user_reaction UNIQUE (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_decisions_auto_close ON decisions(status, auto_close, ends_at);
