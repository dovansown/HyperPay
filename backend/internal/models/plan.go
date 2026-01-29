package models

import (
	"time"

	"gorm.io/gorm"
)

// Plan là gói dịch vụ (pricing plan).
type Plan struct {
	ID              uint   `gorm:"primaryKey"`
	Name            string `gorm:"size:255;not null;uniqueIndex"`
	PriceVND        int64  `gorm:"not null"` // giá theo VND, số nguyên
	MaxBankAccounts int    `gorm:"not null"` // tối đa số tài khoản ngân hàng cho 1 lần mua
	MaxTransactions int    `gorm:"not null"` // tối đa số giao dịch cho 1 lần mua
	DurationDays    int    `gorm:"not null"` // thời lượng gói (ngày)
	Description     string `gorm:"size:512"`
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       gorm.DeletedAt `gorm:"index"`

	PlanBanks []PlanBank `gorm:"foreignKey:PlanID"`
	UserPlans []UserPlan `gorm:"foreignKey:PlanID"`
}

// PlanBank là bảng join nhiều-nhiều giữa Plan và Bank.
type PlanBank struct {
	ID        uint `gorm:"primaryKey"`
	PlanID    uint `gorm:"index;not null"`
	BankID    uint `gorm:"index;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

// UserPlan là subscription: mỗi lần user mua 1 gói.
type UserPlan struct {
	ID               uint      `gorm:"primaryKey"`
	UserID           uint      `gorm:"index;not null"`
	PlanID           uint      `gorm:"index;not null"`
	StartAt          time.Time `gorm:"not null"`
	EndAt            time.Time `gorm:"not null"`
	UsedBankAccounts int       `gorm:"not null;default:0"`
	UsedTransactions int       `gorm:"not null;default:0"`
	Status           string    `gorm:"size:20;not null;default:'active'"` // active, expired, cancelled
	CreatedAt        time.Time
	UpdatedAt        time.Time
	DeletedAt        gorm.DeletedAt `gorm:"index"`
}
