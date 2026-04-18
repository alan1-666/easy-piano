package repository

import (
	"github.com/alan1-666/easy-piano/server/internal/model"
	"gorm.io/gorm"
)

type AchievementRepository interface {
	FindAll() ([]model.Achievement, error)
	FindUserAchievements(userID uint) ([]model.UserAchievement, error)
	UnlockAchievement(ua *model.UserAchievement) error
}

type achievementRepository struct {
	db *gorm.DB
}

func NewAchievementRepository(db *gorm.DB) AchievementRepository {
	return &achievementRepository{db: db}
}

func (r *achievementRepository) FindAll() ([]model.Achievement, error) {
	var achievements []model.Achievement
	err := r.db.Find(&achievements).Error
	return achievements, err
}

func (r *achievementRepository) FindUserAchievements(userID uint) ([]model.UserAchievement, error) {
	var userAchievements []model.UserAchievement
	err := r.db.Where("user_id = ?", userID).Find(&userAchievements).Error
	return userAchievements, err
}

func (r *achievementRepository) UnlockAchievement(ua *model.UserAchievement) error {
	return r.db.Create(ua).Error
}
