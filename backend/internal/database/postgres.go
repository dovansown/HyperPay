package database

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"hyperpay-backend/internal/config"
	"hyperpay-backend/internal/models"
)

// NewPostgresDB khởi tạo kết nối Postgres bằng GORM.
func NewPostgresDB(cfg *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.PostgresHost,
		cfg.PostgresPort,
		cfg.PostgresUser,
		cfg.PostgresPassword,
		cfg.PostgresDB,
		cfg.PostgresSSLMode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto-migration cho các model cơ bản
	if err := db.AutoMigrate(
		&models.User{},
		&models.BankAccount{},
		&models.Bank{},
		&models.Plan{},
		&models.PlanBank{},
		&models.UserPlan{},
		&models.BankTransaction{},
		&models.UserWebhook{},
	); err != nil {
		log.Printf("auto migrate error: %v", err)
		return nil, err
	}

	return db, nil
}
