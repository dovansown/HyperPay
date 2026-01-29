package models

import (
	"time"

	"gorm.io/gorm"
)

// Bank là thông tin ngân hàng hệ thống hỗ trợ.
type Bank struct {
	ID        uint   `gorm:"primaryKey"`
	Name      string `gorm:"size:255;not null"`
	Code      string `gorm:"size:50;not null;uniqueIndex"` // mã bank duy nhất
	IconURL   string `gorm:"size:512"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`

	// Quan hệ ngược với PlanBank (nhiều-nhiều với Plan).
	PlanBanks []PlanBank `gorm:"foreignKey:BankID"`
}
