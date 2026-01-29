package bankcore

import "context"

// BankProvider là interface chung mà mỗi ngân hàng cần implement.
// Mục tiêu: core chỉ nói chuyện với interface này, không phụ thuộc chi tiết từng bank.
type BankProvider interface {
	// Code trả về mã bank chuẩn, ví dụ "VCB", "VIETINBANK", "BIDV".
	Code() string

	// Login đăng nhập vào hệ thống ngân hàng, trả về Session dùng cho các call tiếp theo.
	Login(ctx context.Context, in LoginInput) (*LoginOutput, error)

	// FetchTransactions gọi API bank để lấy danh sách giao dịch thô trong khoảng thời gian.
	FetchTransactions(ctx context.Context, sess *Session, in FetchInput) ([]RawTransaction, error)

	// ParseTransactions chuyển dữ liệu thô sang NormalizedTransaction để lưu vào DB.
	ParseTransactions(ctx context.Context, raws []RawTransaction) ([]NormalizedTransaction, error)
}
