package model

import "time"

type Course struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"size:200" json:"title"`
	Description string    `gorm:"size:1000" json:"description"`
	Level       int       `gorm:"index" json:"level"`
	OrderIndex  int       `json:"order_index"`
	IsFree      bool      `gorm:"default:false;index" json:"is_free"`
	CreatedAt   time.Time `json:"created_at"`
}
