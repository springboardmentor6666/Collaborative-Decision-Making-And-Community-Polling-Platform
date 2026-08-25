-- V8: Add Decision History, Audit Log Enhancements, and Table Refinements
-- Compatible with PostgreSQL

-- 1. decision_history table
CREATE TABLE IF NOT EXISTS decision_history (
    id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL,
    changed_field VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by BIGINT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 2. Extend audit_logs table
ALTER TABLE audit_logs ADD COLUMN actor_id BIGINT NULL;
ALTER TABLE audit_logs ADD COLUMN metadata TEXT;
ALTER TABLE audit_logs ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL;

-- 3. Extend attachments table
ALTER TABLE attachments ADD COLUMN owner_type VARCHAR(50) NULL;
ALTER TABLE attachments ADD COLUMN owner_id BIGINT NULL;
ALTER TABLE attachments ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 4. Extend generated_reports table
ALTER TABLE generated_reports ADD COLUMN type VARCHAR(50) NULL;
ALTER TABLE generated_reports ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Indexes for performance
CREATE INDEX idx_decision_history_decision ON decision_history(decision_id);
CREATE INDEX idx_decision_history_changed_by ON decision_history(changed_by);
CREATE INDEX idx_decision_history_changed_at ON decision_history(changed_at);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX idx_saved_decisions_decision ON saved_decisions(decision_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX idx_attachments_owner ON attachments(owner_type, owner_id);
CREATE INDEX idx_generated_reports_generated_by ON generated_reports(generated_by);
CREATE INDEX idx_generated_reports_created_at ON generated_reports(created_at);
