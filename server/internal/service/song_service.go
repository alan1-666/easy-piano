package service

import (
	"github.com/alan1-666/easy-piano/server/internal/model"
	"gorm.io/gorm"
)

type SongService interface {
	GetSongs(page, pageSize int, difficulty *int, query string) ([]model.Song, int64, error)
	GetSong(id uint) (*model.Song, error)
}

type songService struct {
	db *gorm.DB
}

func NewSongService(db *gorm.DB) SongService {
	return &songService{db: db}
}

func (s *songService) GetSongs(page, pageSize int, difficulty *int, query string) ([]model.Song, int64, error) {
	db := s.db.Model(&model.Song{})

	if difficulty != nil {
		db = db.Where("difficulty = ?", *difficulty)
	}
	if query != "" {
		db = db.Where("title ILIKE ? OR artist ILIKE ?", "%"+query+"%", "%"+query+"%")
	}

	var total int64
	db.Count(&total)

	var songs []model.Song
	offset := (page - 1) * pageSize
	err := db.Offset(offset).Limit(pageSize).Order("difficulty, title").Find(&songs).Error

	// Clear MidiData from list results (too large for list view)
	for i := range songs {
		songs[i].MidiData = ""
	}

	return songs, total, err
}

func (s *songService) GetSong(id uint) (*model.Song, error) {
	var song model.Song
	err := s.db.First(&song, id).Error
	return &song, err
}
