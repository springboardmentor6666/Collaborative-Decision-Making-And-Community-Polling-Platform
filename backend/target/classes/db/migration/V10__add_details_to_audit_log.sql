-- V10__add_details_to_audit_log.sql
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS details VARCHAR(1000);
