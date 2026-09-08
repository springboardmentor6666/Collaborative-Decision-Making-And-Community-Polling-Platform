-- ============================================================
-- DECISIONHUB FLYWAY MIGRATION: V8__create_user_preference_table.sql
-- Description: Create user_preference table for notification, privacy, and theme settings
-- ============================================================

CREATE TABLE IF NOT EXISTS user_preference (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES app_user(user_id) ON DELETE CASCADE,
    email_digest VARCHAR(20) NOT NULL DEFAULT 'DAILY',
    notify_new_decisions BOOLEAN NOT NULL DEFAULT TRUE,
    notify_vote_deadlines BOOLEAN NOT NULL DEFAULT TRUE,
    notify_decision_results BOOLEAN NOT NULL DEFAULT TRUE,
    notify_comments_and_mentions BOOLEAN NOT NULL DEFAULT TRUE,
    notify_elections BOOLEAN NOT NULL DEFAULT TRUE,
    in_app_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    default_voting_mode VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    activity_visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    show_badges BOOLEAN NOT NULL DEFAULT TRUE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    theme VARCHAR(20) DEFAULT 'system',
    feed_density VARCHAR(20) DEFAULT 'comfortable',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_user_pref_user_id ON user_preference(user_id);
