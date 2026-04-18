package model

import "time"

type Song struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Title         string    `gorm:"size:200" json:"title"`
	Artist        string    `gorm:"size:100" json:"artist"`
	Difficulty    int       `gorm:"index" json:"difficulty"`
	BPM           int       `json:"bpm"`
	Duration      int       `json:"duration"`
	TimeSignature string    `gorm:"size:10" json:"time_signature"`
	KeySignature  string    `gorm:"size:10" json:"key_signature"`
	MidiData      string    `gorm:"type:text" json:"midi_data"`
	Tags          string    `gorm:"type:text" json:"tags"`
	CoverURL      string    `gorm:"size:500" json:"cover_url"`
	IsFree        bool      `gorm:"default:false;index" json:"is_free"`
	Locale        string    `gorm:"size:10;default:'zh-CN'" json:"locale"`
	CreatedAt     time.Time `json:"created_at"`
}
