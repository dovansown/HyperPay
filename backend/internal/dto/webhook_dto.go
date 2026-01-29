package dto

// WebhookUpsertRequest DTO tạo/cập nhật webhook.
type WebhookUpsertRequest struct {
	URL         string `json:"url" binding:"required,url"`
	SecretToken string `json:"secret_token" binding:"required"`
	IsActive    *bool  `json:"is_active,omitempty"`
}

// WebhookResponse DTO trả về cấu hình webhook (không trả secret).
type WebhookResponse struct {
	URL      string `json:"url"`
	IsActive bool   `json:"is_active"`
}
