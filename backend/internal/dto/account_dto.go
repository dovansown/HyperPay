package dto

// BankAccountCreateRequest DTO tạo tài khoản ngân hàng.
type BankAccountCreateRequest struct {
	BankName      string `json:"bank_name" binding:"required"`
	AccountNumber string `json:"account_number" binding:"required"`
	AccountHolder string `json:"account_holder" binding:"required"`
}

// BankAccountResponse DTO trả về tài khoản ngân hàng.
type BankAccountResponse struct {
	ID             uint   `json:"id"`
	BankName       string `json:"bank_name"`
	AccountNumber  string `json:"account_number"`
	AccountHolder  string `json:"account_holder"`
	APITokenSuffix string `json:"api_token_suffix,omitempty"` // chỉ hiển thị suffix để tránh lộ full token
}

// AccountTokenResponse DTO trả về full token (khi tạo/refresh).
type AccountTokenResponse struct {
	Token string `json:"token"`
}
