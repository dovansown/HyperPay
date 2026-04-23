# HyperPay - Kế hoạch phát triển và đồng bộ Frontend-Backend

## 📋 Tổng quan dự án

**HyperPay** là hệ thống cho phép lấy lịch sử giao dịch ngân hàng thông qua API. Hệ thống bao gồm:

- **Backend (be/)**: Express + TypeScript, Prisma + PostgreSQL, Redis cache, RabbitMQ queue
- **Frontend (web/)**: React + TypeScript, Redux Toolkit, TailwindCSS, Vite

### Kiến trúc Backend
- **Cấu trúc module**: repository/service/controller/routes
- **Database**: PostgreSQL với Prisma ORM
- **Cache**: Redis (ioredis)
- **Queue**: RabbitMQ (amqplib)
- **Email**: Nodemailer với queue worker
- **Auth**: JWT + 2FA (TOTP) + backup codes
- **Logging**: Pino

### Kiến trúc Frontend
- **State Management**: Redux Toolkit với async thunks
- **Routing**: React Router v7
- **UI**: Custom components với TailwindCSS
- **Charts**: Recharts
- **i18n**: Custom LanguageContext

---

## 🎯 Vấn đề hiện tại

Sau khi khảo sát cả frontend và backend, phát hiện các vấn đề sau:

### 1. **Frontend có nhưng Backend chưa có API**

#### 1.1. Banks Management
- ✅ Frontend: `web/store/slices/banksSlice.ts` - có `fetchBanks` thunk
- ✅ Backend: `be/src/modules/banks/banks.routes.ts` - có GET `/banks`
- ✅ **Đã đồng bộ**

#### 1.2. Content/Blog System
- ✅ Frontend: `web/store/slices/contentSlice.ts` - có fetch blog posts
- ✅ Backend: `be/src/modules/content/content.routes.ts` - có public content routes
- ✅ **Đã đồng bộ**

### 2. **Backend có API nhưng Frontend chưa sử dụng**

#### 2.1. Admin Module
- ❌ Frontend: Không có admin slice hoặc admin pages
- ✅ Backend: `be/src/modules/admin/admin.routes.ts` - có đầy đủ admin APIs
- 🔧 **Cần tạo**: Admin dashboard, user management UI

#### 2.2. Verification System
- ❌ Frontend: Có `VerifyOTP.tsx` nhưng chưa tích hợp đầy đủ
- ✅ Backend: `be/src/modules/verification/` - có verification code system
- 🔧 **Cần hoàn thiện**: Email verification flow, login verification

#### 2.3. User Login History
- ❌ Frontend: Không có UI hiển thị login history
- ✅ Backend: Database có `UserLoginHistory` model
- 🔧 **Cần tạo**: Security/Activity log page trong Profile

#### 2.4. Backup Codes Management
- ⚠️ Frontend: `profileSlice.ts` có `lastBackupCodes` nhưng UI chưa đầy đủ
- ✅ Backend: Database có `UserBackupCode` model
- 🔧 **Cần hoàn thiện**: UI để view/regenerate backup codes

#### 2.5. System Settings
- ❌ Frontend: Không có system settings management
- ✅ Backend: `be/src/modules/system-settings/` - có service
- 🔧 **Cần tạo**: Admin system settings page

### 3. **Tính năng chưa hoàn chỉnh**

#### 3.1. Bank Accounts Management
- ⚠️ Frontend: `Bank.tsx` có UI edit nhưng chưa implement
- ⚠️ Backend: Có PATCH/DELETE endpoints nhưng frontend chưa gọi
- 🔧 **Cần hoàn thiện**: Edit/Delete bank account functionality

#### 3.2. Transactions Display
- ⚠️ Frontend: Dashboard có `RecentActivityTable` nhưng chưa có trang transactions riêng
- ✅ Backend: `be/src/modules/transactions/transactions.routes.ts` - có đầy đủ APIs
- 🔧 **Cần tạo**: Transactions page với filter, pagination, export

#### 3.3. Webhook Logs Detail
- ⚠️ Frontend: `webhookSlice.ts` có fetch logs nhưng UI chưa chi tiết
- ✅ Backend: `WebhookDeliveryLog` model có đầy đủ thông tin
- 🔧 **Cần hoàn thiện**: Webhook logs detail view với request/response payload

