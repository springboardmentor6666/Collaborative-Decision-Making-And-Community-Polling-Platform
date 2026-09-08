-- Migration V7: Drop obsolete check constraints on abuse_report to support all AbuseReason and AbuseReportStatus enums
ALTER TABLE abuse_report DROP CONSTRAINT IF EXISTS abuse_report_reason_check;
ALTER TABLE abuse_report DROP CONSTRAINT IF EXISTS abuse_report_status_check;
