# HyperPay – Task List (Frontend + Backend API alignment)

> Mục tiêu: đưa frontend từ UI demo/mock lên mức khớp nghiệp vụ trong `be/prisma/schema.prisma` và chạy end‑to‑end với các API ở `be/api.http`.

## Trạng thái
- [ ] = Chưa làm
- [~] = Đang làm
- [x] = Xong

## P0 – Bắt buộc (để chạy được sản phẩm tối thiểu)

### 0.1 Khóa “hợp đồng API” & chuẩn hóa response/error
- [x] Rà soát toàn bộ endpoints trong `be/src/routes/v1.ts` và đối chiếu `be/api.http` (đảm bảo không endpoint “ảo”).
- [x] Chuẩn hóa format response (envelope) cho các module (accounts/transactions/webhook/content/…).
- [x] Chuẩn hóa format error (message/code/details) để frontend hiển thị nhất quán.
- [x] Bổ sung request “negative tests” trong `be/api.http` cho các validate quan trọng (webhook auth, payment code rules…).

### 0.2 Transactions (BankTransaction)
Backend đã có:
- `GET /accounts/:accountId/transactions` (JWT)
- `GET /external/accounts/:token/transactions`
- `POST /external/accounts/:token/transactions`

Frontend cần:
- [x] Thêm route `/transactions` (list) và `/transactions/:id` (detail) nếu backend hỗ trợ; nếu chưa có detail thì tối thiểu list theo account.
- [x] Tạo `transactionsSlice` + API client calls.
- [x] UI list giao dịch theo account: filter thời gian, search `payment_code`, phân loại `type`, pagination (nếu có).
- [x] Nối “View all” từ Dashboard sang trang Transactions.
- [x] Thay dữ liệu mock ở Dashboard bằng data thật từ API (nếu backend trả đủ).

### 0.3 Webhook (UserWebhook + UserWebhookAccount)
Backend đã có:
- `GET /webhook`
- `POST /webhook` (upsert 1 webhook/user) theo `be/src/modules/webhooks/webhooks.schema.ts`

Frontend cần (khớp schema):
- [x] Mở rộng form webhook để hỗ trợ đầy đủ:
  - [x] `content_type`: `JSON`, `FORM_URLENCODED`
  - [x] `auth_type`: `NONE`, `BEARER`, `BASIC`, `HEADER` + các field liên quan
  - [x] retry: `retry_on_non_2xx`, `max_retry_attempts`
  - [x] filter: `transaction_direction` (`IN|OUT|BOTH`), `require_payment_code`
  - [x] payment code rules: `payment_code_rule_enabled`, `payment_code_prefix`, suffix min/max, `payment_code_suffix_charset`
  - [x] `is_active`
- [x] Cho phép chọn bank accounts áp dụng (`account_ids`) dựa trên `/accounts`.
- [x] Cập nhật `webhookSlice` để map đủ field (không chỉ `url/secret_token/is_active`).
- [x] Thêm UI validate phía frontend tương ứng với validate zod ở backend (nhất là `auth_type` và payment code rules).

## P1 – Quan trọng (đưa hệ thống vào dùng thật)

### 1.1 Billing/Subscription (Plan/Package/UserPackage/UserPlan)
Backend đã có:
- `GET /plans`, `POST /plans`
- `GET /packages`, `GET /packages/me/active`, `POST /packages/:packageId/purchase`
- `POST /packages` (ADMIN)

Frontend cần:
- [x] Trang “Pricing/Packages” hiển thị `plans/packages` từ API (không hardcode).
- [x] Trang “My subscription” hiển thị gói active hiện tại từ `/packages/me/active`.
- [x] Luồng mua package (purchase) từ UI.
- [x] Hiển thị quota/usage: transactions/webhook deliveries/bank types theo dữ liệu backend (nếu backend trả).
- [x] Refactor `BillingPage` để bỏ mock invoices/plan, thay bằng dữ liệu thật.

### 1.2 Banks (Bank)
Backend đã có:
- `GET /banks`, `POST /banks`

Frontend cần:
- [x] UI quản lý danh sách banks (admin/ops nếu cần).
- [x] Đồng bộ UI bank icon/name/code trong phần accounts (thay vì chỉ string `bank_name`).

## P2 – CMS/Content & Admin

### 2.1 Public content (Blog/Docs/Help) lấy từ DB
Backend đã có:
- `GET /public/content` (+ filter: type/category/tag/q/limit/offset)
- `GET /public/content/:slug`
- `GET /public/content/categories`
- `GET /public/content/tags`
- `GET /public/content/preview/:token`

Frontend cần:
- [x] Refactor `/blog`, `/blog/:slug` để dùng API `Content` (type = `BLOG_POST`).
- [x] Refactor `/docs` để dùng API (type = `DOC_PAGE`).
- [x] Refactor `/help` để dùng API (type = `HELP_ARTICLE`) hoặc giữ landing rồi link sang article list.
- [x] Thêm filter theo category/tag/search.
- [x] Thêm preview page bằng token (nếu cần cho editor).

### 2.2 Admin content (AUTHOR/EDITOR/ADMIN)
Backend đã có:
- `GET /content` (admin list)
- `POST /content` (create)
- `PATCH /content/:slug` (update/status/schedule/taxonomy)
- `DELETE /content/:slug` (soft delete)
- `POST /content/:slug/preview-token`
- `GET /content/:slug/revisions`
- `POST /content/:slug/revisions/:revisionId/restore`
- `POST /content/categories`
- `POST /content/tags`

Frontend cần:
- [x] Thêm admin area `/admin/content` (list + filter type/status/taxonomy/search).
- [x] Content editor (create/update/publish/schedule).
- [x] Taxonomy manager (categories/tags).
- [x] Revisions viewer + restore.
- [x] Phân quyền theo `UserRole` (ẩn route/menu, chặn truy cập).

## Tech debt / polish
- [x] Sửa toàn bộ link placeholder `href="#"` ở public footer/header thành route thật (`/docs`, `/help`, `/blog`, …).
- [x] Chuẩn hóa loading/empty/error state trên các page.
- [x] Thêm test tối thiểu cho validate & services quan trọng (backend) và slice reducers (frontend) nếu có thời gian.