#### 3.4. Support Tickets Detail
- ⚠️ Frontend: `Support.tsx` có list tickets nhưng chưa có detail view
- ✅ Backend: Có GET `/support/tickets/:ticketId` và PATCH update
- 🔧 **Cần tạo**: Ticket detail page, reply/update functionality

#### 3.5. Profile Management
- ⚠️ Frontend: `Profile.tsx` có basic info nhưng thiếu nhiều tính năng
- ✅ Backend: Có đầy đủ APIs (change password, 2FA, email verification)
- 🔧 **Cần hoàn thiện**:
  - Email verification UI flow
  - Change password với verification code
  - 2FA setup/disable UI
  - Login history display
  - Backup codes management

#### 3.6. Notifications
- ⚠️ Frontend: `notificationsSlice.ts` có thunks nhưng chưa có UI
- ✅ Backend: Có đầy đủ notification APIs
- 🔧 **Cần tạo**: Notification dropdown/panel trong header

#### 3.7. Packages vs Plans
- ⚠️ Frontend: `billingSlice.ts` có cả packages và plans nhưng UI chỉ focus vào packages
- ✅ Backend: Có cả 2 systems (Plans và Packages)
- 🔧 **Cần làm rõ**: Business logic - dùng Plans hay Packages? Hay cả 2?

---

## 📊 Phân tích chi tiết các module

### Module đã hoàn chỉnh ✅

| Module | Frontend | Backend | Status |
|--------|----------|---------|--------|
| Auth (Login/Register) | ✅ | ✅ | Hoàn chỉnh |
| Dashboard | ✅ | ✅ | Hoàn chỉnh |
| Banks List | ✅ | ✅ | Hoàn chỉnh |
| Webhooks CRUD | ✅ | ✅ | Hoàn chỉnh |
| Balance & Top-up | ✅ | ✅ | Hoàn chỉnh |
| Packages Purchase | ✅ | ✅ | Hoàn chỉnh |

### Module cần hoàn thiện 🔧

| Module | Frontend | Backend | Thiếu gì |
|--------|----------|---------|----------|
| Bank Accounts | ⚠️ | ✅ | Edit/Delete functionality |
| Transactions | ⚠️ | ✅ | Dedicated page với filters |
| Webhook Logs | ⚠️ | ✅ | Detail view với payload |
| Support Tickets | ⚠️ | ✅ | Detail page, reply system |
| Profile | ⚠️ | ✅ | 2FA, email verify, password change flows |
| Notifications | ⚠️ | ✅ | UI dropdown/panel |

### Module chưa có ❌

| Module | Frontend | Backend | Mô tả |
|--------|----------|---------|-------|
| Admin Dashboard | ❌ | ✅ | User management, system stats |
| Login History | ❌ | ✅ | Security activity log |
| System Settings | ❌ | ✅ | Admin config management |
| Content Management | ❌ | ✅ | Blog/Docs editor (nếu cần) |

---

## 🗺️ Kế hoạch thực hiện

### Phase 0: Cleanup & Foundation (Ưu tiên cao nhất) ✅ COMPLETED

#### Task 0.1: Remove Plans System ✅ DONE
**Mục tiêu**: Xóa Plans system vì không được sử dụng

**Backend**:
- [x] Tạo migration để drop tables: `plans`, `user_plans`, `plan_banks`
- [x] Xóa `be/src/modules/plans/` folder
- [x] Xóa plans routes khỏi `v1.ts`
- [x] Xóa Plan, UserPlan, PlanBank từ Prisma schema
- [x] Run `prisma generate` và `prisma migrate`

**Frontend**:
- [x] Xóa plans references trong `billingSlice.ts` (nếu có)
- [x] Cleanup unused types

**Completed**: 2026-04-22

---

#### Task 0.2: Add TicketReply Model ✅ DONE
**Mục tiêu**: Thêm reply system cho support tickets

**Backend**:
- [x] Tạo `TicketReply` model trong Prisma schema
- [x] Update `SupportTicket` model: add `replies TicketReply[]`
- [x] Update `User` model: add `ticketReplies TicketReply[]`
- [x] Tạo migration
- [x] Thêm APIs:
  - POST `/support/tickets/:ticketId/replies`
  - GET `/support/tickets/:ticketId/replies`
