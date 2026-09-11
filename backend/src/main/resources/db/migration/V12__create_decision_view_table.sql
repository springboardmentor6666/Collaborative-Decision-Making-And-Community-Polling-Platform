CREATE TABLE decision_view (
    view_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    decision_id BIGINT NOT NULL REFERENCES decision(decision_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uk_decision_view UNIQUE (user_id, decision_id)
);

CREATE INDEX idx_decision_view_user ON decision_view(user_id);
CREATE INDEX idx_decision_view_decision ON decision_view(decision_id);
