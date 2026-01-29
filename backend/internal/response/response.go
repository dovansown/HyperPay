package response

import (
	appErrors "hyperpay-backend/internal/errors"

	"github.com/gin-gonic/gin"
)

// APIResponse chuẩn chung cho mọi response.
type APIResponse struct {
	Success bool                `json:"success"`
	Code    appErrors.ErrorCode `json:"code"`
	Message string              `json:"message"`
	Data    interface{}         `json:"data,omitempty"`
}

// Success trả về response thành công với HTTP 200.
func Success(c *gin.Context, code appErrors.ErrorCode, data interface{}) {
	c.JSON(200, APIResponse{
		Success: true,
		Code:    code,
		Message: appErrors.GetMessage(code),
		Data:    data,
	})
}

// Fail trả về response lỗi với httpStatus tùy ý.
func Fail(c *gin.Context, httpStatus int, code appErrors.ErrorCode) {
	c.JSON(httpStatus, APIResponse{
		Success: false,
		Code:    code,
		Message: appErrors.GetMessage(code),
	})
}
