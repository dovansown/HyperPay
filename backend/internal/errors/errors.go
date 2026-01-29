package errors

// ErrorCode là kiểu string cho mã lỗi/ thành công.
type ErrorCode string

type ErrorInfo struct {
	Code    ErrorCode
	Message string
}

const (
	// Common
	ErrCodeSuccess        ErrorCode = "0000"
	ErrCodeInternalServer ErrorCode = "1000"
	ErrCodeInvalidRequest ErrorCode = "1001"
	ErrCodeUnauthorized   ErrorCode = "1002"
	ErrCodeNotFound       ErrorCode = "1003"
	ErrCodeConflict       ErrorCode = "1004"
)

var errorMessages = map[ErrorCode]string{
	ErrCodeSuccess:        "Success",
	ErrCodeInternalServer: "Internal server error",
	ErrCodeInvalidRequest: "Invalid request",
	ErrCodeUnauthorized:   "Unauthorized",
	ErrCodeNotFound:       "Not found",
	ErrCodeConflict:       "Conflict",
}

// GetMessage trả về message tương ứng với ErrorCode.
func GetMessage(code ErrorCode) string {
	if msg, ok := errorMessages[code]; ok {
		return msg
	}
	return "Unknown error"
}
