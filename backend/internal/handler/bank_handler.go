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

type BankHandler struct {
	db *gorm.DB
}

func NewBankHandler(db *gorm.DB) *BankHandler {
	return &BankHandler{db: db}
}

// POST /api/v1/banks
func (h *BankHandler) CreateBank(c *gin.Context) {
	var req dto.BankCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, appErrors.ErrCodeInvalidRequest)
		return
	}

	// Kiểm tra trùng code
	var existing models.Bank
	if err := h.db.Where("code = ?", req.Code).First(&existing).Error; err == nil {
		response.Fail(c, http.StatusConflict, appErrors.ErrCodeConflict)
		return
	}

	bank := models.Bank{
		Name:    req.Name,
		Code:    req.Code,
		IconURL: req.IconURL,
	}

	if err := h.db.Create(&bank).Error; err != nil {
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	resp := dto.BankResponse{
		ID:      bank.ID,
		Name:    bank.Name,
		Code:    bank.Code,
		IconURL: bank.IconURL,
	}

	response.Success(c, appErrors.ErrCodeSuccess, resp)
}

// GET /api/v1/banks
func (h *BankHandler) ListBanks(c *gin.Context) {
	var banks []models.Bank
	if err := h.db.Find(&banks).Error; err != nil {
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	resp := make([]dto.BankResponse, 0, len(banks))
	for _, b := range banks {
		resp = append(resp, dto.BankResponse{
			ID:      b.ID,
			Name:    b.Name,
			Code:    b.Code,
			IconURL: b.IconURL,
		})
	}

	response.Success(c, appErrors.ErrCodeSuccess, resp)
}
