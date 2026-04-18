package model

type UserSettings struct {
	ID             uint    `gorm:"primaryKey" json:"id"`
	UserID         uint    `gorm:"uniqueIndex" json:"user_id"`
	FallSpeed      float64 `gorm:"default:1.0" json:"fall_speed"`
	LeftHandColor  string  `gorm:"size:7;default:'#4A90D9'" json:"left_hand_color"`
	RightHandColor string  `gorm:"size:7;default:'#50C878'" json:"right_hand_color"`
	SoundFont      string  `gorm:"size:50;default:'default'" json:"sound_font"`
	MetronomeOn    bool    `gorm:"default:false" json:"metronome_on"`
	DailyGoalMin   int     `gorm:"default:30" json:"daily_goal_min"`
	Locale         string  `gorm:"size:10;default:'zh-CN'" json:"locale"`
}
