CREATE TABLE decision_hike (
    hike_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    decision_id BIGINT NOT NULL REFERENCES decision(decision_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uk_decision_hike UNIQUE (user_id, decision_id)
);

CREATE INDEX idx_decision_hike_user ON decision_hike(user_id);
CREATE INDEX idx_decision_hike_decision ON decision_hike(decision_id);
