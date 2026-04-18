package database

import (
	"context"
	"log"

	"github.com/alan1-666/easy-piano/server/internal/config"
	"github.com/redis/go-redis/v9"
)

var RDB *redis.Client

func InitRedis(cfg config.RedisConfig) {
	RDB = redis.NewClient(&redis.Options{
		Addr:     cfg.Addr,
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	ctx := context.Background()
	if err := RDB.Ping(ctx).Err(); err != nil {
		log.Printf("Warning: Redis connection failed: %v (continuing without Redis)", err)
		return
	}
	log.Println("Redis connected")
}

func CloseRedis() {
	if RDB != nil {
		RDB.Close()
	}
}
