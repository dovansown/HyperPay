package vcb

import (
	"context"

	"hyperpay-backend/internal/bankcore"
)

// Provider triển khai BankProvider cho Vietcombank dựa trên example/vcb.js.
// Script JS sử dụng hybrid crypto (AES-CTR + RSA) và decrypt response.
// Ở đây mới chỉ skeleton, chưa port đầy đủ.
type Provider struct{}

func NewProvider() *Provider {
	return &Provider{}
}

func (p *Provider) Code() string {
	return "VCB"
}

// Login: TODO - implement theo vcb.js:
// - Sinh RSA keypair client, gửi kèm clientPubKey trong payload.
// - Mã hoá payload bằng AES-CTR, AES key được RSA encrypt bởi server public key.
// - Thiết lập headers (X-Request-ID, X-Lim-ID, ...).
// - Gửi request tới /authen-service/v1/login.
func (p *Provider) Login(ctx context.Context, in bankcore.LoginInput) (*bankcore.LoginOutput, error) {
	// TODO: implement thực tế.
	return &bankcore.LoginOutput{
		Session: bankcore.Session{
			BankCode: p.Code(),
			Raw:      map[string]any{"TODO": "vcb-session"},
		},
		Meta: map[string]any{},
	}, nil
}

func (p *Provider) FetchTransactions(ctx context.Context, sess *bankcore.Session, in bankcore.FetchInput) ([]bankcore.RawTransaction, error) {
	// TODO: gọi API lấy lịch sử giao dịch VCB.
	return []bankcore.RawTransaction{}, nil
}

func (p *Provider) ParseTransactions(ctx context.Context, raws []bankcore.RawTransaction) ([]bankcore.NormalizedTransaction, error) {
	// TODO: map JSON trả về từ VCB sang NormalizedTransaction.
	return []bankcore.NormalizedTransaction{}, nil
}
