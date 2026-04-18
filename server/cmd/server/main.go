package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/alan1-666/easy-piano/server/internal/config"
	"github.com/alan1-666/easy-piano/server/internal/database"
	"github.com/alan1-666/easy-piano/server/internal/router"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	// Initialize database and Redis
	database.Init(cfg.Database)
	defer database.Close()

	database.InitRedis(cfg.Redis)
	defer database.CloseRedis()

	if cfg.Server.Mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	engine := gin.Default()
	router.RegisterRoutes(engine, database.DB)

	srv := &http.Server{
		Addr:    ":" + cfg.Server.Port,
		Handler: engine,
	}

	go func() {
		log.Printf("Server starting on port %s", cfg.Server.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}
