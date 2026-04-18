package model

import "time"

type Subscription struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	UserID    uint       `gorm:"index" json:"user_id"`
	Plan      string     `gorm:"size:20" json:"plan"`   // monthly/yearly/lifetime
	Status    string     `gorm:"size:20" json:"status"` // active/expired/cancelled
	StartedAt time.Time  `json:"started_at"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
	AppleTxID string     `gorm:"size:200" json:"-"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type SongPurchase struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"index" json:"user_id"`
	SongID      uint      `gorm:"index" json:"song_id"`
	PurchasedAt time.Time `json:"purchased_at"`
	AppleTxID   string    `gorm:"size:200" json:"-"`
}
