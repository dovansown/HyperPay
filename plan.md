# Kế hoạch đấu API cho frontend mới (`web/`)

Mục tiêu: thay thế mock/điều hướng giả trong `web/` bằng dữ liệu thật từ backend `be/` (base `/api/v1`), đưa các màn hình vào trạng thái “production-ready” (auth, loading/error, phân trang/lọc cơ bản, đồng bộ state).

---

## 1) Nền tảng (bắt buộc làm trước khi đấu từng màn)

- **Cấu hình môi trường** ✅
  - Thêm cấu hình build cho `web/` (Vite/TS/Tailwind) để chạy độc lập.
  - Chuẩn hoá `VITE_API_BASE_URL` (mặc định `http://localhost:8080/api/v1`) (đã sẵn trong `web/lib/apiClient.ts`).
  - Quy ước tách `web` vs `be`: FE gọi đúng prefix `/api/v1` (không hardcode rải rác).

- **API client dùng chung** ✅
  - Đã tạo `web/lib/apiClient.ts` (apiFetch + unwrap envelope + mapping lỗi).

- **Auth & session (Redux Toolkit)** ✅ (một phần)
  - Đã dựng Redux store + `authSlice`:
    - Lưu `token` + `user` vào localStorage (key versioned).
    - Thunks: `registerThunk`, `loginThunk`, `forgotPasswordThunk`, `fetchCurrentUser`.
  - Middleware/guard route ✅
    - Đã thêm `RequireAuth` để chặn `/dashboard`, `/bank`, `/webhook*`, `/billing`, `/profile`, `/support`.
  - TODO tiếp theo: khi gặp 401/expired token → auto logout (sẽ làm khi đấu API thật cho các màn).

- **UX chuẩn cho gọi API**
  - Loading state: skeleton/spinner cho table/card.
  - Error state: hiển thị message rõ ràng (toast/inline).
  - Empty state: “chưa có dữ liệu”.
  - Disable nút khi submit + chống double submit.

---

## 2) Mapping API backend (để FE bám đúng)

Backend `be/` routes chính (base `/api/v1`):

