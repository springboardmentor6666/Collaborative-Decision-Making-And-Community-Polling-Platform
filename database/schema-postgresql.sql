-- 06. Database Design — DecisionHub
-- Exact Official Specification Schema (Normalized to 3NF)
-- Primary schema compatible with PostgreSQL

-- 1. categories
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. users
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'USER',           -- USER / MODERATOR / ADMIN
    provider VARCHAR(20) DEFAULT 'LOCAL',       -- LOCAL / GOOGLE
    provider_id VARCHAR(100),                   -- OAuth provider user ID
    profile_image VARCHAR(500),                 -- Avatar / profile picture URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE
);

-- 3. user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    bio TEXT,
    avatar_url VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. user_interests
CREATE TABLE IF NOT EXISTS user_interests (
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, category_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 5. communities
CREATE TABLE IF NOT EXISTS communities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category_id BIGINT,
    description TEXT,
    created_by BIGINT,
    visibility VARCHAR(10) DEFAULT 'PUBLIC',    -- PUBLIC / PRIVATE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 6. community_members
CREATE TABLE IF NOT EXISTS community_members (
    id BIGSERIAL PRIMARY KEY,
    community_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) DEFAULT 'MEMBER',          -- OWNER / ADMIN / MEMBER / MODERATOR
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (community_id, user_id),
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. decisions
CREATE TABLE IF NOT EXISTS decisions (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    visibility VARCHAR(10) DEFAULT 'PUBLIC',    -- PUBLIC / PRIVATE
    category_id BIGINT,
    community_id BIGINT NULL,                   -- NULL for general decisions, FK to communities for group decisions
    status VARCHAR(20) DEFAULT 'OPEN',          -- OPEN / CLOSED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE SET NULL
);

-- 8. decision_options
CREATE TABLE IF NOT EXISTS decision_options (
    id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL,
    label VARCHAR(150) NOT NULL,
    description TEXT,
    FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE
);

-- 9. comparison_factors
CREATE TABLE IF NOT EXISTS comparison_factors (
    id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,                  -- Cost, Risk, Time, etc.
    FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE
);

-- 10. option_scores
CREATE TABLE IF NOT EXISTS option_scores (
    id BIGSERIAL PRIMARY KEY,
    option_id BIGINT NOT NULL,
    factor_id BIGINT NOT NULL,
    score INT CHECK (score BETWEEN 1 AND 10),
    FOREIGN KEY (option_id) REFERENCES decision_options(id) ON DELETE CASCADE,
    FOREIGN KEY (factor_id) REFERENCES comparison_factors(id) ON DELETE CASCADE
);

-- 11. polls
CREATE TABLE IF NOT EXISTS polls (
    id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL,
    poll_type VARCHAR(20) DEFAULT 'SINGLE',     -- SINGLE / MULTI / RATING
    question VARCHAR(255),                      -- Optional poll question text
    is_anonymous BOOLEAN DEFAULT FALSE,
    ends_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE
);

-- 12. poll_options
CREATE TABLE IF NOT EXISTS poll_options (
    id BIGSERIAL PRIMARY KEY,
    poll_id BIGINT NOT NULL,
    option_id BIGINT NOT NULL,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES decision_options(id) ON DELETE CASCADE
);

-- 13. votes
CREATE TABLE IF NOT EXISTS votes (
    id BIGSERIAL PRIMARY KEY,
    poll_id BIGINT NOT NULL,
    poll_option_id BIGINT NOT NULL,
    voter_id BIGINT NULL,                       -- nullable if anonymous
    rating INT DEFAULT NULL CHECK (rating >= 1 AND rating <= 5), -- bounded to 1-5
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (poll_option_id, voter_id),          -- prevents duplicate votes
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (poll_option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
    FOREIGN KEY (voter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 14. comments
CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    parent_id BIGINT NULL,                      -- nullable, self-referencing
    content VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_flagged BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- 15. notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(30) NOT NULL,                  -- NEW_COMMENT / NEW_VOTE / etc.
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 16. moderation_flags
CREATE TABLE IF NOT EXISTS moderation_flags (
    id BIGSERIAL PRIMARY KEY,
    target_type VARCHAR(20) NOT NULL,           -- COMMENT / DECISION
    target_id BIGINT NOT NULL,
    reported_by BIGINT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',       -- PENDING / RESOLVED
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 17. decision_impressions (Analytics: View & Reach Tracking)
CREATE TABLE IF NOT EXISTS decision_impressions (
    id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL,
    user_id BIGINT NULL,                            -- NULL for anonymous visitors
    user_email VARCHAR(255) NULL,                   -- Email of logged-in user (denormalized)
    client_ip VARCHAR(64) NULL,                     -- Client IP for anonymous tracking
    ip_hash VARCHAR(64) NULL,                       -- Hashed IP for anonymous reach tracking
    type VARCHAR(20) NOT NULL DEFAULT 'VIEW',      -- 'VIEW' or 'REACH'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_impression_type CHECK (type IN ('VIEW', 'REACH')),
    FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 18. suggestions
CREATE TABLE IF NOT EXISTS suggestions (
    id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 19. recommendations
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

-- 20. community_invites
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

-- 21. saved_decisions (Bookmarks)
CREATE TABLE IF NOT EXISTS saved_decisions (
    user_id BIGINT NOT NULL,
    decision_id BIGINT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, decision_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE
);

-- 22. attachments (Files & Media)
CREATE TABLE IF NOT EXISTS attachments (
    id BIGSERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    decision_id BIGINT NULL,
    comment_id BIGINT NULL,
    owner_type VARCHAR(50) NULL,
    owner_id BIGINT NULL,
    uploaded_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE SET NULL,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 23. audit_logs (Admin Activity Logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_id BIGINT NULL,
    admin_email VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id BIGINT,
    details VARCHAR(1000),
    metadata TEXT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 24. reports (Moderation Reports)
CREATE TABLE IF NOT EXISTS reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    reported_user_id BIGINT NULL,
    content_id BIGINT NULL,
    content_type VARCHAR(50),
    reason VARCHAR(1000) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 25. admin_settings
CREATE TABLE IF NOT EXISTS admin_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(1000),
    description VARCHAR(500),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 26. generated_reports (Export Jobs)
CREATE TABLE IF NOT EXISTS generated_reports (
    id BIGSERIAL PRIMARY KEY,
    report_name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NULL,
    format VARCHAR(20) NOT NULL,
    file_url VARCHAR(500),
    generated_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 27. decision_history (Changelog)
CREATE TABLE IF NOT EXISTS decision_history (
    id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL,
    changed_field VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by BIGINT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_decisions_owner ON decisions(owner_id);
CREATE INDEX idx_decisions_category ON decisions(category_id);
CREATE INDEX idx_decisions_community ON decisions(community_id);
CREATE INDEX idx_votes_poll ON votes(poll_id);
CREATE INDEX idx_votes_voter ON votes(voter_id);
CREATE INDEX idx_comments_decision ON comments(decision_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_communities_created_by ON communities(created_by);
CREATE INDEX idx_communities_visibility ON communities(visibility);
CREATE INDEX idx_community_members ON community_members(community_id, user_id);
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_impressions_decision ON decision_impressions(decision_id);
CREATE INDEX idx_impressions_type ON decision_impressions(decision_id, type);
CREATE INDEX idx_suggestions_decision ON suggestions(decision_id);
CREATE INDEX idx_suggestions_user ON suggestions(user_id);
CREATE INDEX idx_recommendations_decision ON recommendations(decision_id);
CREATE INDEX idx_recommendations_expert ON recommendations(expert_id);
CREATE INDEX idx_community_invites_invitee ON community_invites(invitee_id);
CREATE INDEX idx_saved_decisions_user ON saved_decisions(user_id);
CREATE INDEX idx_saved_decisions_decision ON saved_decisions(decision_id);
CREATE INDEX idx_attachments_decision ON attachments(decision_id);
CREATE INDEX idx_attachments_comment ON attachments(comment_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX idx_attachments_owner ON attachments(owner_type, owner_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_admin ON audit_logs(admin_email);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_decision_history_decision ON decision_history(decision_id);
CREATE INDEX idx_decision_history_changed_by ON decision_history(changed_by);
CREATE INDEX idx_decision_history_changed_at ON decision_history(changed_at);
CREATE INDEX idx_generated_reports_generated_by ON generated_reports(generated_by);
CREATE INDEX idx_generated_reports_created_at ON generated_reports(created_at);

