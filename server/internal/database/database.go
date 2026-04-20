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

	// One-shot cleanup: pre-existing rows may have '' in these columns
	// (left over from when the fields were string instead of *string).
	// PostgreSQL's UNIQUE index treats '' as equal across rows, so these
	// empty strings block new registrations. Null them out once; the
	// pointer fields mean future inserts write NULL directly.
	DB.Exec("UPDATE users SET phone = NULL WHERE phone = ''")
	DB.Exec("UPDATE users SET apple_id = NULL WHERE apple_id = ''")
	DB.Exec("UPDATE users SET wechat_open_id = NULL WHERE wechat_open_id = ''")

	log.Println("Database connected and migrated")
}

func Close() {
	sqlDB, _ := DB.DB()
	if sqlDB != nil {
		sqlDB.Close()
	}
}