- [x] Update ticket `updatedAt` khi có reply mới

**Completed**: 2026-04-22

---

#### Task 0.3: Enhance Verification System ✅ DONE
**Mục tiêu**: Hoàn thiện verification flows theo requirements

**Backend**:
- [x] **Email Verification Flow**:
  - Sau register, tự động gửi verification code ✅
  - API: POST `/auth/verify` với code ✅
  - Middleware check `emailVerified` cho protected routes ✅
  
- [x] **Login Verification Flow**:
  - Track login history (IP + UserAgent hash) ✅
  - Nếu IP/UA mới → gửi LOGIN_VERIFY code ✅
  - API: POST `/auth/verify` với code (type: login) ✅
  - Chỉ issue JWT sau khi verify ✅
  
- [x] **Forgot Password Flow**:
  - POST `/auth/forgot-password` → gửi code ✅
  - POST `/auth/reset-password` với code + new password ✅
  - Invalidate existing sessions after password change ✅
  - Send confirmation email ✅

**Frontend**: (To be done in Phase 1)
- [ ] Update `Register.tsx`: redirect to verify email page
- [ ] Update `VerifyOTP.tsx`: support multiple verification types
- [ ] Update `Login.tsx`: handle login verification flow
- [ ] Update `ForgotPassword.tsx`: complete flow với code input

**Backend Completed**: 2026-04-22

---

### Phase 1: Hoàn thiện các tính năng cơ bản (Ưu tiên cao)

#### Task 1.1: Bank Accounts Management ✅ DONE
**Mục tiêu**: Hoàn thiện CRUD cho bank accounts

**Frontend**:
- [x] Implement edit bank account trong `Bank.tsx`
- [x] Implement delete bank account với confirmation modal
- [x] Update `accountsSlice.ts` với `updateAccount` và `deleteAccount` thunks
- [x] Hiển thị API token sau khi create/refresh (đã có sẵn)

**Backend**: ✅ Đã có

**Completed**: 2026-04-23

---

#### Task 1.2: Transactions Page ✅ DONE
**Mục tiêu**: Tạo trang transactions riêng với đầy đủ tính năng

**Frontend**:
- [x] Tạo `web/pages/Transactions.tsx` (tái sử dụng cấu trúc từ Bank.tsx)
- [x] Tạo `web/store/slices/transactionsSlice.ts`
- [x] Implement filters: type (IN/OUT), amount range
- [x] Implement pagination (sử dụng DataTable component có sẵn)
- [x] Implement export to CSV
- [x] Add route `/transactions` vào `App.tsx`
- [x] Account selector dropdown
- [x] Stats cards: Total Income, Total Expense, Net Balance
- [x] Search functionality

**Backend**: ✅ Đã có

**Completed**: 2026-04-23

---

#### Task 1.3: Profile Management - Complete Flows ✅ DONE
**Mục tiêu**: Hoàn thiện tất cả profile management flows

**Frontend** (`web/pages/Profile.tsx`):
- [x] **Email Verification Section**:
  - [x] Warning card nếu email chưa verify
  - [x] Button "Send Verification Code"
  - [x] Modal nhập code và verify
  - [x] Refresh profile sau khi verify thành công

- [x] **Change Password Section**:
  - [x] Form: current password, new password, confirm password ✅ (đã có)
  - [x] Check password validity ✅ (đã có)
  - [x] Send verification code ✅ (đã có)
  - [x] Input code và change password ✅ (đã có)

- [x] **2FA Section**:
  - [x] Show QR code khi setup ✅ (đã có)
  - [x] Input TOTP code để enable ✅ (đã có)
  - [x] Display backup codes sau khi enable ✅ (đã có)
  - [x] Button disable 2FA ✅ (đã có)
  - [x] Regenerate backup codes ✅ (đã có)

- [x] **Login History Section**:
  - [x] Display login history table ✅ (đã có với MOCK data)
  - [x] Show: IP, location, device, last seen ✅ (đã có)
  - [x] Highlight suspicious activity ✅ (đã có)
  - Note: Backend cần thêm API GET /users/me/login-history để fetch real data

**Backend**: ✅ Đã có (trừ login history API - có thể thêm sau)

