package repository

import (
	"github.com/alan1-666/easy-piano/server/internal/model"
	"gorm.io/gorm"
)

type SubscriptionRepository interface {
	FindByUser(userID uint) (*model.Subscription, error)
	Create(sub *model.Subscription) error
	Update(sub *model.Subscription) error
	FindPurchasedSongs(userID uint) ([]model.SongPurchase, error)
	CreateSongPurchase(purchase *model.SongPurchase) error
}

type subscriptionRepository struct {
	db *gorm.DB
}

func NewSubscriptionRepository(db *gorm.DB) SubscriptionRepository {
	return &subscriptionRepository{db: db}
}

func (r *subscriptionRepository) FindByUser(userID uint) (*model.Subscription, error) {
	var sub model.Subscription
	err := r.db.Where("user_id = ? AND status = ?", userID, "active").First(&sub).Error
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

func (r *subscriptionRepository) Create(sub *model.Subscription) error {
	return r.db.Create(sub).Error
}

func (r *subscriptionRepository) Update(sub *model.Subscription) error {
	return r.db.Save(sub).Error
}

func (r *subscriptionRepository) FindPurchasedSongs(userID uint) ([]model.SongPurchase, error) {
	var purchases []model.SongPurchase
	err := r.db.Where("user_id = ?", userID).Find(&purchases).Error
	return purchases, err
}

func (r *subscriptionRepository) CreateSongPurchase(purchase *model.SongPurchase) error {
	return r.db.Create(purchase).Error
}
