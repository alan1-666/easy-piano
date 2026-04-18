package handler

import (
	"net/http"
	"strconv"

	"github.com/alan1-666/easy-piano/server/internal/service"
	"github.com/alan1-666/easy-piano/server/pkg/response"
	"github.com/gin-gonic/gin"
)

type LeaderboardHandler struct {
	service service.LeaderboardService
}

func NewLeaderboardHandler(svc service.LeaderboardService) *LeaderboardHandler {
	return &LeaderboardHandler{service: svc}
}

func (h *LeaderboardHandler) GetSongLeaderboard(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid song id"))
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	entries, err := h.service.GetSongLeaderboard(uint(id), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to get leaderboard"))
		return
	}
	c.JSON(http.StatusOK, response.Success(entries))
}

func (h *LeaderboardHandler) GetWeeklyLeaderboard(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	entries, err := h.service.GetWeeklyLeaderboard(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to get weekly leaderboard"))
		return
	}
	c.JSON(http.StatusOK, response.Success(entries))
}
