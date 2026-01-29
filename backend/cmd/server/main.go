package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"

	"hyperpay-backend/internal/bankcore/registry"
	"hyperpay-backend/internal/banks/bidv"
	"hyperpay-backend/internal/banks/vcb"
	"hyperpay-backend/internal/banks/vietinbank"
	"hyperpay-backend/internal/config"
	"hyperpay-backend/internal/database"
	"hyperpay-backend/internal/router"
)

func main() {
	// Load config (.env, biến môi trường, giá trị mặc định)
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("cannot load config: %v", err)
	}

	// Kết nối database
	db, err := database.NewPostgresDB(cfg)
	if err != nil {
		log.Fatalf("cannot connect database: %v", err)
	}

	// Đăng ký các bank provider (VCB, Vietinbank, BIDV).
	registry.Register(vcb.NewProvider())
	registry.Register(vietinbank.NewProvider())
	registry.Register(bidv.NewProvider())

	// Khởi tạo Gin engine
	r := gin.Default()

	// CORS cho frontend (Vite default: http://localhost:5173)
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin == "http://localhost:5174" || origin == "http://127.0.0.1:5173" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Vary", "Origin")
		}
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, Accept")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	// Đăng ký route
	router.RegisterRoutes(r, db, cfg)

	addr := ":" + cfg.HTTPPort
	if port := os.Getenv("PORT"); port != "" {
		addr = ":" + port
	}

	log.Printf("Server is running at %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("cannot start server: %v", err)
	}
}
