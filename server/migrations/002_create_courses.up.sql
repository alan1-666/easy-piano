CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000) DEFAULT '',
    level INT NOT NULL DEFAULT 1,
    order_index INT NOT NULL DEFAULT 0,
    is_free BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_is_free ON courses(is_free);

CREATE TABLE lessons (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id),
    song_id BIGINT,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000) DEFAULT '',
    order_index INT NOT NULL DEFAULT 0,
    type VARCHAR(20) NOT NULL DEFAULT 'teach',
    content TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lessons_course_id ON lessons(course_id);

CREATE TABLE user_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    lesson_id BIGINT NOT NULL REFERENCES lessons(id),
    status VARCHAR(20) NOT NULL DEFAULT 'locked',
    best_score INT,
    stars INT NOT NULL DEFAULT 0,
    attempts INT NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
