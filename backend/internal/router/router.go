package router

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"hyperpay-backend/internal/config"
	"hyperpay-backend/internal/handler"
)

// RegisterRoutes đăng ký toàn bộ route cho ứng dụng.
func RegisterRoutes(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	api := r.Group("/api/v1")

	authHandler := handler.NewAuthHandler(db, cfg)
	accountHandler := handler.NewAccountHandler(db)
	bankHandler := handler.NewBankHandler(db)
	planHandler := handler.NewPlanHandler(db)
	webhookHandler := handler.NewWebhookHandler(db)
	transactionHandler := handler.NewTransactionHandler(db)

	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/forgot-password", authHandler.ForgotPassword)
	}

	accounts := api.Group("/accounts")
	{
		accounts.POST("", accountHandler.CreateBankAccount)
		accounts.GET("", accountHandler.ListBankAccounts)
		accounts.POST("/:accountID/token/refresh", accountHandler.RefreshToken)
		accounts.GET("/:accountID/transactions", transactionHandler.ListByAccountID)
	}

	banks := api.Group("/banks")
	{
		banks.POST("", bankHandler.CreateBank)
		banks.GET("", bankHandler.ListBanks)
	}

	plans := api.Group("/plans")
	{
		plans.POST("", planHandler.CreatePlan)
		plans.GET("", planHandler.ListPlans)
	}

	webhook := api.Group("/webhook")
	{
		webhook.GET("", webhookHandler.GetWebhook)
		webhook.POST("", webhookHandler.UpsertWebhook)
	}

	external := r.Group("/api/v1/external")
	{
		external.GET("/accounts/:token/transactions", transactionHandler.ListByToken)
	}
}