**Completed**: 2026-04-23

---

#### Task 1.4: Notifications UI ✅ DONE
**Mục tiêu**: Tạo notification system trong UI

**Frontend**:
- [x] Tạo `web/components/NotificationDropdown.tsx`
- [x] Add notification bell icon vào `DashboardHeader.tsx`
- [x] Show unread count badge
- [x] Dropdown list notifications
- [x] Mark as read functionality
- [x] Mark all as read button
- [x] Auto-refresh every 30 seconds
- [x] Relative time formatting
- [x] Type-based icons

**Backend**: ✅ Đã có

**Completed**: 2026-04-23

---

#### Task 1.5: Webhook Logs Detail ✅ DONE
**Mục tiêu**: Hiển thị chi tiết webhook delivery logs

**Frontend**:
- [x] Thêm Modal detail view khi click vào log row
- [x] Hiển thị status với icon (CheckCircle/AlertCircle)
- [x] Hiển thị event type, URL, date
- [x] Hiển thị error message (nếu có)
- [x] Hiển thị request payload (formatted JSON)
- [x] Hiển thị response body (formatted JSON)
- [x] Tái sử dụng Modal component có sẵn
- [x] onRowClick handler cho DataTable

**Backend**: ✅ Đã có

**Completed**: 2026-04-23

---

#### Task 1.6: Support Tickets Detail ✅ DONE
**Mục tiêu**: Tạo ticket detail page với reply system

**Frontend**:
- [x] Modal detail view khi click vào ticket row
- [x] Display ticket info: code, subject, description, status, priority, category
- [x] Display replies list với phân biệt staff/user
- [x] Reply form với textarea và send button
- [x] Disable reply form nếu ticket đã CLOSED
- [x] Auto-scroll replies area
- [x] Tái sử dụng Modal component có sẵn
- [x] onRowClick handler cho DataTable

**Backend**: ✅ Đã có (Phase 0 Task 0.2)

**Completed**: 2026-04-23

---

### Phase 2: Admin Features (Ưu tiên trung bình)

#### Task 2.1: Admin Dashboard
**Mục tiêu**: Tạo admin dashboard với user management

**Frontend**:
- [ ] Tạo `web/pages/admin/AdminDashboard.tsx`
- [ ] Tạo `web/pages/admin/UserManagement.tsx`
- [ ] Tạo `web/store/slices/adminSlice.ts`
- [ ] Route guard: chỉ ADMIN role mới access
- [ ] Features:
  - System stats overview
  - User list với search/filter
  - User detail/edit
  - Ban/unban user
  - View user activity

**Backend**: ✅ Đã có

**Estimate**: 16 giờ

---

#### Task 2.2: System Settings Management
**Mục tiêu**: Admin có thể config system settings

**Frontend**:
- [ ] Tạo `web/pages/admin/SystemSettings.tsx`
- [ ] Form để edit settings
- [ ] Group settings by category
- [ ] Validation cho từng setting type

**Backend**:
- [ ] Cần thêm routes cho CRUD system settings (hiện chỉ có service)

**Estimate**: 6 giờ (frontend) + 2 giờ (backend)

---

### Phase 3: Advanced Features (Ưu tiên thấp)

#### Task 3.1: Content Management System
**Mục tiêu**: Admin có thể quản lý blog posts và docs

**Frontend**:
- [ ] Tạo `web/pages/admin/ContentEditor.tsx`
- [ ] Rich text editor (TipTap hoặc Quill)
- [ ] Image upload
- [ ] SEO fields
- [ ] Preview mode
- [ ] Publish/Draft/Schedule

**Backend**: ✅ Đã có

**Estimate**: 20 giờ

---

#### Task 3.2: Analytics & Reports
**Mục tiêu**: Thêm analytics chi tiết

**Frontend**:
- [ ] Tạo `web/pages/Analytics.tsx`
- [ ] Charts: revenue over time, transactions by bank, webhook success rate
- [ ] Export reports
- [ ] Custom date range

**Backend**:
- [ ] Tạo analytics endpoints với aggregation queries

**Estimate**: 12 giờ (frontend) + 8 giờ (backend)

---

#### Task 3.3: Webhook Testing & Debugging
**Mục tiêu**: Tools để test và debug webhooks

