package service

import (
	"time"

	"github.com/alan1-666/easy-piano/server/internal/model"
	"gorm.io/gorm"
)

type SubscriptionService interface {
	GetStatus(userID uint) (*model.Subscription, error)
	VerifyReceipt(userID uint, receiptData string) (*model.Subscription, error)
	GetPurchasedSongs(userID uint) ([]model.SongPurchase, error)
	PurchaseSong(userID, songID uint, receiptData string) (*model.SongPurchase, error)
}

type subscriptionService struct {
	db *gorm.DB
}

func NewSubscriptionService(db *gorm.DB) SubscriptionService {
	return &subscriptionService{db: db}
}

func (s *subscriptionService) GetStatus(userID uint) (*model.Subscription, error) {
	var sub model.Subscription
	err := s.db.Where("user_id = ? AND status = 'active'", userID).
		Order("created_at DESC").First(&sub).Error
	if err != nil {
		return nil, err
	}
	// Check if expired
	if sub.ExpiresAt != nil && sub.ExpiresAt.Before(time.Now()) {
		sub.Status = "expired"
		s.db.Save(&sub)
		return nil, gorm.ErrRecordNotFound
	}
	return &sub, nil
}

func (s *subscriptionService) VerifyReceipt(userID uint, receiptData string) (*model.Subscription, error) {
	// TODO: Implement Apple receipt verification with Apple's servers
	// For now, create a subscription directly (development mode)
	sub := &model.Subscription{
		UserID:    userID,
		Plan:      "monthly",
		Status:    "active",
		StartedAt: time.Now(),
		AppleTxID: receiptData,
	}
	expires := time.Now().AddDate(0, 1, 0)
	sub.ExpiresAt = &expires

	if err := s.db.Create(sub).Error; err != nil {
		return nil, err
	}
	return sub, nil
}

func (s *subscriptionService) GetPurchasedSongs(userID uint) ([]model.SongPurchase, error) {
	var purchases []model.SongPurchase
	err := s.db.Where("user_id = ?", userID).Find(&purchases).Error
	return purchases, err
}

func (s *subscriptionService) PurchaseSong(userID, songID uint, receiptData string) (*model.SongPurchase, error) {
	// Check if already purchased
	var existing model.SongPurchase
	if s.db.Where("user_id = ? AND song_id = ?", userID, songID).First(&existing).Error == nil {
		return &existing, nil
	}

	purchase := &model.SongPurchase{
		UserID:      userID,
		SongID:      songID,
		PurchasedAt: time.Now(),
		AppleTxID:   receiptData,
	}
	if err := s.db.Create(purchase).Error; err != nil {
		return nil, err
	}
	return purchase, nil
}
