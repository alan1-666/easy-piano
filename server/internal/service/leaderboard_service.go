package service

import (
	"time"

	"github.com/alan1-666/easy-piano/server/internal/model"
	"gorm.io/gorm"
)

type LeaderboardEntry struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Score    int    `json:"score"`
	Rank     int    `json:"rank"`
}

type LeaderboardService interface {
	GetSongLeaderboard(songID uint, page, pageSize int) ([]LeaderboardEntry, error)
	GetWeeklyLeaderboard(page, pageSize int) ([]LeaderboardEntry, error)
}

type leaderboardService struct {
	db *gorm.DB
}

func NewLeaderboardService(db *gorm.DB) LeaderboardService {
	return &leaderboardService{db: db}
}

func (s *leaderboardService) GetSongLeaderboard(songID uint, page, pageSize int) ([]LeaderboardEntry, error) {
	var entries []LeaderboardEntry
	offset := (page - 1) * pageSize

	err := s.db.Model(&model.PracticeLog{}).
		Select("practice_logs.user_id, users.username, MAX(practice_logs.score) as score").
		Joins("JOIN users ON users.id = practice_logs.user_id").
		Where("practice_logs.song_id = ? AND practice_logs.mode = 'standard' AND practice_logs.speed >= 1.0", songID).
		Group("practice_logs.user_id, users.username").
		Order("score DESC").
		Offset(offset).Limit(pageSize).
		Scan(&entries).Error

	for i := range entries {
		entries[i].Rank = offset + i + 1
	}

	return entries, err
}

func (s *leaderboardService) GetWeeklyLeaderboard(page, pageSize int) ([]LeaderboardEntry, error) {
	var entries []LeaderboardEntry
	offset := (page - 1) * pageSize
	weekAgo := time.Now().AddDate(0, 0, -7)

	err := s.db.Model(&model.PracticeLog{}).
		Select("practice_logs.user_id, users.username, SUM(practice_logs.score) as score").
		Joins("JOIN users ON users.id = practice_logs.user_id").
		Where("practice_logs.played_at >= ?", weekAgo).
		Group("practice_logs.user_id, users.username").
		Order("score DESC").
		Offset(offset).Limit(pageSize).
		Scan(&entries).Error

	for i := range entries {
		entries[i].Rank = offset + i + 1
	}

	return entries, err
}