**Frontend**:
- [ ] Webhook test UI với custom payload
- [ ] Webhook simulator
- [ ] Real-time webhook event viewer (WebSocket?)

**Backend**:
- [ ] WebSocket support cho real-time events
- [ ] Webhook replay functionality

**Estimate**: 10 giờ (frontend) + 6 giờ (backend)

---

## 🔍 Các vấn đề đã được làm rõ

### 1. Plans vs Packages ✅ QUYẾT ĐỊNH: XÓA PLANS
**Phân tích**:
- `UserPlan` không được sử dụng ở đâu trong codebase
- Chỉ có `UserPackage` được sử dụng trong packages service, admin service
- Frontend chỉ dùng Packages
- Plans chỉ có list API nhưng không có purchase logic

**Quyết định**: **XÓA PLANS** - Chỉ giữ lại Packages
- Xóa `Plan`, `UserPlan`, `PlanBank` models
- Xóa plans module trong backend
- Xóa plans routes
- Migration để drop tables

---

### 2. Verification System ✅ ĐÃ LÀM RÕ
**Requirements**:
1. **Email Verification (EMAIL_VERIFY)**:
   - Sau khi đăng ký, gửi code qua email
   - User nhập code để verify email
   - Chưa verify thì không thể sử dụng đầy đủ tính năng

2. **Login Verification (LOGIN_VERIFY)**:
   - Khi đăng nhập từ IP/UserAgent mới (chưa từng thấy)
   - Gửi code qua email để xác nhận
   - Giống Discord: "Is this you? Enter code to confirm"

3. **Change Password Verification (CHANGE_PASSWORD)**:
   - Khi user quên mật khẩu hoặc đổi mật khẩu
   - Gửi code qua email
   - Nhập code + mật khẩu mới để đổi

**Flow**: Giống Discord - simple, secure, user-friendly

---

### 3. Support Ticket Replies ✅ ĐÃ LÀM RÕ
**Requirements**:
- User có thể reply vào ticket của mình
- Admin có thể reply vào bất kỳ ticket nào
- Cần tạo `TicketReply` model với:
  - `id`, `ticketId`, `userId`, `message`, `isStaffReply`, `createdAt`
  - `attachments` (optional - file URLs)
- APIs cần có:
  - POST `/support/tickets/:ticketId/replies` - Create reply
  - GET `/support/tickets/:ticketId/replies` - List replies
  - Tự động update ticket `updatedAt` khi có reply mới

---

### 4. External Transaction API ✅ ĐÃ LÀM RÕ
**Use Case**:
- API cho phép user lấy lịch sử giao dịch của bank account một cách chủ động
- User gọi API với token của bank account (không cần auth JWT)
- Token được generate khi tạo bank account hoặc refresh token
- Use case: User tích hợp vào hệ thống của họ để pull transactions

**Endpoints**:
- GET `/external/accounts/:token/transactions` - Lấy danh sách transactions
- POST `/external/accounts/:token/transactions` - Tạo transaction mới (manual entry)

**Security**: Token phải unique, có thể revoke, rate limit per token

---

## 📝 Checklist tổng hợp

### Immediate Actions (Tuần 1)
- [ ] Task 0.1: Remove Plans System (2h)
- [ ] Task 0.2: Add TicketReply Model (4h)
- [ ] Task 0.3: Enhance Verification System (10h)

**Total Phase 0**: ~16 giờ

### Short-term (Tuần 2-3)
- [ ] Task 1.1: Bank Accounts CRUD (4h)
- [ ] Task 1.4: Notifications UI (6h)
- [ ] Task 1.3: Profile Management (12h)
- [ ] Task 1.2: Transactions Page (8h)

**Total Phase 1**: ~30 giờ

### Mid-term (Tuần 4-5)
- [ ] Task 1.5: Webhook Logs Detail (6h)
- [ ] Task 1.6: Support Tickets Detail (12h)
- [ ] Task 2.2: System Settings (8h)

**Total**: ~26 giờ

### Long-term Phase 2 (Tháng 2)
- [ ] Task 2.1: Admin Dashboard (16h)
- [ ] Làm rõ Plans vs Packages
- [ ] Document verification flows

**Total**: ~16 giờ + planning

