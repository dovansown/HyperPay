package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"hyperpay-backend/internal/dto"
	appErrors "hyperpay-backend/internal/errors"
	"hyperpay-backend/internal/models"
	"hyperpay-backend/internal/response"
)

type WebhookHandler struct {
	db *gorm.DB
}

func NewWebhookHandler(db *gorm.DB) *WebhookHandler {
	return &WebhookHandler{db: db}
}

// GET /api/v1/webhook
func (h *WebhookHandler) GetWebhook(c *gin.Context) {
	// TODO: lấy userID thật từ JWT middleware
	userID := uint(1)

	var wh models.UserWebhook
	if err := h.db.Where("user_id = ? AND is_active = ?", userID, true).First(&wh).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Không có webhook nào được cấu hình
			response.Success(c, appErrors.ErrCodeSuccess, nil)
			return
		}
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	resp := dto.WebhookResponse{
		URL:      wh.URL,
		IsActive: wh.IsActive,
	}

	response.Success(c, appErrors.ErrCodeSuccess, resp)
}

// POST /api/v1/webhook
func (h *WebhookHandler) UpsertWebhook(c *gin.Context) {
	var req dto.WebhookUpsertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, appErrors.ErrCodeInvalidRequest)
		return
	}

	// TODO: lấy userID thật từ JWT middleware
	userID := uint(1)

	var wh models.UserWebhook
	err := h.db.Where("user_id = ?", userID).First(&wh).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	if err == gorm.ErrRecordNotFound {
		wh = models.UserWebhook{
			UserID:      userID,
			URL:         req.URL,
			SecretToken: req.SecretToken,
			IsActive:    isActive,
		}
		if err := h.db.Create(&wh).Error; err != nil {
			response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
			return
		}
	} else {
		wh.URL = req.URL
		wh.SecretToken = req.SecretToken
		wh.IsActive = isActive
		if err := h.db.Save(&wh).Error; err != nil {
			response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
			return
		}
	}

	resp := dto.WebhookResponse{
		URL:      wh.URL,
		IsActive: wh.IsActive,
	}

	response.Success(c, appErrors.ErrCodeSuccess, resp)
}
