package service

import (
	"errors"
	"time"

	"github.com/alan1-666/easy-piano/server/internal/model"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService interface {
	GetProfile(userID uint) (*model.User, error)
	UpdateProfile(userID uint, updates map[string]interface{}) error
	GetStats(userID uint) (map[string]interface{}, error)
	GetSettings(userID uint) (*model.UserSettings, error)
	UpdateSettings(userID uint, settings *model.UserSettings) error
	GetChildren(parentID uint) ([]model.User, error)
	CreateChild(parentID uint, username, password string) (*model.User, error)
}

type userService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) UserService {
	return &userService{db: db}
}

func (s *userService) GetProfile(userID uint) (*model.User, error) {
	var user model.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *userService) UpdateProfile(userID uint, updates map[string]interface{}) error {
	allowed := map[string]bool{"username": true, "avatar_url": true, "phone": true}
	filtered := make(map[string]interface{})
	for k, v := range updates {
		if allowed[k] {
			filtered[k] = v
		}
	}
	if len(filtered) == 0 {
		return nil
	}
	return s.db.Model(&model.User{}).Where("id = ?", userID).Updates(filtered).Error
}

func (s *userService) GetStats(userID uint) (map[string]interface{}, error) {
	var totalPracticeTime int64
	var totalSongs int64
	var totalSessions int64

	s.db.Model(&model.PracticeLog{}).Where("user_id = ?", userID).
		Select("COALESCE(SUM(duration), 0)").Scan(&totalPracticeTime)
	s.db.Model(&model.PracticeLog{}).Where("user_id = ?", userID).
		Distinct("song_id").Count(&totalSongs)
	s.db.Model(&model.PracticeLog{}).Where("user_id = ?", userID).
		Count(&totalSessions)

	streak := s.calculateStreak(userID)

	return map[string]interface{}{
		"total_practice_seconds": totalPracticeTime,
		"total_songs_played":    totalSongs,
		"total_sessions":        totalSessions,
		"current_streak":        streak,
	}, nil
}

func (s *userService) calculateStreak(userID uint) int {
	var dates []time.Time
	s.db.Model(&model.PracticeLog{}).
		Select("DISTINCT DATE(played_at) as d").
		Where("user_id = ?", userID).
		Order("d DESC").
		Limit(365).
		Pluck("d", &dates)

	if len(dates) == 0 {
		return 0
	}

	streak := 0
	today := time.Now().Truncate(24 * time.Hour)

	firstDate := dates[0].Truncate(24 * time.Hour)
	if !firstDate.Equal(today) && !firstDate.Equal(today.AddDate(0, 0, -1)) {
		return 0
	}

	for i, d := range dates {
		expected := firstDate.AddDate(0, 0, -i)
		if d.Truncate(24 * time.Hour).Equal(expected) {
			streak++
		} else {
			break
		}
	}
	return streak
}

func (s *userService) GetSettings(userID uint) (*model.UserSettings, error) {
	var settings model.UserSettings
	err := s.db.Where("user_id = ?", userID).First(&settings).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			settings = model.UserSettings{UserID: userID}
			s.db.Create(&settings)
			return &settings, nil
		}
		return nil, err
	}
	return &settings, nil
}

func (s *userService) UpdateSettings(userID uint, settings *model.UserSettings) error {
	settings.UserID = userID
	return s.db.Where("user_id = ?", userID).Assign(settings).FirstOrCreate(&model.UserSettings{}).Error
}

func (s *userService) GetChildren(parentID uint) ([]model.User, error) {
	var children []model.User
	err := s.db.Where("parent_id = ?", parentID).Find(&children).Error
	return children, err
}

func (s *userService) CreateChild(parentID uint, username, password string) (*model.User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	child := &model.User{
		Username:     username,
		PasswordHash: string(hash),
		ParentID:     &parentID,
		IsChild:      true,
	}
	if err := s.db.Create(child).Error; err != nil {
		return nil, err
	}
	s.db.Create(&model.UserSettings{UserID: child.ID})
	return child, nil
}
