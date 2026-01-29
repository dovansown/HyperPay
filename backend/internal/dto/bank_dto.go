package dto

// BankCreateRequest DTO tạo ngân hàng.
type BankCreateRequest struct {
	Name    string `json:"name" binding:"required"`
	Code    string `json:"code" binding:"required"`
	IconURL string `json:"icon_url" binding:"omitempty,url"`
}

// BankResponse DTO trả về ngân hàng.
type BankResponse struct {
	ID      uint   `json:"id"`
	Name    string `json:"name"`
	Code    string `json:"code"`
	IconURL string `json:"icon_url"`
}
