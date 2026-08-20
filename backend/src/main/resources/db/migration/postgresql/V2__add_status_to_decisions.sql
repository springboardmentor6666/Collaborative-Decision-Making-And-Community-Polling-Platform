-- V2: Add status column to decisions table
-- Compatible with MySQL 8.0 & PostgreSQL

ALTER TABLE decisions ADD COLUMN status VARCHAR(20) DEFAULT 'OPEN';
