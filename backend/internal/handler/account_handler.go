package handler

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"hyperpay-backend/internal/dto"
	appErrors "hyperpay-backend/internal/errors"
	"hyperpay-backend/internal/models"
	"hyperpay-backend/internal/response"
)

type AccountHandler struct {
	db *gorm.DB
}

func NewAccountHandler(db *gorm.DB) *AccountHandler {
	return &AccountHandler{db: db}
}

// POST /api/v1/accounts
// Lưu ý: ở mức skeleton, userID được mock (1), sau này sẽ lấy từ JWT.
func (h *AccountHandler) CreateBankAccount(c *gin.Context) {
	var req dto.BankAccountCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, appErrors.ErrCodeInvalidRequest)
		return
	}

	// TODO: lấy userID thật từ middleware auth (JWT).
	userID := uint(1)

	// TODO: kiểm tra quota UserPlan trước khi cho phép tạo tài khoản.

	apiToken, err := generateAPIToken()
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	suffix := ""
	if len(apiToken) > 8 {
		suffix = apiToken[len(apiToken)-8:]
	}

	account := models.BankAccount{
		UserID:         userID,
		BankName:       req.BankName,
		AccountNumber:  req.AccountNumber,
		AccountHolder:  req.AccountHolder,
		APIToken:       apiToken,
		APITokenSuffix: suffix,
	}

	if err := h.db.Create(&account).Error; err != nil {
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	respData := dto.BankAccountResponse{
		ID:             account.ID,
		BankName:       account.BankName,
		AccountNumber:  account.AccountNumber,
		AccountHolder:  account.AccountHolder,
		APITokenSuffix: account.APITokenSuffix,
	}

	// Trả về cả thông tin tài khoản và token full (chỉ hiển thị 1 lần).
	response.Success(c, appErrors.ErrCodeSuccess, struct {
		Account dto.BankAccountResponse `json:"account"`
		Token   string                  `json:"token"`
	}{
		Account: respData,
		Token:   apiToken,
	})
}

// GET /api/v1/accounts
func (h *AccountHandler) ListBankAccounts(c *gin.Context) {
	// TODO: lấy userID thật từ JWT.
	userID := uint(1)

	var accounts []models.BankAccount
	if err := h.db.Where("user_id = ?", userID).Find(&accounts).Error; err != nil {
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	respList := make([]dto.BankAccountResponse, 0, len(accounts))
	for _, a := range accounts {
		respList = append(respList, dto.BankAccountResponse{
			ID:             a.ID,
			BankName:       a.BankName,
			AccountNumber:  a.AccountNumber,
			AccountHolder:  a.AccountHolder,
			APITokenSuffix: a.APITokenSuffix,
		})
	}

	response.Success(c, appErrors.ErrCodeSuccess, respList)
}

// generateAPIToken tạo token random hex.
func generateAPIToken() (string, error) {
	b := make([]byte, 32) // 256-bit
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// POST /api/v1/accounts/:accountID/token/refresh
func (h *AccountHandler) RefreshToken(c *gin.Context) {
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

	newToken, err := generateAPIToken()
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	suffix := ""
	if len(newToken) > 8 {
		suffix = newToken[len(newToken)-8:]
	}

	account.APIToken = newToken
	account.APITokenSuffix = suffix

	if err := h.db.Save(&account).Error; err != nil {
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	// Trả token mới (chỉ hiển thị 1 lần).
	response.Success(c, appErrors.ErrCodeSuccess, dto.AccountTokenResponse{
		Token: newToken,
	})
}
