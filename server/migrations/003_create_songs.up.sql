CREATE TABLE songs (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    artist VARCHAR(100) DEFAULT '',
    difficulty INT NOT NULL DEFAULT 1,
    bpm INT NOT NULL DEFAULT 120,
    duration INT NOT NULL DEFAULT 0,
    time_signature VARCHAR(10) DEFAULT '4/4',
    key_signature VARCHAR(10) DEFAULT 'C',
    midi_data TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    cover_url VARCHAR(500) DEFAULT '',
    is_free BOOLEAN NOT NULL DEFAULT FALSE,
    locale VARCHAR(10) NOT NULL DEFAULT 'zh-CN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_songs_difficulty ON songs(difficulty);
CREATE INDEX idx_songs_is_free ON songs(is_free);

ALTER TABLE lessons ADD CONSTRAINT fk_lessons_song_id FOREIGN KEY (song_id) REFERENCES songs(id);
