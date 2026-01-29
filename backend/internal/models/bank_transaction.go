package models

import (
	"time"

	"gorm.io/gorm"
)

// BankTransaction là lịch sử giao dịch cho từng tài khoản ngân hàng.
type BankTransaction struct {
	ID            uint      `gorm:"primaryKey"`
	BankAccountID uint      `gorm:"index;not null"`
	ExternalID    string    `gorm:"size:100"`         // ID giao dịch phía ngân hàng (nếu có)
	Amount        int64     `gorm:"not null"`         // số tiền, đơn vị VND
	Type          string    `gorm:"size:20;not null"` // credit/debit
	Description   string    `gorm:"size:512"`         // nội dung giao dịch
	Balance       int64     `gorm:""`                 // số dư sau giao dịch (nếu có)
	OccurredAt    time.Time `gorm:"not null"`         // thời điểm phát sinh giao dịch
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeletedAt     gorm.DeletedAt `gorm:"index"`
}
