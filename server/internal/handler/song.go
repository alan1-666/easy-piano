package handler

import (
	"net/http"
	"strconv"

	"github.com/alan1-666/easy-piano/server/internal/service"
	"github.com/alan1-666/easy-piano/server/pkg/response"
	"github.com/gin-gonic/gin"
)

type SongHandler struct {
	service service.SongService
}

func NewSongHandler(svc service.SongService) *SongHandler {
	return &SongHandler{service: svc}
}

func (h *SongHandler) GetSongs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	query := c.Query("q")

	var difficulty *int
	if d := c.Query("difficulty"); d != "" {
		if val, err := strconv.Atoi(d); err == nil {
			difficulty = &val
		}
	}

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	songs, total, err := h.service.GetSongs(page, pageSize, difficulty, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to get songs"))
		return
	}
	c.JSON(http.StatusOK, response.Paginated(songs, total, page, pageSize))
}

func (h *SongHandler) GetSong(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid song id"))
		return
	}

	song, err := h.service.GetSong(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, response.Error(404, "song not found"))
		return
	}
	c.JSON(http.StatusOK, response.Success(song))
}
