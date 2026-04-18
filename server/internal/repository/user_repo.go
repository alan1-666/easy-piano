package repository

import (
	"github.com/alan1-666/easy-piano/server/internal/model"
	"gorm.io/gorm"
)

type UserRepository interface {
	Create(user *model.User) error
	FindByID(id uint) (*model.User, error)
	FindByEmail(email string) (*model.User, error)
	FindByPhone(phone string) (*model.User, error)
	FindByAppleID(appleID string) (*model.User, error)
	FindByWechatOpenID(openID string) (*model.User, error)
	Update(user *model.User) error
	Delete(id uint) error
	FindChildren(parentID uint) ([]model.User, error)
	FindSettingsByUserID(userID uint) (*model.UserSettings, error)
	SaveSettings(settings *model.UserSettings) error
	FindProgressByUser(userID uint) ([]model.UserProgress, error)
	FindProgressByUserAndLesson(userID, lessonID uint) (*model.UserProgress, error)
	SaveProgress(progress *model.UserProgress) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(user *model.User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) FindByID(id uint) (*model.User, error) {
	var user model.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) FindByEmail(email string) (*model.User, error) {
	var user model.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) FindByPhone(phone string) (*model.User, error) {
	var user model.User
	err := r.db.Where("phone = ?", phone).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) FindByAppleID(appleID string) (*model.User, error) {
	var user model.User
	err := r.db.Where("apple_id = ?", appleID).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) FindByWechatOpenID(openID string) (*model.User, error) {
	var user model.User
	err := r.db.Where("wechat_open_id = ?", openID).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) Update(user *model.User) error {
	return r.db.Save(user).Error
}

func (r *userRepository) Delete(id uint) error {
	return r.db.Delete(&model.User{}, id).Error
}

func (r *userRepository) FindChildren(parentID uint) ([]model.User, error) {
	var children []model.User
	err := r.db.Where("parent_id = ?", parentID).Find(&children).Error
	return children, err
}

func (r *userRepository) FindSettingsByUserID(userID uint) (*model.UserSettings, error) {
	var settings model.UserSettings
	err := r.db.Where("user_id = ?", userID).First(&settings).Error
	if err != nil {
		return nil, err
	}
	return &settings, nil
}

func (r *userRepository) SaveSettings(settings *model.UserSettings) error {
	return r.db.Save(settings).Error
}

func (r *userRepository) FindProgressByUser(userID uint) ([]model.UserProgress, error) {
	var progress []model.UserProgress
	err := r.db.Where("user_id = ?", userID).Find(&progress).Error
	return progress, err
}

func (r *userRepository) FindProgressByUserAndLesson(userID, lessonID uint) (*model.UserProgress, error) {
	var progress model.UserProgress
	err := r.db.Where("user_id = ? AND lesson_id = ?", userID, lessonID).First(&progress).Error
	if err != nil {
		return nil, err
	}
	return &progress, nil
}

func (r *userRepository) SaveProgress(progress *model.UserProgress) error {
	return r.db.Save(progress).Error
}
