package model

import "time"

type Achievement struct {
	ID             uint   `gorm:"primaryKey" json:"id"`
	Name           string `gorm:"size:100" json:"name"`
	Description    string `gorm:"size:500" json:"description"`
	Icon           string `gorm:"size:100" json:"icon"`
	ConditionType  string `gorm:"size:50" json:"condition_type"`
	ConditionValue int    `json:"condition_value"`
}

type UserAchievement struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uint      `gorm:"index" json:"user_id"`
	AchievementID uint      `gorm:"index" json:"achievement_id"`
	UnlockedAt    time.Time `json:"unlocked_at"`
}
