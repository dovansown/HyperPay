package bidv

import (
	"context"

	"hyperpay-backend/internal/bankcore"
)

// Provider triển khai BankProvider cho BIDV dựa trên example/bidv.js.
// Ở đây mới skeleton: chỉ định nghĩa khung method để sau này triển khai chi tiết.
type Provider struct{}

func NewProvider() *Provider {
	return &Provider{}
}

func (p *Provider) Code() string {
	return "BIDV"
}

func (p *Provider) Login(ctx context.Context, in bankcore.LoginInput) (*bankcore.LoginOutput, error) {
	// TODO: port logic từ example/bidv.js (login, crypto,...).
	return &bankcore.LoginOutput{
		Session: bankcore.Session{
			BankCode: p.Code(),
			Raw:      map[string]any{"TODO": "bidv-session"},
		},
		Meta: map[string]any{},
	}, nil
}

func (p *Provider) FetchTransactions(ctx context.Context, sess *bankcore.Session, in bankcore.FetchInput) ([]bankcore.RawTransaction, error) {
	// TODO: gọi API lấy giao dịch BIDV.
	return []bankcore.RawTransaction{}, nil
}

func (p *Provider) ParseTransactions(ctx context.Context, raws []bankcore.RawTransaction) ([]bankcore.NormalizedTransaction, error) {
	// TODO: map JSON trả về từ BIDV sang NormalizedTransaction.
	return []bankcore.NormalizedTransaction{}, nil
}
