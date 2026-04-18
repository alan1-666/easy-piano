package service

import (
	"time"

	"github.com/alan1-666/easy-piano/server/internal/model"
	"gorm.io/gorm"
)

type PracticeService interface {
	SubmitLog(userID uint, log *model.PracticeLog) (*model.PracticeLog, error)
	SyncLogs(userID uint, logs []model.PracticeLog) error
	GetHistory(userID uint, page, pageSize int) ([]model.PracticeLog, int64, error)
	GetStreak(userID uint) (int, error)
}

type practiceService struct {
	db *gorm.DB
}

func NewPracticeService(db *gorm.DB) PracticeService {
	return &practiceService{db: db}
}

func (s *practiceService) SubmitLog(userID uint, log *model.PracticeLog) (*model.PracticeLog, error) {
	log.UserID = userID
	log.Synced = true
	if log.PlayedAt.IsZero() {
		log.PlayedAt = time.Now()
	}

	if err := s.db.Create(log).Error; err != nil {
		return nil, err
	}

	// Award XP based on score
	xp := log.Score / 100
	if xp < 10 {
		xp = 10
	}
	if xp > 200 {
		xp = 200
	}
	s.db.Model(&model.User{}).Where("id = ?", userID).Update("xp", gorm.Expr("xp + ?", xp))

	return log, nil
}

func (s *practiceService) SyncLogs(userID uint, logs []model.PracticeLog) error {
	for i := range logs {
		logs[i].UserID = userID
		logs[i].Synced = true
	}
	return s.db.Create(&logs).Error
}

func (s *practiceService) GetHistory(userID uint, page, pageSize int) ([]model.PracticeLog, int64, error) {
	var total int64
	s.db.Model(&model.PracticeLog{}).Where("user_id = ?", userID).Count(&total)

	var logs []model.PracticeLog
	offset := (page - 1) * pageSize
	err := s.db.Where("user_id = ?", userID).
		Order("played_at DESC").
		Offset(offset).Limit(pageSize).
		Find(&logs).Error

	return logs, total, err
}

func (s *practiceService) GetStreak(userID uint) (int, error) {
	var dates []time.Time
	s.db.Model(&model.PracticeLog{}).
		Select("DISTINCT DATE(played_at) as d").
		Where("user_id = ?", userID).
		Order("d DESC").
		Limit(365).
		Pluck("d", &dates)

	if len(dates) == 0 {
		return 0, nil
	}

	streak := 0
	today := time.Now().Truncate(24 * time.Hour)
	firstDate := dates[0].Truncate(24 * time.Hour)
	if !firstDate.Equal(today) && !firstDate.Equal(today.AddDate(0, 0, -1)) {
		return 0, nil
	}

	for i, d := range dates {
		expected := firstDate.AddDate(0, 0, -i)
		if d.Truncate(24 * time.Hour).Equal(expected) {
			streak++
		} else {
			break
		}
	}
	return streak, nil
}