### Long-term Phase 3 (Tháng 3+)
- [ ] Task 3.1: Content Management (20h)
- [ ] Task 3.2: Analytics (20h)
- [ ] Task 3.3: Webhook Testing (16h)

**Total**: ~56 giờ

---

## 🎨 UI/UX Improvements

### Cần cải thiện
1. **Loading States**: Thêm skeleton loaders thay vì chỉ text "Loading..."
2. **Error Handling**: Toast notifications thay vì chỉ hiển thị error text
3. **Empty States**: Illustrations cho empty states
4. **Mobile Responsive**: Test và fix responsive issues
5. **Accessibility**: ARIA labels, keyboard navigation
6. **Dark Mode**: Implement dark mode support (optional)

---

## 🔒 Security Considerations

### Cần review
1. **API Token Security**: Token hiển thị trong UI - cần mask và copy button
2. **2FA Backup Codes**: Cần encrypt khi lưu và chỉ show 1 lần
3. **Webhook Secret**: Cần mask trong UI
4. **Rate Limiting**: Frontend cần handle rate limit errors
5. **CSRF Protection**: Check xem backend có CSRF protection chưa

---

## 🧪 Testing Strategy

### Frontend Testing
- [ ] Unit tests cho Redux slices
- [ ] Component tests cho UI components
- [ ] Integration tests cho critical flows (login, purchase, webhook)
- [ ] E2E tests với Playwright/Cypress

### Backend Testing
- [ ] Unit tests cho services
- [ ] Integration tests cho APIs
- [ ] Load testing cho critical endpoints
- [ ] Security testing

---

## 📚 Documentation Needs

### Technical Docs
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database schema documentation
- [ ] Architecture diagrams
- [ ] Deployment guide

### User Docs
- [ ] User guide
- [ ] API integration guide (cho external developers)
- [ ] Webhook setup guide
- [ ] FAQ

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Redis và RabbitMQ configured
- [ ] Email service configured
- [ ] Captcha service configured
- [ ] Monitoring setup (logs, metrics, alerts)

### Post-deployment
- [ ] Health check endpoints working
- [ ] Smoke tests passed
- [ ] Performance monitoring
- [ ] Error tracking (Sentry?)

---

## 📞 Next Steps

1. **Review plan này với team**
2. **Prioritize tasks** dựa trên business needs
3. **Làm rõ các câu hỏi** trong phần "Vấn đề cần làm rõ"
4. **Setup project management** (Jira, Trello, Linear, etc.)
5. **Bắt đầu với Phase 1** - Immediate Actions

---

## 📊 Progress Tracking

| Phase | Tasks | Completed | In Progress | Not Started |
|-------|-------|-----------|-------------|-------------|
| Phase 0 | 3 | 3 | 0 | 0 |
| Phase 1 | 6 | 6 | 0 | 0 |
| Phase 2 | 2 | 0 | 0 | 2 |
| Phase 3 | 3 | 0 | 0 | 3 |

**Last Updated**: 2026-04-23

**Phase 0 Status**: ✅ COMPLETED (2026-04-22)
**Phase 1 Status**: ✅ COMPLETED (2026-04-23) - 6/6 tasks done (100%)

---

## 🎯 EXECUTION PLAN - CHỐT CUỐI CÙNG

### Thứ tự thực hiện (theo priority):

1. **Phase 0: Foundation** (16h) - BẮT ĐẦU NGAY
   - Remove Plans (2h)
   - Add TicketReply Model (4h)
   - Enhance Verification System (10h)

2. **Phase 1: Core Features** (30h)
   - Bank Accounts CRUD (4h)
   - Notifications UI (6h)
   - Profile Management (12h)
   - Transactions Page (8h)

3. **Phase 1 Extended** (26h)
   - Webhook Logs Detail (6h)
   - Support Tickets Detail (12h)
   - System Settings (8h)

4. **Phase 2: Admin** (16h)
   - Admin Dashboard (16h)

5. **Phase 3: Advanced** (56h)
   - Content Management (20h)
   - Analytics (20h)
   - Webhook Testing (16h)

**Total Estimate**: ~144 giờ (18 ngày làm việc với 8h/ngày)

---

## 🚀 BẮT ĐẦU THỰC HIỆN

Bắt đầu với **Task 0.1: Remove Plans System**
