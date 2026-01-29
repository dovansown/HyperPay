package dto

// PlanCreateRequest DTO tạo gói dịch vụ.
type PlanCreateRequest struct {
	Name            string  `json:"name" binding:"required"`
	PriceVND        int64   `json:"price_vnd" binding:"required,gte=0"`
	MaxBankAccounts int     `json:"max_bank_accounts" binding:"required,gte=1"`
	MaxTransactions int     `json:"max_transactions" binding:"required,gte=1"`
	DurationDays    int     `json:"duration_days" binding:"required,gte=1"`
	Description     *string `json:"description,omitempty"`
	BankIDs         []uint  `json:"bank_ids" binding:"omitempty,dive,gt=0"` // danh sách bank áp dụng cho gói
}

// PlanResponse DTO trả về thông tin gói.
type PlanResponse struct {
	ID              uint    `json:"id"`
	Name            string  `json:"name"`
	PriceVND        int64   `json:"price_vnd"`
	MaxBankAccounts int     `json:"max_bank_accounts"`
	MaxTransactions int     `json:"max_transactions"`
	DurationDays    int     `json:"duration_days"`
	Description     *string `json:"description,omitempty"`
	BankIDs         []uint  `json:"bank_ids"`
}
