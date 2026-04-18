package database

import (
	"log"

	"github.com/alan1-666/easy-piano/server/internal/config"
	"github.com/alan1-666/easy-piano/server/internal/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init(cfg config.DatabaseConfig) {
	var err error
	DB, err = gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto-migrate all models
	err = DB.AutoMigrate(
		&model.User{},
		&model.UserSettings{},
		&model.Course{},
		&model.Lesson{},
		&model.UserProgress{},
		&model.Song{},
		&model.PracticeLog{},
		&model.Achievement{},
		&model.UserAchievement{},
		&model.Subscription{},
		&model.SongPurchase{},
	)
	if err != nil {
		log.Fatalf("Failed to auto-migrate: %v", err)
	}
	log.Println("Database connected and migrated")
}

func Close() {
	sqlDB, _ := DB.DB()
	if sqlDB != nil {
		sqlDB.Close()
	}
}
