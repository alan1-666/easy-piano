package router

import (
	"net/http"

	"github.com/alan1-666/easy-piano/server/internal/config"
	"github.com/alan1-666/easy-piano/server/internal/handler"
	"github.com/alan1-666/easy-piano/server/internal/middleware"
	"github.com/alan1-666/easy-piano/server/internal/service"
	"github.com/alan1-666/easy-piano/server/pkg/response"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, db *gorm.DB) {
	cfg := config.Load()
	r.Use(middleware.CORSMiddleware())

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, response.Success(map[string]string{"status": "ok"}))
	})

	authService := service.NewAuthService(db, cfg.JWT)
	authHandler := handler.NewAuthHandler(authService)

	userService := service.NewUserService(db)
	courseService := service.NewCourseService(db)
	songService := service.NewSongService(db)
	practiceService := service.NewPracticeService(db)
	achievementService := service.NewAchievementService(db)
	subscriptionService := service.NewSubscriptionService(db)
	leaderboardService := service.NewLeaderboardService(db)

	userHandler := handler.NewUserHandler(userService, courseService, achievementService)
	courseHandler := handler.NewCourseHandler(courseService)
	lessonHandler := handler.NewLessonHandler(courseService, songService)
	songHandler := handler.NewSongHandler(songService)
	practiceHandler := handler.NewPracticeHandler(practiceService, achievementService)
	subscriptionHandler := handler.NewSubscriptionHandler(subscriptionService)
	leaderboardHandler := handler.NewLeaderboardHandler(leaderboardService)

	v1 := r.Group("/v1")
	{
		// Auth routes (public)
		auth := v1.Group("/auth")
		{
			auth.POST("/register", middleware.RateLimitMiddleware(3), authHandler.Register)
			auth.POST("/login", middleware.RateLimitMiddleware(5), authHandler.Login)
			auth.POST("/refresh", authHandler.RefreshToken)
			auth.POST("/apple", authHandler.AppleLogin)
			auth.POST("/wechat", authHandler.WechatLogin)
		}

		// Protected routes
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware(cfg.JWT.Secret))
		{
			// User routes
			users := protected.Group("/users")
			{
				users.GET("/me", userHandler.GetProfile)
				users.PUT("/me", userHandler.UpdateProfile)
				users.GET("/me/stats", userHandler.GetStats)
				users.GET("/me/settings", userHandler.GetSettings)
				users.PUT("/me/settings", userHandler.UpdateSettings)
				users.GET("/me/children", userHandler.GetChildren)
				users.POST("/me/children", userHandler.CreateChild)
				users.GET("/me/progress", userHandler.GetProgress)
				users.GET("/me/achievements", userHandler.GetAchievements)
			}

			// Course routes
			courses := protected.Group("/courses")
			{
				courses.GET("", courseHandler.GetCourses)
				courses.GET("/:id/lessons", courseHandler.GetLessons)
			}

			// Lesson routes
			lessons := protected.Group("/lessons")
			{
				lessons.GET("/:id", lessonHandler.GetLesson)
				lessons.POST("/:id/complete", lessonHandler.CompleteLesson)
			}

			// Song routes
			songs := protected.Group("/songs")
			{
				songs.GET("", songHandler.GetSongs)
				songs.GET("/:id", songHandler.GetSong)
			}

			// Practice routes
			practice := protected.Group("/practice")
			{
				practice.POST("/log", middleware.RateLimitMiddleware(10), practiceHandler.SubmitLog)
				practice.POST("/sync", practiceHandler.SyncLogs)
				practice.GET("/history", practiceHandler.GetHistory)
				practice.GET("/streak", practiceHandler.GetStreak)
			}

			// Subscription routes
			subscription := protected.Group("/subscription")
			{
				subscription.GET("/status", subscriptionHandler.GetStatus)
				subscription.POST("/verify", subscriptionHandler.VerifyReceipt)
			}

			// Purchase routes
			purchases := protected.Group("/purchases")
			{
				purchases.GET("/songs", subscriptionHandler.GetPurchasedSongs)
				purchases.POST("/songs", subscriptionHandler.PurchaseSong)
			}

			// Leaderboard routes
			leaderboard := protected.Group("/leaderboard")
			{
				leaderboard.GET("/song/:id", leaderboardHandler.GetSongLeaderboard)
				leaderboard.GET("/weekly", leaderboardHandler.GetWeeklyLeaderboard)
			}
		}
	}
}
