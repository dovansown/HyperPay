package webhook

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"hyperpay-backend/internal/dto"
	"hyperpay-backend/internal/models"
)

// SendTransactionWebhook gửi giao dịch tới webhook của user (nếu có).
// Lưu ý: đây là skeleton, chưa xử lý retry/timeout phức tạp.
func SendTransactionWebhook(wh *models.UserWebhook, tx *models.BankTransaction) {
	if wh == nil || !wh.IsActive {
		return
	}

	payload := dto.BankTransactionResponse{
		ID:          tx.ID,
		Amount:      tx.Amount,
		Type:        tx.Type,
		Description: tx.Description,
		Balance:     tx.Balance,
		OccurredAt:  tx.OccurredAt,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		log.Printf("failed to marshal webhook payload: %v", err)
		return
	}

	req, err := http.NewRequest(http.MethodPost, wh.URL, bytes.NewReader(body))
	if err != nil {
		log.Printf("failed to create webhook request: %v", err)
		return
	}

	// Gửi token do user cấu hình để họ xác thực.
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-HyperPay-Token", wh.SecretToken)

	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("failed to send webhook request: %v", err)
		return
	}
	_ = resp.Body.Close()
}
