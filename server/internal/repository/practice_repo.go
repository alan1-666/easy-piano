package repository

import (
	"time"

	"github.com/alan1-666/easy-piano/server/internal/model"
	"gorm.io/gorm"
)

type PracticeRepository interface {
	Create(log *model.PracticeLog) error
	CreateBatch(logs []model.PracticeLog) error
	FindByUser(userID uint, page, pageSize int) ([]model.PracticeLog, int64, error)
	GetStreak(userID uint) (int, error)
}

type practiceRepository struct {
	db *gorm.DB
}

func NewPracticeRepository(db *gorm.DB) PracticeRepository {
	return &practiceRepository{db: db}
}

func (r *practiceRepository) Create(log *model.PracticeLog) error {
	return r.db.Create(log).Error
}

func (r *practiceRepository) CreateBatch(logs []model.PracticeLog) error {
	return r.db.Create(&logs).Error
}

func (r *practiceRepository) FindByUser(userID uint, page, pageSize int) ([]model.PracticeLog, int64, error) {
	var logs []model.PracticeLog
	var count int64

	err := r.db.Model(&model.PracticeLog{}).Where("user_id = ?", userID).Count(&count).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	err = r.db.Where("user_id = ?", userID).
		Order("played_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&logs).Error
	return logs, count, err
}

func (r *practiceRepository) GetStreak(userID uint) (int, error) {
	var dates []time.Time
	err := r.db.Model(&model.PracticeLog{}).
		Select("DISTINCT DATE(played_at) as practice_date").
		Where("user_id = ?", userID).
		Order("practice_date DESC").
		Limit(365).
		Pluck("practice_date", &dates).Error
	if err != nil {
		return 0, err
	}

	streak := 0
	today := time.Now().Truncate(24 * time.Hour)
	for i, d := range dates {
		expected := today.AddDate(0, 0, -i)
		if d.Truncate(24 * time.Hour).Equal(expected) {
			streak++
		} else {
			break
		}
	}
	return streak, nil
}
