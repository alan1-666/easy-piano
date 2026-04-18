CREATE TABLE practice_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    song_id BIGINT NOT NULL REFERENCES songs(id),
    mode VARCHAR(20) NOT NULL DEFAULT 'standard',
    speed DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    score INT NOT NULL DEFAULT 0,
    accuracy DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    max_combo INT NOT NULL DEFAULT 0,
    perfect_count INT NOT NULL DEFAULT 0,
    great_count INT NOT NULL DEFAULT 0,
    good_count INT NOT NULL DEFAULT 0,
    miss_count INT NOT NULL DEFAULT 0,
    duration INT NOT NULL DEFAULT 0,
    played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    synced BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_practice_logs_user_id ON practice_logs(user_id);
CREATE INDEX idx_practice_logs_song_id ON practice_logs(song_id);
CREATE INDEX idx_practice_logs_played_at ON practice_logs(played_at);
