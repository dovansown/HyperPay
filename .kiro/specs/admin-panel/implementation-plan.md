# Kế Hoạch Triển Khai: Bảng Quản Trị (Admin Panel)

## Tổng Quan

Dự án được chia thành 10 phases với tổng cộng 45 tasks. Mỗi phase tập trung vào một khía cạnh cụ thể của admin panel.

**Ước tính thời gian:** 40-50 giờ
**Độ ưu tiên:** High
**Dependencies:** Backend admin APIs đã sẵn sàng ✅

---

## Phase 1: Foundation & Infrastructure (4-5 giờ)

### Task 1.1: Tạo RequireAdmin Component
- **File:** `web/components/RequireAdmin.tsx`
- **Mô tả:** Component bảo vệ routes admin, kiểm tra role ADMIN
- **Dependencies:** authSlice
- **Ước tính:** 30 phút

### Task 1.2: Cập nhật DashboardHeader
- **File:** `web/components/layout/DashboardHeader.tsx`
- **Mô tả:** Thêm link "Bảng Quản Trị" chỉ hiển thị cho ADMIN
- **Dependencies:** authSlice
- **Ước tính:** 30 phút

### Task 1.3: Tạo AdminLayout Component
- **File:** `web/components/admin/AdminLayout.tsx`
- **Mô tả:** Layout chính cho admin panel với Outlet cho nested routes
- **Dependencies:** RequireAdmin
- **Ước tính:** 1 giờ

### Task 1.4: Tạo AdminSidebar Component
- **File:** `web/components/admin/AdminSidebar.tsx`
- **Mô tả:** Sidebar điều hướng với highlight active, responsive
- **Dependencies:** AdminLayout
- **Ước tính:** 1.5 giờ

### Task 1.5: Thêm Admin Routes vào App.tsx
- **File:** `web/App.tsx`
- **Mô tả:** Định nghĩa tất cả routes admin với RequireAuth + RequireAdmin
- **Dependencies:** AdminLayout, RequireAdmin
- **Ước tính:** 30 phút

### Task 1.6: Thêm Translation Keys
- **File:** `web/context/LanguageContext.tsx`
- **Mô tả:** Thêm tất cả key dịch cho admin panel (Anh + Việt)
- **Dependencies:** None
- **Ước tính:** 1 giờ

---

## Phase 2: Redux State Management (5-6 giờ)

### Task 2.1: Tạo adminUsersSlice
- **File:** `web/store/slices/admin/adminUsersSlice.ts`
- **Mô tả:** State, async thunks cho quản lý người dùng
- **API:** GET /admin/users, PATCH /admin/users/:userId/role
- **Ước tính:** 45 phút

### Task 2.2: Tạo adminPackagesSlice
- **File:** `web/store/slices/admin/adminPackagesSlice.ts`
- **Mô tả:** State, async thunks cho quản lý gói dịch vụ
- **API:** GET /admin/packages, POST /admin/packages, PATCH /admin/packages/:id
- **Ước tính:** 1 giờ

### Task 2.3: Tạo adminBanksSlice
- **File:** `web/store/slices/admin/adminBanksSlice.ts`
- **Mô tả:** State, async thunks cho quản lý ngân hàng
- **API:** GET /admin/banks, POST /admin/banks, PATCH /admin/banks/:id
- **Ước tính:** 45 phút

### Task 2.4: Tạo adminDurationsSlice
- **File:** `web/store/slices/admin/adminDurationsSlice.ts`
- **Mô tả:** State, async thunks cho quản lý thời hạn
- **API:** GET /admin/durations, POST /admin/durations, PATCH /admin/durations/:id, DELETE /admin/durations/:id
- **Ước tính:** 1 giờ

### Task 2.5: Tạo adminUserPackagesSlice
- **File:** `web/store/slices/admin/adminUserPackagesSlice.ts`
- **Mô tả:** State, async thunks cho quản lý gói người dùng
- **API:** GET /admin/user-packages, POST /admin/user-packages/assign, PATCH /admin/user-packages/:id/status
- **Ước tính:** 1 giờ

### Task 2.6: Tạo adminWebhooksSlice
- **File:** `web/store/slices/admin/adminWebhooksSlice.ts`
- **Mô tả:** State, async thunks cho giám sát webhook
- **API:** GET /admin/webhooks
- **Ước tính:** 30 phút

### Task 2.7: Tạo adminTransactionsSlice
- **File:** `web/store/slices/admin/adminTransactionsSlice.ts`
- **Mô tả:** State, async thunks cho giám sát giao dịch
- **API:** GET /admin/transactions
- **Ước tính:** 30 phút

### Task 2.8: Tạo adminSettingsSlice
- **File:** `web/store/slices/admin/adminSettingsSlice.ts`
- **Mô tả:** State, async thunks cho cài đặt hệ thống
- **API:** GET /admin/system-settings, PUT /admin/system-settings
- **Ước tính:** 45 phút

