-- ============================================================
-- DECISIONHUB FLYWAY MIGRATION: V14__add_notify_hikes_to_user_preference.sql
-- Description: Add notify_hikes column to user_preference table
-- ============================================================

ALTER TABLE user_preference ADD COLUMN IF NOT EXISTS notify_hikes BOOLEAN NOT NULL DEFAULT TRUE;
