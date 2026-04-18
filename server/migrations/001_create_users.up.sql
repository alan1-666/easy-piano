CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL DEFAULT '',
    apple_id VARCHAR(200) UNIQUE,
    wechat_open_id VARCHAR(200) UNIQUE,
    avatar_url VARCHAR(500) DEFAULT '',
    level INT NOT NULL DEFAULT 1,
    xp INT NOT NULL DEFAULT 0,
    parent_id BIGINT REFERENCES users(id),
    is_child BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_parent_id ON users(parent_id);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
