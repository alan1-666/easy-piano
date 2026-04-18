package handler

import (
	"net/http"

	"github.com/alan1-666/easy-piano/server/internal/service"
	"github.com/alan1-666/easy-piano/server/pkg/response"
	"github.com/gin-gonic/gin"
)

type SubscriptionHandler struct {
	service service.SubscriptionService
}

func NewSubscriptionHandler(svc service.SubscriptionService) *SubscriptionHandler {
	return &SubscriptionHandler{service: svc}
}

func (h *SubscriptionHandler) GetStatus(c *gin.Context) {
	userID := getUserID(c)
	sub, err := h.service.GetStatus(userID)
	if err != nil {
		c.JSON(http.StatusOK, response.Success(map[string]interface{}{
			"has_subscription": false,
		}))
		return
	}
	c.JSON(http.StatusOK, response.Success(map[string]interface{}{
		"has_subscription": true,
		"subscription":     sub,
	}))
}

func (h *SubscriptionHandler) VerifyReceipt(c *gin.Context) {
	userID := getUserID(c)
	var req struct {
		ReceiptData string `json:"receipt_data" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "receipt_data is required"))
		return
	}

	sub, err := h.service.VerifyReceipt(userID, req.ReceiptData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to verify receipt"))
		return
	}
	c.JSON(http.StatusOK, response.Success(sub))
}

func (h *SubscriptionHandler) GetPurchasedSongs(c *gin.Context) {
	userID := getUserID(c)
	purchases, err := h.service.GetPurchasedSongs(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to get purchased songs"))
		return
	}
	c.JSON(http.StatusOK, response.Success(purchases))
}

func (h *SubscriptionHandler) PurchaseSong(c *gin.Context) {
	userID := getUserID(c)
	var req struct {
		SongID      uint   `json:"song_id" binding:"required"`
		ReceiptData string `json:"receipt_data" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "song_id and receipt_data are required"))
		return
	}

	purchase, err := h.service.PurchaseSong(userID, req.SongID, req.ReceiptData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to purchase song"))
		return
	}
	c.JSON(http.StatusOK, response.Success(purchase))
}
