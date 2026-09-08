-- Migration V6: Add community_id to abuse_report table for reporting communities
ALTER TABLE abuse_report ALTER COLUMN decision_id DROP NOT NULL;
ALTER TABLE abuse_report ADD COLUMN IF NOT EXISTS community_id BIGINT REFERENCES community(community_id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_abuse_report_community ON abuse_report(community_id);
