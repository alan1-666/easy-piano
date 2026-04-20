package handler

import (
	"net/http"

	"github.com/alan1-666/easy-piano/server/internal/model"
	"github.com/alan1-666/easy-piano/server/internal/service"
	"github.com/alan1-666/easy-piano/server/pkg/response"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	service            service.UserService
	courseService      service.CourseService
	achievementService service.AchievementService
}

func NewUserHandler(
	svc service.UserService,
	courseSvc service.CourseService,
	achievementSvc service.AchievementService,
) *UserHandler {
	return &UserHandler{
		service:            svc,
		courseService:      courseSvc,
		achievementService: achievementSvc,
	}
}

func getUserID(c *gin.Context) uint {
	return c.MustGet("userID").(uint)
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID := getUserID(c)
	user, err := h.service.GetProfile(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, response.Error(404, "user not found"))
		return
	}
	// Strip sensitive fields
	user.PasswordHash = ""
	c.JSON(http.StatusOK, response.Success(user))
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID := getUserID(c)
	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid request body"))
		return
	}
	if err := h.service.UpdateProfile(userID, updates); err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to update profile"))
		return
	}
	c.JSON(http.StatusOK, response.Success(nil))
}

func (h *UserHandler) GetStats(c *gin.Context) {
	userID := getUserID(c)
	stats, err := h.service.GetStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to get stats"))
		return
	}
	c.JSON(http.StatusOK, response.Success(stats))
}

func (h *UserHandler) GetSettings(c *gin.Context) {
	userID := getUserID(c)
	settings, err := h.service.GetSettings(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to get settings"))
		return
	}
	c.JSON(http.StatusOK, response.Success(settings))
}

func (h *UserHandler) UpdateSettings(c *gin.Context) {
	userID := getUserID(c)
	var req struct {
		FallSpeed      *float64 `json:"fall_speed"`
		LeftHandColor  *string  `json:"left_hand_color"`
		RightHandColor *string  `json:"right_hand_color"`
		SoundFont      *string  `json:"sound_font"`
		MetronomeOn    *bool    `json:"metronome_on"`
		DailyGoalMin   *int     `json:"daily_goal_min"`
		Locale         *string  `json:"locale"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid request body"))
		return
	}

	settings, err := h.service.GetSettings(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to get settings"))
		return
	}

	if req.FallSpeed != nil {
		settings.FallSpeed = *req.FallSpeed
	}
	if req.LeftHandColor != nil {
		settings.LeftHandColor = *req.LeftHandColor
	}
	if req.RightHandColor != nil {
		settings.RightHandColor = *req.RightHandColor
	}
	if req.SoundFont != nil {
		settings.SoundFont = *req.SoundFont
	}
	if req.MetronomeOn != nil {
		settings.MetronomeOn = *req.MetronomeOn
	}
	if req.DailyGoalMin != nil {
		settings.DailyGoalMin = *req.DailyGoalMin
	}
	if req.Locale != nil {
		settings.Locale = *req.Locale
	}

	if err := h.service.UpdateSettings(userID, settings); err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to update settings"))
		return
	}
	c.JSON(http.StatusOK, response.Success(settings))
}

func (h *UserHandler) GetChildren(c *gin.Context) {
	userID := getUserID(c)
	children, err := h.service.GetChildren(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to get children"))
		return
	}
	// Strip password hashes
	for i := range children {
		children[i].PasswordHash = ""
	}
	c.JSON(http.StatusOK, response.Success(children))
}

func (h *UserHandler) CreateChild(c *gin.Context) {
	userID := getUserID(c)
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "username and password are required"))
		return
	}
	child, err := h.service.CreateChild(userID, req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to create child account"))
		return
	}
	child.PasswordHash = ""
	c.JSON(http.StatusCreated, response.Success(child))
}

// GetProgress returns every UserProgress row owned by the caller —
// the courses screen needs this to colour lessons done / current / locked.
func (h *UserHandler) GetProgress(c *gin.Context) {
	userID := getUserID(c)
	rows, err := h.courseService.GetUserProgress(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to get progress"))
		return
	}
	if rows == nil {
		rows = []model.UserProgress{}
	}
	c.JSON(http.StatusOK, response.Success(rows))
}

// GetAchievements returns the full achievement catalog plus the caller's
// unlocked records, so the client can render lock state without a second
// round-trip.
func (h *UserHandler) GetAchievements(c *gin.Context) {
	userID := getUserID(c)
	all, unlocked, err := h.achievementService.GetAchievements(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to get achievements"))
		return
	}
	if all == nil {
		all = []model.Achievement{}
	}
	if unlocked == nil {
		unlocked = []model.UserAchievement{}
	}
	c.JSON(http.StatusOK, response.Success(map[string]interface{}{
		"achievements": all,
		"unlocked":     unlocked,
	}))
}
