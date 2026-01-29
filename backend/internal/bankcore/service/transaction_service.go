package service

import (
	"context"

	"gorm.io/gorm"

	"hyperpay-backend/internal/bankcore"
	"hyperpay-backend/internal/bankcore/registry"
	"hyperpay-backend/internal/models"
)

// TransactionService là layer core để:
// - Gọi provider theo bankCode (VCB, VIETINBANK, BIDV...)
// - Chuẩn hoá và lưu giao dịch vào DB.
type TransactionService struct {
	db *gorm.DB
}

func NewTransactionService(db *gorm.DB) *TransactionService {
	return &TransactionService{db: db}
}

// FetchAndStoreTransactions là skeleton pipeline:
// - Resolve provider theo bankCode của BankAccount.
// - Login (nếu cần).
// - Fetch -> Parse -> lưu vào bảng BankTransaction.
func (s *TransactionService) FetchAndStoreTransactions(
	ctx context.Context,
	account *models.BankAccount,
	login bankcore.LoginInput,
	fetch bankcore.FetchInput,
) ([]models.BankTransaction, error) {
	provider, err := registry.GetProvider(account.BankName) // BankName hiện đang dùng như code; sau này có thể đổi thành field riêng.
	if err != nil {
		return nil, err
	}

	loginOut, err := provider.Login(ctx, login)
	if err != nil {
		return nil, err
	}

	raws, err := provider.FetchTransactions(ctx, &loginOut.Session, fetch)
	if err != nil {
		return nil, err
	}

	normals, err := provider.ParseTransactions(ctx, raws)
	if err != nil {
		return nil, err
	}

	var saved []models.BankTransaction
	for _, n := range normals {
		tx := models.BankTransaction{
			BankAccountID: account.ID,
			ExternalID:    n.ExternalID,
			Amount:        n.Amount,
			Type:          n.Type,
			Description:   n.Description,
			Balance:       n.Balance,
			OccurredAt:    n.OccurredAt,
		}
		if err := s.db.WithContext(ctx).Create(&tx).Error; err != nil {
			return nil, err
		}
		saved = append(saved, tx)
	}

	return saved, nil
}
