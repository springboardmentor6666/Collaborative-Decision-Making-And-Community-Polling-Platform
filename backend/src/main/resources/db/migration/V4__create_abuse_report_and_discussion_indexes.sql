-- ============================================================
-- DECISIONHUB FLYWAY MIGRATION (V4__create_abuse_report_and_discussion_indexes.sql)
-- Target Database: PostgreSQL 14+
-- Abuse Reporting, Discussion & Notification Optimization
-- ============================================================

-- 1. Create ABUSE_REPORT Table for Moderation & Reporting Workflows
CREATE TABLE IF NOT EXISTS abuse_report (
    report_id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL REFERENCES decision(decision_id) ON DELETE CASCADE,
    reported_by BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    reason VARCHAR(30) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    resolved_by BIGINT REFERENCES app_user(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for ABUSE_REPORT
CREATE INDEX IF NOT EXISTS idx_abuse_report_decision ON abuse_report(decision_id);
CREATE INDEX IF NOT EXISTS idx_abuse_report_status ON abuse_report(status);
CREATE INDEX IF NOT EXISTS idx_abuse_report_reporter ON abuse_report(reported_by);

-- 2. Performance Indexes for Discussion & Threaded Comments
CREATE INDEX IF NOT EXISTS idx_comment_decision_created ON comment(decision_id, created_at);

-- 3. Performance Indexes for Notification Workflows
CREATE INDEX IF NOT EXISTS idx_notification_user_unread ON notification(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notification_user_created ON notification(user_id, created_at);
