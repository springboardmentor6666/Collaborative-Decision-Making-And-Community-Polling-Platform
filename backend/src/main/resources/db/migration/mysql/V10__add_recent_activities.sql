-- V10: Add Recent Activities Table, High-Performance Composite Indexes, and Initial Feed Seed (MySQL 8.0)

-- 1. Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_id BIGINT NOT NULL,
    activity_type VARCHAR(40) NOT NULL,
    entity_type VARCHAR(30) NOT NULL,
    entity_id BIGINT NOT NULL,
    community_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    metadata JSON NULL,
    visibility VARCHAR(15) DEFAULT 'PUBLIC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_activity_visibility CHECK (visibility IN ('PUBLIC', 'COMMUNITY_ONLY', 'PRIVATE')),
    CONSTRAINT chk_activity_entity_type CHECK (entity_type IN ('DECISION', 'POLL', 'COMMENT', 'COMMUNITY', 'USER')),
    CONSTRAINT chk_activity_type CHECK (activity_type IN (
        'DECISION_CREATED', 'DECISION_CLOSED', 'VOTE_CAST', 'COMMENT_ADDED',
        'SUGGESTION_SUBMITTED', 'RECOMMENDATION_ADDED', 'COMMUNITY_CREATED',
        'COMMUNITY_JOINED', 'COMMUNITY_MESSAGE_SENT', 'OPTION_ADDED'
    )),
    CONSTRAINT fk_activities_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_activities_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. High-Performance Indexing Strategy
-- Global Activity Feed query
CREATE INDEX idx_activities_global ON activities (visibility, created_at DESC);

-- Community-Specific Feed query
CREATE INDEX idx_activities_community ON activities (community_id, visibility, created_at DESC);

-- User Profile Activity query
CREATE INDEX idx_activities_actor ON activities (actor_id, visibility, created_at DESC);

-- Entity Reference query
CREATE INDEX idx_activities_entity ON activities (entity_type, entity_id);

-- Legacy / general created_at index for sorting and retention sweeps
CREATE INDEX idx_activities_created_at ON activities (created_at);

-- 3. Automated Data Lifecycle Management
-- Retention policy: Activities older than 180 days (or private activities older than 90 days) can be archived or purged.
-- Handled application-side via scheduled task or database routine:
-- DELETE FROM activities WHERE created_at < NOW() - INTERVAL 180 DAY;

-- 4. Initial Seed / Backfill from Existing Records
-- a. Seed decision creations
INSERT INTO activities (actor_id, activity_type, entity_type, entity_id, community_id, title, metadata, visibility, created_at)
SELECT 
    d.owner_id,
    'DECISION_CREATED',
    'DECISION',
    d.id,
    d.community_id,
    CONCAT(COALESCE(u.full_name, 'User'), ' published decision "', d.title, '"'),
    CONCAT('{"decisionId":', d.id, ',"title":"', REPLACE(d.title, '"', '\\"'), '"}'),
    CASE WHEN d.visibility = 'PRIVATE' THEN 'PRIVATE' ELSE 'PUBLIC' END,
    d.created_at
FROM decisions d
JOIN users u ON d.owner_id = u.id
WHERE NOT EXISTS (
    SELECT 1 FROM activities a 
    WHERE a.activity_type = 'DECISION_CREATED' AND a.entity_type = 'DECISION' AND a.entity_id = d.id
);

-- b. Seed votes
INSERT INTO activities (actor_id, activity_type, entity_type, entity_id, community_id, title, metadata, visibility, created_at)
SELECT 
    v.voter_id,
    'VOTE_CAST',
    'POLL',
    v.poll_id,
    d.community_id,
    CONCAT(COALESCE(u.full_name, 'User'), ' voted on "', d.title, '"'),
    CONCAT('{"pollId":', v.poll_id, ',"decisionId":', d.id, '}'),
    CASE WHEN d.visibility = 'PRIVATE' THEN 'PRIVATE' ELSE 'PUBLIC' END,
    v.voted_at
FROM votes v
JOIN users u ON v.voter_id = u.id
JOIN polls p ON v.poll_id = p.id
JOIN decisions d ON p.decision_id = d.id
WHERE v.voter_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM activities a 
    WHERE a.activity_type = 'VOTE_CAST' AND a.entity_type = 'POLL' AND a.entity_id = v.poll_id AND a.actor_id = v.voter_id
);

-- c. Seed comments
INSERT INTO activities (actor_id, activity_type, entity_type, entity_id, community_id, title, metadata, visibility, created_at)
SELECT 
    c.author_id,
    'COMMENT_ADDED',
    'COMMENT',
    c.id,
    d.community_id,
    CONCAT(COALESCE(u.full_name, 'User'), ' commented on "', d.title, '"'),
    CONCAT('{"commentId":', c.id, ',"decisionId":', d.id, '}'),
    CASE WHEN d.visibility = 'PRIVATE' THEN 'PRIVATE' ELSE 'PUBLIC' END,
    c.created_at
FROM comments c
JOIN users u ON c.author_id = u.id
JOIN decisions d ON c.decision_id = d.id
WHERE NOT EXISTS (
    SELECT 1 FROM activities a 
    WHERE a.activity_type = 'COMMENT_ADDED' AND a.entity_type = 'COMMENT' AND a.entity_id = c.id
);

-- d. Seed community joins
INSERT INTO activities (actor_id, activity_type, entity_type, entity_id, community_id, title, metadata, visibility, created_at)
SELECT 
    cm.user_id,
    'COMMUNITY_JOINED',
    'COMMUNITY',
    cm.community_id,
    cm.community_id,
    CONCAT(COALESCE(u.full_name, 'User'), ' joined community "', comm.name, '"'),
    CONCAT('{"communityId":', cm.community_id, ',"role":"', cm.role, '"}'),
    'PUBLIC',
    comm.created_at
FROM community_members cm
JOIN users u ON cm.user_id = u.id
JOIN communities comm ON cm.community_id = comm.id
WHERE NOT EXISTS (
    SELECT 1 FROM activities a 
    WHERE a.activity_type = 'COMMUNITY_JOINED' AND a.entity_type = 'COMMUNITY' AND a.entity_id = cm.community_id AND a.actor_id = cm.user_id
);
