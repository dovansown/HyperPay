package bankcore

import "time"

// LoginInput là input tối thiểu cho việc đăng nhập bank.
// Mỗi bank có thể mở rộng struct riêng, nhưng nên nhúng LoginInput.
type LoginInput struct {
	Username string
	Password string

	// Các thông tin device/browser, captcha... có thể bổ sung qua Meta.
	Meta map[string]string
}

// Session đại diện cho phiên đã đăng nhập trên bank.
// Tùy bank có thể là token, cookie, sessionId, clientKeys...
type Session struct {
	BankCode string

	// Raw chứa JSON hoặc bất cứ gì provider cần giữ lại.
	Raw map[string]any
}

// LoginOutput là kết quả login trả về cho core.
type LoginOutput struct {
	Session Session
	// Thông tin thêm (tên chủ tài khoản, số tài khoản mặc định, ...) nếu cần.
	Meta map[string]any
}

// FetchInput mô tả khoảng thời gian cần lấy giao dịch.
type FetchInput struct {
	From time.Time
	To   time.Time
}

// RawTransaction là giao dịch ở dạng “thô” đúng như bank trả về.
type RawTransaction struct {
	BankCode string
	// Payload giữ nguyên dữ liệu bank, để debug/tracking.
	Payload map[string]any
}

// NormalizedTransaction là giao dịch đã chuẩn hoá cho hệ thống.
type NormalizedTransaction struct {
	ExternalID  string
	Amount      int64
	Type        string // credit/debit
	Description string
	Balance     int64
	OccurredAt  time.Time

	// Meta: thông tin phụ (mã chi nhánh, category, ...).
	Meta map[string]any
}
