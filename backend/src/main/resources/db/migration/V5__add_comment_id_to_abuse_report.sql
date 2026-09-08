-- Migration V5: Add comment_id to abuse_report table for comment reporting
ALTER TABLE abuse_report ADD COLUMN IF NOT EXISTS comment_id BIGINT REFERENCES comment(comment_id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_abuse_report_comment ON abuse_report(comment_id);
