-- V3: Add Decision Impressions & Analytics
-- Compatible with MySQL 8.0

CREATE TABLE IF NOT EXISTS decision_impressions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    decision_id BIGINT NOT NULL,
    user_id BIGINT NULL,
    user_email VARCHAR(255) NULL,
    client_ip VARCHAR(64) NULL,
    ip_hash VARCHAR(64) NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'VIEW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_impression_type CHECK (type IN ('VIEW', 'REACH')),
    FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_impressions_decision ON decision_impressions (decision_id);
CREATE INDEX idx_impressions_type ON decision_impressions (decision_id, type);
