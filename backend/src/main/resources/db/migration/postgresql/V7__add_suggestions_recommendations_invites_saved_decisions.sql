-- V7: Add Suggestions, Recommendations, Community Invites, Saved Decisions, and User Visibility
-- Compatible with PostgreSQL

-- 1. Add is_public column to users table
ALTER TABLE users ADD COLUMN is_public BOOLEAN DEFAULT TRUE;

-- 2. suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
    id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
    id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL,
    option_id BIGINT NOT NULL,
    expert_id BIGINT NOT NULL,
    justification VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES decision_options(id) ON DELETE CASCADE,
    FOREIGN KEY (expert_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. community_invites table
CREATE TABLE IF NOT EXISTS community_invites (
    id BIGSERIAL PRIMARY KEY,
    community_id BIGINT NOT NULL,
    invitee_id BIGINT NOT NULL,
    inviter_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (community_id, invitee_id),
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (invitee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. saved_decisions table (with saved_at tracking)
CREATE TABLE IF NOT EXISTS saved_decisions (
    user_id BIGINT NOT NULL,
    decision_id BIGINT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, decision_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_suggestions_decision ON suggestions(decision_id);
CREATE INDEX idx_suggestions_user ON suggestions(user_id);
CREATE INDEX idx_recommendations_decision ON recommendations(decision_id);
CREATE INDEX idx_recommendations_expert ON recommendations(expert_id);
CREATE INDEX idx_community_invites_invitee ON community_invites(invitee_id);
CREATE INDEX idx_saved_decisions_user ON saved_decisions(user_id);
