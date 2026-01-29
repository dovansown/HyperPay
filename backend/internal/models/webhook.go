package models

import (
	"time"

	"gorm.io/gorm"
)

// UserWebhook lưu cấu hình webhook cho từng user.
type UserWebhook struct {
	ID          uint   `gorm:"primaryKey"`
	UserID      uint   `gorm:"index;not null"`
	URL         string `gorm:"size:512;not null"`
	SecretToken string `gorm:"size:255"` // TODO: nên mã hoá/ hash secret token
	IsActive    bool   `gorm:"not null;default:true"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}