### Task 2.9: Cập nhật Redux Store
- **File:** `web/store/store.ts`
- **Mô tả:** Import và thêm tất cả admin slices vào store
- **Dependencies:** Tất cả admin slices
- **Ước tính:** 15 phút

---

## Phase 3: Shared Admin Components (2-3 giờ)

### Task 3.1: Tạo StatCard Component
- **File:** `web/components/admin/stats/StatCard.tsx`
- **Mô tả:** Thẻ hiển thị số liệu thống kê với icon và trend
- **Dependencies:** Card (tái sử dụng)
- **Ước tính:** 45 phút

### Task 3.2: Tạo RecentActivity Component
- **File:** `web/components/admin/stats/RecentActivity.tsx`
- **Mô tả:** Danh sách hoạt động gần đây
- **Dependencies:** Card (tái sử dụng)
- **Ước tính:** 1 giờ

### Task 3.3: Tạo AdminTable Component (Optional)
- **File:** `web/components/admin/AdminTable.tsx`
- **Mô tả:** Wrapper cho DataTable với styling admin-specific
- **Dependencies:** DataTable (tái sử dụng)
- **Ước tính:** 30 phút

### Task 3.4: Tạo FilterBar Component
- **File:** `web/components/admin/FilterBar.tsx`
- **Mô tả:** Thanh filter chung cho các trang admin
- **Dependencies:** Input, Select (tái sử dụng)
- **Ước tính:** 1 giờ

---

## Phase 4: Admin Dashboard Page (2-3 giờ)

### Task 4.1: Tạo AdminDashboard Page
- **File:** `web/pages/admin/AdminDashboard.tsx`
- **Mô tả:** Trang tổng quan với stats và recent activity
- **Dependencies:** StatCard, RecentActivity, tất cả admin slices
- **Ước tính:** 2-3 giờ

---

## Phase 5: Users Management (3-4 giờ)

### Task 5.1: Tạo AdminUsers Page
- **File:** `web/pages/admin/AdminUsers.tsx`
- **Mô tả:** Trang quản lý người dùng với bảng và filter
- **Dependencies:** adminUsersSlice, DataTable, FilterBar
- **Ước tính:** 2 giờ

### Task 5.2: Tạo UpdateRoleModal Component
- **File:** `web/pages/admin/AdminUsers.tsx` (inline)
- **Mô tả:** Modal cập nhật vai trò người dùng
- **Dependencies:** Modal, Select (tái sử dụng)
- **Ước tính:** 1 giờ

### Task 5.3: Test Users Management
- **Mô tả:** Test CRUD operations, search, filter
- **Ước tính:** 1 giờ

---

## Phase 6: Packages Management (4-5 giờ)

### Task 6.1: Tạo AdminPackages Page
- **File:** `web/pages/admin/AdminPackages.tsx`
- **Mô tả:** Trang quản lý gói dịch vụ với bảng
- **Dependencies:** adminPackagesSlice, DataTable
- **Ước tính:** 1.5 giờ

### Task 6.2: Tạo PackageFormModal Component
- **File:** `web/pages/admin/AdminPackages.tsx` (inline hoặc separate)
- **Mô tả:** Modal form tạo/sửa gói với banks và pricing
- **Dependencies:** Modal, Input, Select (tái sử dụng)
- **Ước tính:** 2.5 giờ

### Task 6.3: Test Packages Management
- **Mô tả:** Test CRUD operations, validation
- **Ước tính:** 1 giờ

---

## Phase 7: Banks & Durations Management (3-4 giờ)

### Task 7.1: Tạo AdminBanks Page
- **File:** `web/pages/admin/AdminBanks.tsx`
- **Mô tả:** Trang quản lý ngân hàng với bảng
- **Dependencies:** adminBanksSlice, DataTable
- **Ước tính:** 1 giờ

### Task 7.2: Tạo BankFormModal Component
- **File:** `web/pages/admin/AdminBanks.tsx` (inline)
- **Mô tả:** Modal form tạo/sửa ngân hàng
- **Dependencies:** Modal, Input (tái sử dụng)
- **Ước tính:** 45 phút

### Task 7.3: Tạo AdminDurations Page
- **File:** `web/pages/admin/AdminDurations.tsx`
- **Mô tả:** Trang quản lý thời hạn với bảng
- **Dependencies:** adminDurationsSlice, DataTable
- **Ước tính:** 1 giờ

### Task 7.4: Tạo DurationFormModal Component
- **File:** `web/pages/admin/AdminDurations.tsx` (inline)
- **Mô tả:** Modal form tạo/sửa thời hạn
- **Dependencies:** Modal, Input (tái sử dụng)
- **Ước tính:** 45 phút

### Task 7.5: Test Banks & Durations
- **Mô tả:** Test CRUD operations
- **Ước tính:** 30 phút

---

## Phase 8: User Packages Management (3-4 giờ)

