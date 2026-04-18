package handler

import (
	"net/http"
	"strconv"

	"github.com/alan1-666/easy-piano/server/internal/service"
	"github.com/alan1-666/easy-piano/server/pkg/response"
	"github.com/gin-gonic/gin"
)

type LessonHandler struct {
	courseService service.CourseService
	songService  service.SongService
}

func NewLessonHandler(courseSvc service.CourseService, songSvc service.SongService) *LessonHandler {
	return &LessonHandler{courseService: courseSvc, songService: songSvc}
}

func (h *LessonHandler) GetLesson(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid lesson id"))
		return
	}

	lesson, err := h.courseService.GetLesson(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, response.Error(404, "lesson not found"))
		return
	}

	result := map[string]interface{}{
		"lesson": lesson,
	}

	// If lesson has a song, include song data
	if lesson.SongID != nil {
		song, err := h.songService.GetSong(*lesson.SongID)
		if err == nil {
			result["song"] = song
		}
	}

	c.JSON(http.StatusOK, response.Success(result))
}

func (h *LessonHandler) CompleteLesson(c *gin.Context) {
	userID := getUserID(c)
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid lesson id"))
		return
	}

	var req struct {
		Score int `json:"score" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "score is required"))
		return
	}

	progress, err := h.courseService.CompleteLesson(userID, uint(id), req.Score)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to complete lesson"))
		return
	}

	c.JSON(http.StatusOK, response.Success(map[string]interface{}{
		"progress": progress,
		"xp":       progress.Stars * 100,
	}))
}
