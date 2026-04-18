package model

import "time"

type PracticeLog struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	UserID       uint      `gorm:"index" json:"user_id"`
	SongID       uint      `gorm:"index" json:"song_id"`
	Mode         string    `gorm:"size:20" json:"mode"`
	Speed        float64   `gorm:"default:1.0" json:"speed"`
	Score        int       `json:"score"`
	Accuracy     float64   `json:"accuracy"`
	MaxCombo     int       `json:"max_combo"`
	PerfectCount int       `json:"perfect_count"`
	GreatCount   int       `json:"great_count"`
	GoodCount    int       `json:"good_count"`
	MissCount    int       `json:"miss_count"`
	Duration     int       `json:"duration"`
	PlayedAt     time.Time `gorm:"index" json:"played_at"`
	Synced       bool      `gorm:"default:true" json:"synced"`
}
