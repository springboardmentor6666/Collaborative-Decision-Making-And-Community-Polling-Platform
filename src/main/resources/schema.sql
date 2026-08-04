-- DecisionHub Database Schema
-- PostgreSQL
-- Order is important because of foreign keys

CREATE TABLE IF NOT EXISTS users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    profile_picture VARCHAR(255),
    role VARCHAR(30) DEFAULT 'USER',
    interests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decisions (
    decision_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    status VARCHAR(30) DEFAULT 'ACTIVE',
    visibility VARCHAR(30) DEFAULT 'PUBLIC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_decisions_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS options (
    option_id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL,
    option_title VARCHAR(200) NOT NULL,
    description TEXT,
    pros TEXT,
    cons TEXT,
    score INT DEFAULT 0,
    ranking INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_options_decision
        FOREIGN KEY (decision_id) REFERENCES decisions(decision_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS votes (
    vote_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    decision_id BIGINT NOT NULL,
    option_id BIGINT NOT NULL,
    vote_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_votes_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_votes_decision
        FOREIGN KEY (decision_id) REFERENCES decisions(decision_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_votes_option
        FOREIGN KEY (option_id) REFERENCES options(option_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS communities (
    community_id BIGSERIAL PRIMARY KEY,
    moderator_id BIGINT NOT NULL,
    community_name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    member_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_communities_moderator
        FOREIGN KEY (moderator_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS community_members (
    member_id BIGSERIAL PRIMARY KEY,
    community_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    member_role VARCHAR(50) DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_community_members_community
        FOREIGN KEY (community_id) REFERENCES communities(community_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_community_members_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT unique_community_user UNIQUE (community_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
    comment_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    decision_id BIGINT NOT NULL,
    parent_comment_id BIGINT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_comments_decision
        FOREIGN KEY (decision_id) REFERENCES decisions(decision_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_comments_parent
        FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    decision_id BIGINT NULL,
    community_id BIGINT NULL,
    notification_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_notifications_decision
        FOREIGN KEY (decision_id) REFERENCES decisions(decision_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_notifications_community
        FOREIGN KEY (community_id) REFERENCES communities(community_id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reports (
    report_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    decision_id BIGINT NULL,
    community_id BIGINT NULL,
    report_type VARCHAR(100) NOT NULL,
    file_format VARCHAR(20),
    file_path VARCHAR(255),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reports_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reports_decision
        FOREIGN KEY (decision_id) REFERENCES decisions(decision_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_reports_community
        FOREIGN KEY (community_id) REFERENCES communities(community_id)
        ON DELETE SET NULL
);
