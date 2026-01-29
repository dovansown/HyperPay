package models

import (
	"time"

	"gorm.io/gorm"
)

// BankAccount là tài khoản ngân hàng của user để lấy lịch sử giao dịch.
type BankAccount struct {
	ID             uint   `gorm:"primaryKey"`
	UserID         uint   `gorm:"index;not null"`
	BankName       string `gorm:"size:255;not null"`
	AccountNumber  string `gorm:"size:50;not null"`
	AccountHolder  string `gorm:"size:255"`
	APIToken       string `gorm:"size:255"` // TODO: nên lưu dạng hash thay vì plain text
	APITokenSuffix string `gorm:"size:8"`   // vài ký tự cuối để show cho user
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      gorm.DeletedAt `gorm:"index"`
}