### Task 8.1: Tạo AdminUserPackages Page
- **File:** `web/pages/admin/AdminUserPackages.tsx`
- **Mô tả:** Trang quản lý gói người dùng với bảng và filter
- **Dependencies:** adminUserPackagesSlice, DataTable, FilterBar
- **Ước tính:** 1.5 giờ

### Task 8.2: Tạo AssignPackageModal Component
- **File:** `web/pages/admin/AdminUserPackages.tsx` (inline)
- **Mô tả:** Modal phân công gói cho người dùng
- **Dependencies:** Modal, Select (tái sử dụng)
- **Ước tính:** 1.5 giờ

### Task 8.3: Tạo UpdateStatusModal Component
- **File:** `web/pages/admin/AdminUserPackages.tsx` (inline)
- **Mô tả:** Modal cập nhật trạng thái gói
- **Dependencies:** Modal, Select (tái sử dụng)
- **Ước tính:** 30 phút

### Task 8.4: Test User Packages Management
- **Mô tả:** Test assign, update status, filter
- **Ước tính:** 30 phút

---

## Phase 9: Monitoring Pages (3-4 giờ)

### Task 9.1: Tạo AdminWebhooks Page
- **File:** `web/pages/admin/AdminWebhooks.tsx`
- **Mô tả:** Trang giám sát webhook với bảng và filter
- **Dependencies:** adminWebhooksSlice, DataTable, FilterBar
- **Ước tính:** 1.5 giờ

### Task 9.2: Tạo AdminTransactions Page
- **File:** `web/pages/admin/AdminTransactions.tsx`
- **Mô tả:** Trang giám sát giao dịch với bảng và filter
- **Dependencies:** adminTransactionsSlice, DataTable, FilterBar
- **Ước tính:** 1.5 giờ

### Task 9.3: Test Monitoring Pages
- **Mô tả:** Test search, filter, pagination
- **Ước tính:** 1 giờ

---

## Phase 10: System Settings (3-4 giờ)

### Task 10.1: Tạo AdminSettings Page
- **File:** `web/pages/admin/AdminSettings.tsx`
- **Mô tả:** Trang cài đặt hệ thống với form
- **Dependencies:** adminSettingsSlice, Input, Select (tái sử dụng)
- **Ước tính:** 2.5 giờ

### Task 10.2: Test System Settings
- **Mô tả:** Test update settings, validation
- **Ước tính:** 30 phút

### Task 10.3: Final Integration Test
- **Mô tả:** Test toàn bộ admin panel, navigation, role check
- **Ước tính:** 1 giờ

---

## Phase 11: Polish & Optimization (2-3 giờ)

### Task 11.1: Responsive Testing
- **Mô tả:** Test trên mobile, tablet, desktop
- **Ước tính:** 1 giờ

### Task 11.2: Performance Optimization
- **Mô tả:** Lazy loading, code splitting, caching
- **Ước tính:** 1 giờ

### Task 11.3: Accessibility Check
- **Mô tả:** Keyboard navigation, screen reader, contrast
- **Ước tính:** 30 phút

### Task 11.4: Documentation
- **Mô tả:** Cập nhật README, thêm comments
- **Ước tính:** 30 phút

---

## Thứ Tự Ưu Tiên Thực Hiện

### Giai đoạn 1: Core Setup (Ngày 1-2)
1. Phase 1: Foundation & Infrastructure
2. Phase 2: Redux State Management
3. Phase 3: Shared Admin Components

### Giai đoạn 2: Main Features (Ngày 3-5)
4. Phase 4: Admin Dashboard
5. Phase 5: Users Management
6. Phase 6: Packages Management

### Giai đoạn 3: Additional Features (Ngày 6-7)
7. Phase 7: Banks & Durations
8. Phase 8: User Packages Management
9. Phase 9: Monitoring Pages

### Giai đoạn 4: Final (Ngày 8)
10. Phase 10: System Settings
11. Phase 11: Polish & Optimization

---

## Checklist Trước Khi Bắt Đầu

- [x] Backend admin APIs đã sẵn sàng
- [x] Requirements document đã được approve
- [x] Design document đã được review
- [ ] Development environment đã setup
- [ ] Git branch mới đã được tạo (`feature/admin-panel`)

---

## Checklist Sau Khi Hoàn Thành

- [ ] Tất cả 45 tasks đã hoàn thành
- [ ] Unit tests đã pass
- [ ] Integration tests đã pass
- [ ] Responsive design đã được test
- [ ] Translation keys đã đầy đủ (Anh + Việt)
- [ ] Code đã được review
- [ ] Documentation đã được cập nhật
- [ ] Performance đã được optimize
- [ ] Accessibility đã được check
- [ ] Ready for merge vào main branch

---

## Notes

- Tái sử dụng component từ `web/components/ui/` để đảm bảo consistency
- Sử dụng `toast` từ `sonner` cho tất cả notifications
- Tuân theo pattern hiện có trong project
- Test trên nhiều trình duyệt (Chrome, Firefox, Safari, Edge)
- Đảm bảo mobile-friendly
