package service

import (
	"time"

	"github.com/alan1-666/easy-piano/server/internal/model"
	"gorm.io/gorm"
)

type AchievementService interface {
	GetAchievements(userID uint) ([]model.Achievement, []model.UserAchievement, error)
	CheckAndUnlock(userID uint) ([]model.Achievement, error)
}

type achievementService struct {
	db *gorm.DB
}

func NewAchievementService(db *gorm.DB) AchievementService {
	return &achievementService{db: db}
}

func (s *achievementService) GetAchievements(userID uint) ([]model.Achievement, []model.UserAchievement, error) {
	var achievements []model.Achievement
	if err := s.db.Find(&achievements).Error; err != nil {
		return nil, nil, err
	}

	var userAchievements []model.UserAchievement
	if err := s.db.Where("user_id = ?", userID).Find(&userAchievements).Error; err != nil {
		return nil, nil, err
	}

	return achievements, userAchievements, nil
}

func (s *achievementService) CheckAndUnlock(userID uint) ([]model.Achievement, error) {
	var unlocked []model.Achievement

	var achievements []model.Achievement
	s.db.Find(&achievements)

	var existing []model.UserAchievement
	s.db.Where("user_id = ?", userID).Find(&existing)
	existingMap := make(map[uint]bool)
	for _, e := range existing {
		existingMap[e.AchievementID] = true
	}

	for _, a := range achievements {
		if existingMap[a.ID] {
			continue
		}

		met := false
		switch a.ConditionType {
		case "total_songs":
			var count int64
			s.db.Model(&model.PracticeLog{}).Where("user_id = ?", userID).
				Distinct("song_id").Count(&count)
			met = int(count) >= a.ConditionValue
		case "streak_days":
			var dates []time.Time
			s.db.Model(&model.PracticeLog{}).
				Select("DISTINCT DATE(played_at)").
				Where("user_id = ?", userID).
				Pluck("DATE(played_at)", &dates)
			met = len(dates) >= a.ConditionValue
		case "max_combo":
			var maxCombo int
			s.db.Model(&model.PracticeLog{}).Where("user_id = ?", userID).
				Select("COALESCE(MAX(max_combo), 0)").Scan(&maxCombo)
			met = maxCombo >= a.ConditionValue
		case "perfect_song":
			var count int64
			s.db.Model(&model.PracticeLog{}).
				Where("user_id = ? AND miss_count = 0 AND good_count = 0 AND great_count = 0", userID).
				Count(&count)
			met = int(count) >= a.ConditionValue
		}

		if met {
			ua := model.UserAchievement{
				UserID:        userID,
				AchievementID: a.ID,
				UnlockedAt:    time.Now(),
			}
			s.db.Create(&ua)
			unlocked = append(unlocked, a)
		}
	}

	return unlocked, nil
}
