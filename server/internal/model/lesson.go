package model

import "time"

type Lesson struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	CourseID    uint      `gorm:"index" json:"course_id"`
	SongID      *uint     `json:"song_id,omitempty"`
	Title       string    `gorm:"size:200" json:"title"`
	Description string    `gorm:"size:1000" json:"description"`
	OrderIndex  int       `json:"order_index"`
	Type        string    `gorm:"size:20" json:"type"` // teach/practice/challenge
	Content     string    `gorm:"type:text" json:"content"`
	CreatedAt   time.Time `json:"created_at"`
}

type UserProgress struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	UserID      uint       `gorm:"index" json:"user_id"`
	LessonID    uint       `gorm:"index" json:"lesson_id"`
	Status      string     `gorm:"size:20;default:'locked'" json:"status"` // locked/unlocked/completed
	BestScore   *int       `json:"best_score,omitempty"`
	Stars       int        `gorm:"default:0" json:"stars"`
	Attempts    int        `gorm:"default:0" json:"attempts"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
}
