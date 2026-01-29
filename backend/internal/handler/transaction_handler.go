package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"hyperpay-backend/internal/dto"
	appErrors "hyperpay-backend/internal/errors"
	"hyperpay-backend/internal/models"
	"hyperpay-backend/internal/response"
)

type TransactionHandler struct {
	db *gorm.DB
}

func NewTransactionHandler(db *gorm.DB) *TransactionHandler {
	return &TransactionHandler{db: db}
}

// GET /api/v1/accounts/:accountID/transactions
// (JWT, hiện mock userID = 1)
func (h *TransactionHandler) ListByAccountID(c *gin.Context) {
	accountIDStr := c.Param("accountID")
	accountID, err := strconv.ParseUint(accountIDStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, appErrors.ErrCodeInvalidRequest)
		return
	}

	// TODO: lấy userID thật từ JWT middleware
	userID := uint(1)

	var account models.BankAccount
	if err := h.db.Where("id = ? AND user_id = ?", accountID, userID).First(&account).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			response.Fail(c, http.StatusNotFound, appErrors.ErrCodeNotFound)
			return
		}
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	var txs []models.BankTransaction
	if err := h.db.Where("bank_account_id = ?", account.ID).Order("occurred_at desc").Find(&txs).Error; err != nil {
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	resp := make([]dto.BankTransactionResponse, 0, len(txs))
	for _, t := range txs {
		resp = append(resp, dto.BankTransactionResponse{
			ID:          t.ID,
			Amount:      t.Amount,
			Type:        t.Type,
			Description: t.Description,
			Balance:     t.Balance,
			OccurredAt:  t.OccurredAt,
		})
	}

	response.Success(c, appErrors.ErrCodeSuccess, resp)
}

// GET /api/v1/external/accounts/:token/transactions
// (external API, xác thực bằng APIToken của BankAccount)
func (h *TransactionHandler) ListByToken(c *gin.Context) {
	token := c.Param("token")
	if token == "" {
		response.Fail(c, http.StatusUnauthorized, appErrors.ErrCodeUnauthorized)
		return
	}

	var account models.BankAccount
	if err := h.db.Where("api_token = ?", token).First(&account).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			response.Fail(c, http.StatusUnauthorized, appErrors.ErrCodeUnauthorized)
			return
		}
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	var txs []models.BankTransaction
	if err := h.db.Where("bank_account_id = ?", account.ID).Order("occurred_at desc").Find(&txs).Error; err != nil {
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	resp := make([]dto.BankTransactionResponse, 0, len(txs))
	for _, t := range txs {
		resp = append(resp, dto.BankTransactionResponse{
			ID:          t.ID,
			Amount:      t.Amount,
			Type:        t.Type,
			Description: t.Description,
			Balance:     t.Balance,
			OccurredAt:  t.OccurredAt,
		})
	}

	response.Success(c, appErrors.ErrCodeSuccess, resp)
}