- **Auth**
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/forgot-password`
  - (Hiện chưa thấy endpoint verify-OTP/verify-email trong `be/api.http` → cần quyết định ở mục OTP)

- **User**
  - `GET /users/me`

- **Dashboard**
  - `GET /dashboard?period=...` (backend có schema query)

- **Accounts (bank accounts)**
  - `GET /accounts`
  - `POST /accounts`
  - `PATCH /accounts/:id` (nếu backend có; cần verify controller)
  - `DELETE /accounts/:id` (nếu backend có)
  - `POST /accounts/:id/token/refresh`

- **Transactions**
  - `GET /accounts/:accountId/transactions` (JWT)
  - `GET /external/accounts/:token/transactions` (external)
  - `POST /external/accounts/:token/transactions` (external)

- **Webhook**
  - `GET /webhook` (lấy cấu hình)
  - `POST /webhook` (tạo)
  - `PUT /webhook/:id` (cập nhật)
  - `DELETE /webhook/:id` (xóa)
  - `POST /webhook/test`
  - `GET /webhook/logs`

- **Billing**
  - `GET /plans`
  - `GET /packages`
  - `GET /packages/me/active`
  - `POST /packages/:id/purchase`
  - `GET /durations`
  - `GET /balance`
  - `POST /balance/top-up`

- **Content (Blog/Docs)**
  - `GET /public/content?type=...&limit=...&offset=...` (+ filter category/tag/q)
  - `GET /public/content/:slug`
  - `GET /public/content/categories`
  - `GET /public/content/tags`

---

## 3) Checklist theo màn hình (web/pages)

### 3.1 `web/pages/Login.tsx`
- **Thay Link-to-dashboard bằng submit thật** ✅
  - Call `POST /auth/login` → lấy token.
  - Call `GET /users/me` sau login để lấy profile.
  - Điều hướng về `/dashboard` (hoặc route trước đó).
- **Validation/UX** ✅
  - Required fields + loading/error UI.

### 3.2 `web/pages/Register.tsx`
- **Đấu `POST /auth/register`** ✅
  - Mapping `full_name` từ input full name.
  - Sau register:
    - Nếu có token: fetch `/users/me` + vào dashboard.
    - Nếu không có token: chuyển `/login`.

### 3.3 `web/pages/ForgotPassword.tsx`
- **Đấu `POST /auth/forgot-password`** ✅
  - Có success + loading/error UI.

### 3.4 `web/pages/VerifyOTP.tsx`
- **Quyết định luồng**
  - Hiện backend chưa thấy endpoint verify OTP/email → chọn 1 trong 2:
    - (A) **Bỏ màn**: sau register đi thẳng login/dashboard.
    - (B) **Tạo API**: thêm endpoint verify vào backend rồi FE call thật.
  - Nếu giữ màn: cần API resend + verify + state `verification_id` (frontend cũ có hint).

### 3.5 `web/pages/Dashboard.tsx` + `web/components/sections/RecentActivityTable.tsx`
- **Thay mock (chart + stats + recent activity)** ✅
  - Đã gọi `GET /dashboard?period=7|30` qua Redux `dashboardSlice`.
  - Recent activity lấy từ `dashboard.recent_transactions`.
- **Cần bổ sung**
  - Account selector (nếu muốn recent theo account).
  - Format tiền tệ: ưu tiên VND nếu backend trả VND (hiện UI đang USD giả).

### 3.6 `web/pages/Bank.tsx`
- **Thay MOCK_BANKS bằng dữ liệu thật** ✅
  - `GET /accounts` để render table.
  - Modal “Add” ✅
    - `GET /banks` để dropdown danh sách bank (code/name/icon).
    - `POST /accounts` khi submit.
  - Action thêm ✅
    - Nút refresh token: `POST /accounts/:id/token/refresh` + copy token.
  - Modal “Edit/Delete” ⏳
    - Backend có `PATCH /accounts/:id`, `DELETE /accounts/:id` nhưng UI edit/delete sẽ làm ở bước tiếp theo (hiện chỉ mở modal xem/chuẩn bị form).
- **Lọc/sort**
  - Hiện DataTable sort/filter phía client OK trước; nếu dataset lớn mới nâng cấp server-side.

### 3.7 `web/pages/Webhook.tsx`
- **Thay MOCK_WEBHOOKS** ✅
  - Fetch config: `GET /webhook`.
  - Hiển thị list theo dữ liệu thật + nút gửi test.
- **Tab Logs** ✅
  - Thay MOCK_LOGS bằng `GET /webhook/logs?limit=...`.

### 3.8 `web/pages/WebhookForm.tsx`
- **Load dữ liệu edit**
  - Nếu `/:id`: gọi `GET /webhook` rồi tìm theo id. ✅
- **Mapping field & submit**
  - UI fields cần map sang schema backend:
    - `enabled`/`enableEndpoint` → `is_active`
    - `secret` → `secret_token` (nếu backend tự generate thì FE phải hiển thị từ response; hiện UI đang hardcode)
    - `bankAccount` → `account_ids` (multi-select nếu backend hỗ trợ nhiều)
    - `direction` → `transaction_direction` (map both/in/out ↔ BOTH/IN/OUT)
    - `contentType` → `content_type` (json/form ↔ JSON/FORM_URLENCODED)
    - `retry` → `retry_on_non_2xx`
    - `maxRetries` → `max_retry_attempts`
    - `authType` + các field phụ:
      - NONE/BEARER/BASIC/HEADER và các trường token/user/pass/headerName/headerValue
    - payment code:
      - `requirePaymentCode` → `require_payment_code`
      - `enableExtractionRule` → `payment_code_rule_enabled` + các field rule (prefix/min/max/charset) (UI hiện chưa có input chi tiết → cần bổ sung)
  - Submit:
    - create: `POST /webhook`
    - update: `PUT /webhook/:id`
- **Gửi test**
  - Thêm nút “Send test” → `POST /webhook/test`. ✅

### 3.9 `web/pages/Billing.tsx`
- **Thay mock plan/balance/usage/invoices** ✅
  - Current plan/active package: `GET /packages/me/active`
  - List packages + durations: `GET /packages`, `GET /durations`
  - Balance: `GET /balance` + “Add funds” → `POST /balance/top-up`
  - Mua gói: `POST /packages/:id/purchase`
  - Invoices: backend chưa có endpoint → UI chuyển sang hiển thị danh sách packages + modal mua gói.
- **Nâng cấp UI hiện tại** ✅
  - Thay USD → VND.

### 3.10 `web/pages/Profile.tsx`
- **Personal info**
  - `GET /users/me` để fill data. ✅
  - Update profile: `PATCH /users/me` (hiện chỉ update `full_name`). ✅
  - Change password (có email code):
    - `POST /users/me/change-password/check` ✅
    - `POST /users/me/change-password/send-code` ✅
    - `POST /users/me/change-password` ✅
- **Security / 2FA / trusted devices / login history**
  - 2FA (TOTP):
    - `GET /users/me/2fa/setup` ✅ (backend trả thêm `qrDataUrl` để render QR)
    - `POST /users/me/2fa/confirm` ✅ (trả `backupCodes`)
    - `POST /users/me/2fa/disable` ✅
  - Trusted devices / login history: hiện UI đang mock → cần backend expose API nếu muốn làm thật.

### 3.11 `web/pages/Blog.tsx` + `web/pages/BlogPost.tsx`
- **Chuyển từ `web/data/blogPosts.ts` sang Content API**
  - List: `GET /public/content?type=BLOG_POST&limit=&offset=`
  - Detail: `GET /public/content/:slug`
  - Route hiện đang dùng `:id` → cần đổi sang `:slug` để match backend.
  - Optional: categories/tags filter (UI filter/search nếu muốn).
✅ Đã đấu API list + detail và đổi route sang `:slug`.

### 3.12 `web/pages/Docs.tsx`
- **Đổi nội dung tĩnh sang CMS content**
  - Option 1: render markdown/html từ `GET /public/content?type=DOC_PAGE` và `GET /public/content/:slug`.
  - Option 2: giữ landing docs tĩnh, nhưng link sang trang `/docs/:slug` render content thật (khuyến nghị).
  - Base URL trong docs hiện hardcode `api.moneta.com` → thay bằng env hoặc doc từ backend.
✅ Đã chuyển sang load danh sách DOC_PAGE + render theo slug (`/docs/:slug`).

### 3.13 `web/pages/Support.tsx`
- **Xác định backend có module support/tickets hay không**
  - ✅ Đã bổ sung backend module `be/src/modules/support` + Prisma model `SupportTicket`.
  - ✅ Đã đấu UI `web/pages/Support.tsx` (list + search + filter + create ticket).
  - API:
    - `GET /support/tickets?q=&status=&priority=&page=&limit=`
    - `POST /support/tickets`
    - `GET /support/tickets/:ticketId`
    - `PATCH /support/tickets/:ticketId`
  - **Lưu ý deploy DB**: cần chạy `bun run prisma:migrate` + `bun run prisma:generate` trong `be/` để tạo bảng `support_tickets`.

---

## 4) Việc “migrate” từ `frontend/front/` sang `web/` (để clean dự án)

- **Chuẩn hoá alias/import**
  - `web/` đang dùng alias `@/` → đảm bảo Vite/TS config trong `web` có paths tương ứng.

- **Tái sử dụng logic từ frontend cũ**
  - Port `apiClient.ts` (đã có mẫu tốt).
  - Port auth persistence + guard (frontend cũ có `withAuth`, `withRole`).
  - Port typed models cho accounts/webhook/billing nếu muốn nhanh.

- **Dọn routing**
  - Thống nhất path:
    - Bank accounts: `/bank` (UI mới) vs `/bank-accounts` (cũ) → ok, nhưng đảm bảo link/nav đúng.
    - Webhook: `/webhook` + `/webhook/:id` (UI mới) → đảm bảo backend id-based update.
    - Blog: đổi `/blog/:id` → `/blog/:slug`.

- **Xoá/archieve code cũ**
  - Sau khi `web/` đã chạy ổn: quyết định giữ `frontend/front/` làm reference hay remove khỏi build/deploy.

---

## 5) Thứ tự triển khai đề xuất (ưu tiên theo giá trị)

1. **API client + Auth context + route guard**
2. **Login/Register/Forgot**
3. **Dashboard (kéo được số liệu thật)**
4. **Bank accounts (CRUD tối thiểu + refresh token)**
5. **Webhook config + logs + send test**
6. **Billing (active package + packages + durations + balance/top-up + purchase)**
7. **Blog/Docs dùng content API (đổi route slug)**
8. **Profile/Security/Support: làm phần nào backend support, còn lại “coming soon”**
9. **Notifications: module + dropdown header (list/mark read)**

