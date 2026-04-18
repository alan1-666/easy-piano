CREATE TABLE user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    fall_speed DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    left_hand_color VARCHAR(7) NOT NULL DEFAULT '#4A90D9',
    right_hand_color VARCHAR(7) NOT NULL DEFAULT '#50C878',
    sound_font VARCHAR(50) NOT NULL DEFAULT 'default',
    metronome_on BOOLEAN NOT NULL DEFAULT FALSE,
    daily_goal_min INT NOT NULL DEFAULT 30,
    locale VARCHAR(10) NOT NULL DEFAULT 'zh-CN'
);
