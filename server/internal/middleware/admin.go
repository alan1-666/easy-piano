package middleware

import (
	"net/http"

	"github.com/alan1-666/easy-piano/server/internal/model"
	"github.com/alan1-666/easy-piano/server/pkg/response"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AdminMiddleware runs after AuthMiddleware and short-circuits any
// caller whose users.is_admin is not true. Adds one SELECT per admin
// request — fine for the low-traffic admin surface.
func AdminMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		uidRaw, ok := c.Get("userID")
		if !ok {
			c.JSON(http.StatusUnauthorized, response.Error(401, "auth required"))
			c.Abort()
			return
		}
		uid, _ := uidRaw.(uint)

		var user model.User
		if err := db.Select("id", "is_admin").First(&user, uid).Error; err != nil {
			c.JSON(http.StatusUnauthorized, response.Error(401, "user not found"))
			c.Abort()
			return
		}
		if !user.IsAdmin {
			c.JSON(http.StatusForbidden, response.Error(403, "admin only"))
			c.Abort()
			return
		}
		c.Next()
	}
}
