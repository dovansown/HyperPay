package dto

import "time"

// BankTransactionResponse DTO trả về giao dịch ngân hàng.
type BankTransactionResponse struct {
	ID          uint      `json:"id"`
	Amount      int64     `json:"amount"`
	Type        string    `json:"type"`
	Description string    `json:"description,omitempty"`
	Balance     int64     `json:"balance,omitempty"`
	OccurredAt  time.Time `json:"occurred_at"`
}
