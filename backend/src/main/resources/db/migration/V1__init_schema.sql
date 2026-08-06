-- ============================================================
-- DECISIONHUB FLYWAY INITIAL DATABASE MIGRATION (V1__init_schema.sql)
-- Target Database: PostgreSQL 14+
-- ============================================================

-- 1. Create Timestamp Update Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. ROLE Table
CREATE TABLE role (
    role_id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- 3. APP_USER Table
CREATE TABLE app_user (
    user_id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES role(role_id) ON DELETE RESTRICT,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    profile_image VARCHAR(255),
    bio TEXT,
    provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_user_username ON app_user(username);
CREATE INDEX idx_user_email ON app_user(email);


-- 5. COMMUNITY Table
CREATE TABLE community (
    community_id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    image VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_community_owner ON community(owner_id);

-- 6. COMMUNITY_MEMBER Table
CREATE TABLE community_member (
    member_id BIGSERIAL PRIMARY KEY,
    community_id BIGINT NOT NULL REFERENCES community(community_id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    member_role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uk_community_member UNIQUE (community_id, user_id)
);

CREATE INDEX idx_community_member_community ON community_member(community_id);
CREATE INDEX idx_community_member_user ON community_member(user_id);

-- 7. DECISION Table
CREATE TABLE decision (
    decision_id BIGSERIAL PRIMARY KEY,
    created_by BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    community_id BIGINT REFERENCES community(community_id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    vote_type VARCHAR(20) NOT NULL DEFAULT 'SINGLE',
    visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    deadline TIMESTAMP WITHOUT TIME ZONE,
    allow_anonymous_vote BOOLEAN NOT NULL DEFAULT FALSE,
    view_count INT NOT NULL DEFAULT 0,
    like_count INT NOT NULL DEFAULT 0,
    share_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_decision_created_by ON decision(created_by);
CREATE INDEX idx_decision_community ON decision(community_id);
CREATE INDEX idx_decision_status ON decision(status);

-- 8. OPTION Table
CREATE TABLE option (
    option_id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL REFERENCES decision(decision_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    total_score NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_option_decision ON option(decision_id);



-- 10. VOTE Table
CREATE TABLE vote (
    vote_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES app_user(user_id) ON DELETE SET NULL,
    decision_id BIGINT NOT NULL REFERENCES decision(decision_id) ON DELETE CASCADE,
    option_id BIGINT NOT NULL REFERENCES option(option_id) ON DELETE CASCADE,
    rating INT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_vote_decision ON vote(decision_id);
CREATE INDEX idx_vote_option ON vote(option_id);
CREATE INDEX idx_vote_user ON vote(user_id);

-- 11. COMMENT Table
CREATE TABLE comment (
    comment_id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL REFERENCES decision(decision_id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES app_user(user_id) ON DELETE SET NULL,
    parent_comment_id BIGINT REFERENCES comment(comment_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    edited BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_comment_decision ON comment(decision_id);
CREATE INDEX idx_comment_user ON comment(user_id);
CREATE INDEX idx_comment_parent ON comment(parent_comment_id);

-- 12. NOTIFICATION Table
CREATE TABLE notification (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_notification_user ON notification(user_id);
CREATE INDEX idx_notification_read ON notification(is_read);


-- 14. SAVED_DECISION Table
CREATE TABLE saved_decision (
    saved_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    decision_id BIGINT NOT NULL REFERENCES decision(decision_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uk_saved_decision UNIQUE (user_id, decision_id)
);

CREATE INDEX idx_saved_decision_user ON saved_decision(user_id);
CREATE INDEX idx_saved_decision_decision ON saved_decision(decision_id);

-- 15. ATTACHMENT Table
CREATE TABLE attachment (
    attachment_id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT REFERENCES decision(decision_id) ON DELETE CASCADE,
    comment_id BIGINT REFERENCES comment(comment_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    uploaded_by BIGINT REFERENCES app_user(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_attachment_decision ON attachment(decision_id);
CREATE INDEX idx_attachment_comment ON attachment(comment_id);
CREATE INDEX idx_attachment_uploader ON attachment(uploaded_by);

-- 16. REPORT Table
CREATE TABLE report (
    report_id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL REFERENCES decision(decision_id) ON DELETE CASCADE,
    generated_by BIGINT REFERENCES app_user(user_id) ON DELETE SET NULL,
    report_type VARCHAR(20) NOT NULL,
    report_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_report_decision ON report(decision_id);
CREATE INDEX idx_report_generator ON report(generated_by);

-- 17. AUDIT_LOG Table
CREATE TABLE audit_log (
    log_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES app_user(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);

-- 18. BLACKLISTED_TOKEN Table
CREATE TABLE blacklisted_token (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(1000) NOT NULL UNIQUE,
    expiry_date TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- Insert Default System Roles
INSERT INTO role (role_name, description) VALUES 
('ROLE_USER', 'Standard User Access Role'),
('ROLE_MODERATOR', 'Community & Discussion Moderator Access Role'),
('ROLE_ADMIN', 'Super Administrator Access Role');
