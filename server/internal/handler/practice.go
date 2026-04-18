package handler

import (
	"net/http"
	"strconv"

	"github.com/alan1-666/easy-piano/server/internal/model"
	"github.com/alan1-666/easy-piano/server/internal/service"
	"github.com/alan1-666/easy-piano/server/pkg/response"
	"github.com/gin-gonic/gin"
)

type PracticeHandler struct {
	practiceService    service.PracticeService
	achievementService service.AchievementService
}

func NewPracticeHandler(practiceSvc service.PracticeService, achievementSvc service.AchievementService) *PracticeHandler {
	return &PracticeHandler{
		practiceService:    practiceSvc,
		achievementService: achievementSvc,
	}
}

func (h *PracticeHandler) SubmitLog(c *gin.Context) {
	userID := getUserID(c)
	var log model.PracticeLog
	if err := c.ShouldBindJSON(&log); err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid request body"))
		return
	}

	result, err := h.practiceService.SubmitLog(userID, &log)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to submit practice log"))
		return
	}

	// Check for new achievements
	newAchievements, _ := h.achievementService.CheckAndUnlock(userID)

	c.JSON(http.StatusCreated, response.Success(map[string]interface{}{
		"log":              result,
		"new_achievements": newAchievements,
	}))
}

func (h *PracticeHandler) SyncLogs(c *gin.Context) {
	userID := getUserID(c)
	var logs []model.PracticeLog
	if err := c.ShouldBindJSON(&logs); err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid request body"))
		return
	}

	if err := h.practiceService.SyncLogs(userID, logs); err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to sync practice logs"))
		return
	}
	c.JSON(http.StatusOK, response.Success(map[string]interface{}{
		"synced": len(logs),
	}))
}

func (h *PracticeHandler) GetHistory(c *gin.Context) {
	userID := getUserID(c)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	logs, total, err := h.practiceService.GetHistory(userID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to get practice history"))
		return
	}
	c.JSON(http.StatusOK, response.Paginated(logs, total, page, pageSize))
}

func (h *PracticeHandler) GetStreak(c *gin.Context) {
	userID := getUserID(c)
	streak, err := h.practiceService.GetStreak(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to get streak"))
		return
	}
	c.JSON(http.StatusOK, response.Success(map[string]interface{}{
		"streak": streak,
	}))
}
