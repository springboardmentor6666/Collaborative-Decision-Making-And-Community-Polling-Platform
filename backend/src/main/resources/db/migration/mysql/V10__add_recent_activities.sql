-- V10: Add Recent Activities Table & Indexes (MySQL)
CREATE TABLE IF NOT EXISTS activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_id BIGINT NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    community_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    metadata TEXT NULL,
    visibility VARCHAR(20) DEFAULT 'PUBLIC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activities_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_activities_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
);

CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_activities_visibility ON activities(visibility, created_at);
CREATE INDEX idx_activities_community ON activities(community_id, visibility, created_at);
CREATE INDEX idx_activities_actor ON activities(actor_id, visibility, created_at);
