package repository

import (
	"github.com/alan1-666/easy-piano/server/internal/model"
	"gorm.io/gorm"
)

type SongRepository interface {
	FindAll(page, pageSize int) ([]model.Song, int64, error)
	FindByID(id uint) (*model.Song, error)
	FindByDifficulty(difficulty int) ([]model.Song, error)
	Search(query string) ([]model.Song, error)
	FindFreeOrPurchased(userID uint, page, pageSize int) ([]model.Song, int64, error)
}

type songRepository struct {
	db *gorm.DB
}

func NewSongRepository(db *gorm.DB) SongRepository {
	return &songRepository{db: db}
}

func (r *songRepository) FindAll(page, pageSize int) ([]model.Song, int64, error) {
	var songs []model.Song
	var count int64
	err := r.db.Model(&model.Song{}).Count(&count).Error
	if err != nil {
		return nil, 0, err
	}
	offset := (page - 1) * pageSize
	err = r.db.Offset(offset).Limit(pageSize).Find(&songs).Error
	return songs, count, err
}

func (r *songRepository) FindByID(id uint) (*model.Song, error) {
	var song model.Song
	err := r.db.First(&song, id).Error
	if err != nil {
		return nil, err
	}
	return &song, nil
}

func (r *songRepository) FindByDifficulty(difficulty int) ([]model.Song, error) {
	var songs []model.Song
	err := r.db.Where("difficulty = ?", difficulty).Find(&songs).Error
	return songs, err
}

func (r *songRepository) Search(query string) ([]model.Song, error) {
	var songs []model.Song
	pattern := "%" + query + "%"
	err := r.db.Where("title ILIKE ? OR artist ILIKE ?", pattern, pattern).Find(&songs).Error
	return songs, err
}

func (r *songRepository) FindFreeOrPurchased(userID uint, page, pageSize int) ([]model.Song, int64, error) {
	var songs []model.Song
	var count int64

	q := r.db.Model(&model.Song{}).
		Where("is_free = ? OR id IN (SELECT song_id FROM song_purchases WHERE user_id = ?)", true, userID)

	err := q.Count(&count).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	err = q.Offset(offset).Limit(pageSize).Find(&songs).Error
	return songs, count, err
}
