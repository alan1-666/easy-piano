package middleware

import (
	"net/http"

	"github.com/alan1-666/easy-piano/server/internal/model"
	"github.com/alan1-666/easy-piano/server/pkg/response"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SubscriptionMiddleware checks if the user has an active subscription.
// It sets "hasSubscription" in the context but does not block requests.
func SubscriptionMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, response.Error(401, "unauthorized"))
			c.Abort()
			return
		}

		// Check for active subscription
		var sub model.Subscription
		err := db.Where("user_id = ? AND status = 'active'", userID).First(&sub).Error
		if err == nil {
			c.Set("hasSubscription", true)
			c.Next()
			return
		}

		// No active subscription — still allow, but mark it
		c.Set("hasSubscription", false)
		c.Next()
	}
}
