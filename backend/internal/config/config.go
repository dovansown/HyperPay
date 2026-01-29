package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config giữ toàn bộ cấu hình cần thiết cho app.
type Config struct {
	HTTPPort string

	PostgresHost     string
	PostgresPort     string
	PostgresUser     string
	PostgresPassword string
	PostgresDB       string
	PostgresSSLMode  string

	JWTSecret string
}

// Load đọc config từ .env và biến môi trường.
func Load() (*Config, error) {
	// Không fail nếu không có .env, chỉ log cho dev.
	_ = godotenv.Load()

	cfg := &Config{
		HTTPPort:         getEnv("HTTP_PORT", "8080"),
		PostgresHost:     getEnv("POSTGRES_HOST", "localhost"),
		PostgresPort:     getEnv("POSTGRES_PORT", "5432"),
		PostgresUser:     getEnv("POSTGRES_USER", "postgres"),
		PostgresPassword: getEnv("POSTGRES_PASSWORD", "postgres"),
		PostgresDB:       getEnv("POSTGRES_DB", "hyperpay"),
		PostgresSSLMode:  getEnv("POSTGRES_SSLMODE", "disable"),
		JWTSecret:        getEnv("JWT_SECRET", "change-me-secret"),
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func MustLoad() *Config {
	cfg, err := Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}
	return cfg
}
