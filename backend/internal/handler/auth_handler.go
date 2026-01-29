package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"hyperpay-backend/internal/config"
	"hyperpay-backend/internal/dto"
	appErrors "hyperpay-backend/internal/errors"
	"hyperpay-backend/internal/models"
	"hyperpay-backend/internal/pkg/jwt"
	"hyperpay-backend/internal/pkg/password"
	"hyperpay-backend/internal/response"
)

type AuthHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewAuthHandler(db *gorm.DB, cfg *config.Config) *AuthHandler {
	return &AuthHandler{db: db, cfg: cfg}
}

// POST /api/v1/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, appErrors.ErrCodeInvalidRequest)
		return
	}

	var existing models.User
	if err := h.db.Where("email = ?", req.Email).First(&existing).Error; err == nil {
		response.Fail(c, http.StatusConflict, appErrors.ErrCodeConflict)
		return
	}

	hash, err := password.Hash(req.Password)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	user := models.User{
		Email:    req.Email,
		Password: hash,
		FullName: req.FullName,
	}

	if err := h.db.Create(&user).Error; err != nil {
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	type RegisterResponse struct {
		ID       uint   `json:"id"`
		Email    string `json:"email"`
		FullName string `json:"full_name"`
	}

	data := RegisterResponse{
		ID:       user.ID,
		Email:    user.Email,
		FullName: user.FullName,
	}

	response.Success(c, appErrors.ErrCodeSuccess, data)
}

// POST /api/v1/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, appErrors.ErrCodeInvalidRequest)
		return
	}

	var user models.User
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		response.Fail(c, http.StatusUnauthorized, appErrors.ErrCodeUnauthorized)
		return
	}

	if err := password.Compare(user.Password, req.Password); err != nil {
		response.Fail(c, http.StatusUnauthorized, appErrors.ErrCodeUnauthorized)
		return
	}

	token, err := jwt.GenerateToken(h.cfg.JWTSecret, user.ID, 24*time.Hour)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	type LoginResponse struct {
		Token string `json:"token"`
	}

	data := LoginResponse{Token: token}
	response.Success(c, appErrors.ErrCodeSuccess, data)
}

// POST /api/v1/auth/forgot-password
// Ở mức skeleton, handler này chỉ trả về 200 OK (chưa gửi email thật).
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req dto.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, appErrors.ErrCodeInvalidRequest)
		return
	}

	// TODO: lưu token reset mật khẩu, gửi email thực tế.
	response.Success(c, appErrors.ErrCodeSuccess, nil)
}
