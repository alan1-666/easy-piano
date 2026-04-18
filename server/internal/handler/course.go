package handler

import (
	"net/http"
	"strconv"

	"github.com/alan1-666/easy-piano/server/internal/service"
	"github.com/alan1-666/easy-piano/server/pkg/response"
	"github.com/gin-gonic/gin"
)

type CourseHandler struct {
	service service.CourseService
}

func NewCourseHandler(svc service.CourseService) *CourseHandler {
	return &CourseHandler{service: svc}
}

func (h *CourseHandler) GetCourses(c *gin.Context) {
	courses, err := h.service.GetCourses()
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to get courses"))
		return
	}
	c.JSON(http.StatusOK, response.Success(courses))
}

func (h *CourseHandler) GetLessons(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid course id"))
		return
	}
	lessons, err := h.service.GetLessons(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to get lessons"))
		return
	}
	c.JSON(http.StatusOK, response.Success(lessons))
}
