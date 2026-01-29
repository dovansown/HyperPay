package models

import (
	"time"

	"gorm.io/gorm"
)

// User là tài khoản ứng dụng (đăng nhập).
type User struct {
	ID        uint   `gorm:"primaryKey"`
	Email     string `gorm:"uniqueIndex;size:255;not null"`
	Password  string `gorm:"size:255;not null"` // đã hash
	FullName  string `gorm:"size:255"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}
