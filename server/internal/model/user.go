package model

import (
	"time"

	"gorm.io/gorm"
)

// Phone, AppleID, WechatOpenID are nullable pointers so that unset values
// are written as NULL. Empty strings would collide on the UNIQUE index —
// PostgreSQL treats '' as equal across rows, but NULLs are always unique.
type User struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Username     string         `gorm:"uniqueIndex;size:50" json:"username"`
	Email        string         `gorm:"uniqueIndex;size:100" json:"email"`
	Phone        *string        `gorm:"uniqueIndex;size:20" json:"phone,omitempty"`
	PasswordHash string         `gorm:"size:255" json:"-"`
	AppleID      *string        `gorm:"uniqueIndex;size:200" json:"-"`
	WechatOpenID *string        `gorm:"uniqueIndex;size:200" json:"-"`
	AvatarURL    string         `gorm:"size:500" json:"avatar_url"`
	Level        int            `gorm:"default:1" json:"level"`
	XP           int            `gorm:"default:0" json:"xp"`
	ParentID     *uint          `gorm:"index" json:"parent_id,omitempty"`
	IsChild      bool           `gorm:"default:false" json:"is_child"`
	IsAdmin      bool           `gorm:"default:false" json:"is_admin"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}
