-- V11: Enhance Existing Features (Polling Enhancements, Lifecycle Expiration, Comment Reputation, Full-Text & Query Tuning) (PostgreSQL 15+)

-- 1. Polling & Voting Enhancements
ALTER TABLE polls ADD COLUMN IF NOT EXISTS voting_method VARCHAR(25) DEFAULT 'SINGLE_CHOICE';
ALTER TABLE polls ADD COLUMN IF NOT EXISTS max_choices INT DEFAULT 1;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS allow_revoting BOOLEAN DEFAULT FALSE;

ALTER TABLE votes ADD COLUMN IF NOT EXISTS rank_position INT NULL;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2) DEFAULT 1.00;

ALTER TABLE votes DROP CONSTRAINT IF EXISTS uk_poll_voter;
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_poll_id_voter_id_key;
ALTER TABLE votes ADD CONSTRAINT uk_poll_option_voter UNIQUE (poll_id, poll_option_id, voter_id);

-- 2. Decision Lifecycle & Expiration
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS ends_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS auto_close BOOLEAN DEFAULT FALSE;
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS winning_option_id BIGINT NULL;
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS view_count BIGINT DEFAULT 0;
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS vote_count BIGINT DEFAULT 0;
ALTER TABLE decisions ADD CONSTRAINT fk_decision_winning_option FOREIGN KEY (winning_option_id) REFERENCES decision_options(id) ON DELETE SET NULL;

-- 3. Comment Reputation & Upvotes
ALTER TABLE comments ADD COLUMN IF NOT EXISTS upvotes_count INT DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS downvotes_count INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS comment_reactions (
    id BIGSERIAL PRIMARY KEY,
    comment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reaction_type VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_comment_reaction_type CHECK (reaction_type IN ('UPVOTE', 'DOWNVOTE', 'HEART')),
    CONSTRAINT fk_comment_reactions_comment FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_reactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_comment_user_reaction UNIQUE (comment_id, user_id)
);

-- 4. Full-Text Search Indexes (PostgreSQL GIN)
CREATE INDEX IF NOT EXISTS idx_decisions_fts ON decisions USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_communities_fts ON communities USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_comments_fts ON comments USING gin(to_tsvector('english', content));

-- 5. Foreign Key & Performance Indexing Overhaul
CREATE INDEX IF NOT EXISTS idx_decisions_category_status ON decisions (category_id, status, is_deleted);
CREATE INDEX IF NOT EXISTS idx_decisions_created_status ON decisions (created_at DESC, status);
CREATE INDEX IF NOT EXISTS idx_decisions_auto_close ON decisions (status, auto_close, ends_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent_created ON comments (parent_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_votes_poll_option ON votes (poll_id, poll_option_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions (comment_id);
