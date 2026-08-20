-- V4: Add Community Group Support & Group-Specific Decisions
-- Compatible with MySQL 8.0 & PostgreSQL

-- 1. Extend communities table
ALTER TABLE communities ADD COLUMN visibility VARCHAR(10) DEFAULT 'PUBLIC';
ALTER TABLE communities ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE communities ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX idx_communities_created_by ON communities(created_by);
CREATE INDEX idx_communities_visibility ON communities(visibility);

-- 2. Extend community_members table
ALTER TABLE community_members ADD COLUMN joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX idx_community_members_user ON community_members(user_id);

-- 3. Extend decisions table
ALTER TABLE decisions ADD COLUMN community_id BIGINT NULL;
ALTER TABLE decisions ADD CONSTRAINT fk_decisions_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE SET NULL;

CREATE INDEX idx_decisions_community ON decisions(community_id);
