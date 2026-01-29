package registry

import (
	"fmt"
	"sync"

	"hyperpay-backend/internal/bankcore"
)

var (
	mu        sync.RWMutex
	providers = make(map[string]bankcore.BankProvider)
)

// Register đăng ký 1 provider theo bankCode (VD: VCB, VIETINBANK, BIDV).
func Register(p bankcore.BankProvider) {
	mu.Lock()
	defer mu.Unlock()
	code := p.Code()
	providers[code] = p
}

// GetProvider lấy provider theo bankCode.
func GetProvider(bankCode string) (bankcore.BankProvider, error) {
	mu.RLock()
	defer mu.RUnlock()
	if p, ok := providers[bankCode]; ok {
		return p, nil
	}
	return nil, fmt.Errorf("bank provider not found for code: %s", bankCode)
}
