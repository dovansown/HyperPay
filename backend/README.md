## HyperPay Backend

Backend mẫu cho hệ thống lấy lịch sử giao dịch ngân hàng.

- **Ngôn ngữ**: Go
- **Framework**: Gin
- **Database**: PostgreSQL (qua GORM)

### Cấu trúc thư mục chính

- `cmd/server`: entrypoint khởi động HTTP server.
- `internal/config`: nạp config (env).
- `internal/database`: khởi tạo kết nối Postgres.
- `internal/models`: domain models (User, BankAccount, ...).
- `internal/dto`: request/response DTO.
- `internal/response`: chuẩn hóa response API.
- `internal/handler`: handler Gin (auth, account).
- `internal/router`: khai báo route.

