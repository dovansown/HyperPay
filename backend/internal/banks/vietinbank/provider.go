package vietinbank

import (
	"context"

	"hyperpay-backend/internal/bankcore"
)

// Provider triển khai BankProvider cho Vietinbank dựa trên script example/vietinbank.js.
// Hiện tại chỉ là skeleton, chưa port đầy đủ HTTP/crypto.
type Provider struct{}

func NewProvider() *Provider {
	return &Provider{}
}

func (p *Provider) Code() string {
	return "VIETINBANK"
}

// Login: TODO - implement theo luồng trong example/vietinbank.js:
// - Chuẩn bị payload (clientInfo, browserInfo, requestId, ...)
// - Ký payload bằng MD5 (signPayload)
// - Mã hoá payload bằng RSA OAEP SHA1 + chunk (encryptPayload)
// - Gọi API /ipay/wa/signIn.
func (p *Provider) Login(ctx context.Context, in bankcore.LoginInput) (*bankcore.LoginOutput, error) {
	// TODO: implement thực sự (sử dụng net/http + crypto/rsa).
	return &bankcore.LoginOutput{
		Session: bankcore.Session{
			BankCode: p.Code(),
			Raw:      map[string]any{"TODO": "vietinbank-session"},
		},
		Meta: map[string]any{},
	}, nil
}

func (p *Provider) FetchTransactions(ctx context.Context, sess *bankcore.Session, in bankcore.FetchInput) ([]bankcore.RawTransaction, error) {
	// TODO: gọi API lấy lịch sử giao dịch Vietinbank với session hiện tại.
	return []bankcore.RawTransaction{}, nil
}

func (p *Provider) ParseTransactions(ctx context.Context, raws []bankcore.RawTransaction) ([]bankcore.NormalizedTransaction, error) {
	// TODO: map JSON trả về từ Vietinbank sang NormalizedTransaction.
	return []bankcore.NormalizedTransaction{}, nil
}
