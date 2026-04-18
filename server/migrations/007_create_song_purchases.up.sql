CREATE TABLE song_purchases (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    song_id BIGINT NOT NULL REFERENCES songs(id),
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    apple_tx_id VARCHAR(200) DEFAULT '',
    UNIQUE(user_id, song_id)
);

CREATE INDEX idx_song_purchases_user_id ON song_purchases(user_id);
CREATE INDEX idx_song_purchases_song_id ON song_purchases(song_id);
