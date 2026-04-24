# Tài Liệu Thiết Kế: Bảng Quản Trị (Admin Panel)

## 1. Kiến Trúc Tổng Thể

### 1.1 Cấu Trúc Thư Mục

```
web/
├── components/
│   ├── admin/                    # Component riêng cho admin
│   │   ├── AdminLayout.tsx       # Layout chính cho admin panel
│   │   ├── AdminSidebar.tsx      # Sidebar điều hướng admin
│   │   └── stats/                # Component thống kê
│   │       ├── StatCard.tsx      # Thẻ hiển thị số liệu
│   │       └── RecentActivity.tsx # Hoạt động gần đây
│   ├── layout/
│   │   └── DashboardHeader.tsx   # CẬP NHẬT: Thêm link Admin Panel
│   └── ui/                       # Component UI tái sử dụng (đã có)
│       ├── Modal.tsx
│       ├── DataTable.tsx
│       ├── Card.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       └── Badge.tsx
├── pages/
│   └── admin/                    # Tất cả trang admin
│       ├── AdminDashboard.tsx    # Tổng quan
│       ├── AdminUsers.tsx        # Quản lý người dùng
│       ├── AdminPackages.tsx     # Quản lý gói dịch vụ
│       ├── AdminBanks.tsx        # Quản lý ngân hàng
│       ├── AdminDurations.tsx    # Quản lý thời hạn
│       ├── AdminUserPackages.tsx # Quản lý gói người dùng
│       ├── AdminWebhooks.tsx     # Giám sát webhook
│       ├── AdminTransactions.tsx # Giám sát giao dịch
│       └── AdminSettings.tsx     # Cài đặt hệ thống
├── store/
│   └── slices/
│       ├── admin/                # Redux slices cho admin
│       │   ├── adminUsersSlice.ts
│       │   ├── adminPackagesSlice.ts
│       │   ├── adminBanksSlice.ts
│       │   ├── adminDurationsSlice.ts
│       │   ├── adminUserPackagesSlice.ts
│       │   ├── adminWebhooksSlice.ts
│       │   ├── adminTransactionsSlice.ts
│       │   └── adminSettingsSlice.ts
│       └── authSlice.ts          # CẬP NHẬT: Đã có role check
└── App.tsx                       # CẬP NHẬT: Thêm admin routes
```

### 1.2 Component Hierarchy

```
App
└── Router
    └── RequireAuth + RequireAdmin
        └── AdminLayout
            ├── AdminSidebar
            └── Outlet (Admin Pages)
                ├── AdminDashboard
                ├── AdminUsers
                ├── AdminPackages
                ├── AdminBanks
                ├── AdminDurations
                ├── AdminUserPackages
                ├── AdminWebhooks
                ├── AdminTransactions
                └── AdminSettings
```

### 1.3 Data Flow

```
Component → Dispatch Action → Async Thunk → API Call → Update State → Re-render
     ↑                                                         ↓
     └─────────────────── useAppSelector ←───────────────────┘
```

## 2. Component Design

### 2.1 Component Tái Sử Dụng (Đã Có)

| Component | Path | Mục Đích |
|-----------|------|----------|
| Modal | `web/components/ui/Modal.tsx` | Dialog, popup, form modal |
| DataTable | `web/components/DataTable.tsx` | Bảng dữ liệu với pagination |
| Card | `web/components/ui/Card.tsx` | Thẻ thông tin, container |
| Button | `web/components/ui/Button.tsx` | Nút bấm, actions |
| Input | `web/components/ui/Input.tsx` | Trường nhập liệu |
| Select | `web/components/ui/Select.tsx` | Dropdown, combobox |
| Badge | `web/components/ui/Badge.tsx` | Nhãn trạng thái |
| LoadingSpinner | `web/components/ui/LoadingSpinner.tsx` | Loading state |

### 2.2 Component Mới Cần Tạo

#### AdminLayout.tsx
```typescript
interface AdminLayoutProps {
  children: React.ReactNode;
}

// Bố cục chính với sidebar và content area
// Responsive: sidebar collapse trên mobile
```

#### AdminSidebar.tsx
```typescript
interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

// Sidebar điều hướng với highlight active item
// Mobile: hamburger menu
```

#### StatCard.tsx
```typescript
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
}

// Thẻ hiển thị số liệu thống kê
```

#### RecentActivity.tsx
```typescript
interface Activity {
  id: string;
  type: 'user' | 'transaction' | 'webhook';
  description: string;
  timestamp: string;
}

// Danh sách hoạt động gần đây
```

## 3. Redux State Design

### 3.1 Admin Users Slice

```typescript
interface AdminUsersState {
  users: {
    items: User[];
    total: number;
    limit: number;
    offset: number;
  };
  loading: boolean;
  error: string | null;
}

// Async Thunks:
// - fetchAdminUsers(query: AdminListQuery)
// - updateUserRole(userId: string, role: UserRole)
```

### 3.2 Admin Packages Slice

```typescript
interface AdminPackagesState {
  packages: {
    items: Package[];
    total: number;
    limit: number;
    offset: number;
  };
  loading: boolean;
  error: string | null;
}

// Async Thunks:
// - fetchAdminPackages(query: AdminListQuery)
// - createPackage(data: CreatePackageInput)
// - updatePackage(id: string, data: UpdatePackageInput)
```

### 3.3 Admin Banks Slice

```typescript
interface AdminBanksState {
  banks: {
    items: Bank[];
    total: number;
    limit: number;
    offset: number;
  };
  loading: boolean;
  error: string | null;
}

// Async Thunks:
// - fetchAdminBanks(query: AdminListQuery)
// - createBank(data: CreateBankInput)
// - updateBank(id: string, data: UpdateBankInput)
```

### 3.4 Admin Durations Slice

```typescript
interface AdminDurationsState {
  durations: Duration[];
  loading: boolean;
  error: string | null;
}

// Async Thunks:
// - fetchAdminDurations()
// - createDuration(data: CreateDurationInput)
// - updateDuration(id: string, data: UpdateDurationInput)
// - deleteDuration(id: string)
```

### 3.5 Admin User Packages Slice

```typescript
interface AdminUserPackagesState {
  userPackages: {
    items: UserPackage[];
    total: number;
    limit: number;
    offset: number;
  };
  loading: boolean;
  error: string | null;
}

// Async Thunks:
// - fetchAdminUserPackages(query: AdminListQuery)
// - assignUserPackage(data: AssignUserPackageInput)
// - updateUserPackageStatus(id: string, status: string)
```

### 3.6 Admin Webhooks Slice

```typescript
interface AdminWebhooksState {
  webhooks: {
    items: Webhook[];
    total: number;
    limit: number;
    offset: number;
  };
  loading: boolean;
  error: string | null;
}

// Async Thunks:
// - fetchAdminWebhooks(query: AdminListQuery)
```

### 3.7 Admin Transactions Slice

```typescript
interface AdminTransactionsState {
  transactions: {
    items: Transaction[];
    total: number;
    limit: number;
    offset: number;
  };
  loading: boolean;
  error: string | null;
}

// Async Thunks:
// - fetchAdminTransactions(query: AdminListQuery)
```

### 3.8 Admin Settings Slice

```typescript
interface AdminSettingsState {
  settings: SystemSettings | null;
  loading: boolean;
  error: string | null;
}

// Async Thunks:
// - fetchSystemSettings()
// - updateSystemSettings(data: SystemSettingsInput)
```

## 4. Routing Design

### 4.1 Admin Routes

```typescript
// Trong App.tsx
<Route path="/admin" element={<RequireAuth><RequireAdmin><AdminLayout /></RequireAdmin></RequireAuth>}>
  <Route index element={<AdminDashboard />} />
  <Route path="users" element={<AdminUsers />} />
  <Route path="packages" element={<AdminPackages />} />
  <Route path="banks" element={<AdminBanks />} />
  <Route path="durations" element={<AdminDurations />} />
  <Route path="user-packages" element={<AdminUserPackages />} />
  <Route path="webhooks" element={<AdminWebhooks />} />
  <Route path="transactions" element={<AdminTransactions />} />
  <Route path="settings" element={<AdminSettings />} />
</Route>
```

### 4.2 RequireAdmin Component

```typescript
// web/components/RequireAdmin.tsx
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
}
```

## 5. API Integration

### 5.1 API Endpoints Mapping

| Frontend Action | Backend Endpoint | Method | Mục Đích |
|----------------|------------------|--------|----------|
| fetchAdminUsers | `/admin/users` | GET | Lấy danh sách người dùng |
| updateUserRole | `/admin/users/:userId/role` | PATCH | Cập nhật vai trò |
| fetchAdminPackages | `/admin/packages` | GET | Lấy danh sách gói |
| createPackage | `/admin/packages` | POST | Tạo gói mới |
| updatePackage | `/admin/packages/:id` | PATCH | Cập nhật gói |
| fetchAdminBanks | `/admin/banks` | GET | Lấy danh sách ngân hàng |
| createBank | `/admin/banks` | POST | Tạo ngân hàng mới |
| updateBank | `/admin/banks/:id` | PATCH | Cập nhật ngân hàng |
| fetchAdminDurations | `/admin/durations` | GET | Lấy danh sách thời hạn |
| createDuration | `/admin/durations` | POST | Tạo thời hạn mới |
| updateDuration | `/admin/durations/:id` | PATCH | Cập nhật thời hạn |
| deleteDuration | `/admin/durations/:id` | DELETE | Xóa thời hạn |
| fetchAdminUserPackages | `/admin/user-packages` | GET | Lấy danh sách gói người dùng |
| assignUserPackage | `/admin/user-packages/assign` | POST | Phân công gói |
| updateUserPackageStatus | `/admin/user-packages/:id/status` | PATCH | Cập nhật trạng thái |
| fetchAdminWebhooks | `/admin/webhooks` | GET | Lấy danh sách webhook |
| fetchAdminTransactions | `/admin/transactions` | GET | Lấy danh sách giao dịch |
| fetchSystemSettings | `/admin/system-settings` | GET | Lấy cài đặt hệ thống |
| updateSystemSettings | `/admin/system-settings` | PUT | Cập nhật cài đặt |

### 5.2 Query Parameters

```typescript
interface AdminListQuery {
  limit?: number;        // Số mục mỗi trang (default: 25)
  offset?: number;       // Vị trí bắt đầu (default: 0)
  q?: string;           // Tìm kiếm chung
  role?: UserRole;      // Lọc theo vai trò (users)
  status?: string;      // Lọc theo trạng thái
  user_id?: string;     // Lọc theo người dùng
  package_id?: string;  // Lọc theo gói
  from?: Date;          // Từ ngày (transactions)
  to?: Date;            // Đến ngày (transactions)
  tx_type?: 'IN' | 'OUT'; // Loại giao dịch
}
```

## 6. Translation Keys

### 6.1 Navigation & Layout

```typescript
admin: {
  title: 'Bảng Quản Trị',
  dashboard: 'Tổng Quan',
  users: 'Người Dùng',
  packages: 'Gói Dịch Vụ',
  banks: 'Ngân Hàng',
  durations: 'Thời Hạn',
  userPackages: 'Gói Người Dùng',
  webhooks: 'Webhook',
  transactions: 'Giao Dịch',
  settings: 'Cài Đặt',
  backToDashboard: 'Quay Lại Dashboard',
}
```

### 6.2 Dashboard Stats

```typescript
admin: {
  stats: {
    totalUsers: 'Tổng Người Dùng',
    activePackages: 'Gói Đang Hoạt Động',
    totalTransactions: 'Tổng Giao Dịch',
    activeWebhooks: 'Webhook Hoạt Động',
    recentUsers: 'Người Dùng Mới',
    recentTransactions: 'Giao Dịch Gần Đây',
  }
}
```

### 6.3 Users Management

```typescript
admin: {
  users: {
    title: 'Quản Lý Người Dùng',
    email: 'Email',
    fullName: 'Họ Tên',
    role: 'Vai Trò',
    createdAt: 'Ngày Tạo',
    updateRole: 'Cập Nhật Vai Trò',
    roleUpdated: 'Đã cập nhật vai trò thành công',
    searchPlaceholder: 'Tìm theo email hoặc tên...',
  }
}
```

### 6.4 Packages Management

```typescript
admin: {
  packages: {
    title: 'Quản Lý Gói Dịch Vụ',
    createPackage: 'Tạo Gói Mới',
    editPackage: 'Chỉnh Sửa Gói',
    name: 'Tên Gói',
    status: 'Trạng Thái',
    price: 'Giá (VNĐ)',
    maxTransactions: 'Giới Hạn Giao Dịch',
    maxWebhooks: 'Giới Hạn Webhook',
    banks: 'Ngân Hàng',
    pricing: 'Bảng Giá',
    packageCreated: 'Đã tạo gói thành công',
    packageUpdated: 'Đã cập nhật gói thành công',
  }
}
```

### 6.5 Banks Management

```typescript
admin: {
  banks: {
    title: 'Quản Lý Ngân Hàng',
    createBank: 'Thêm Ngân Hàng',
    editBank: 'Chỉnh Sửa Ngân Hàng',
    name: 'Tên Ngân Hàng',
    code: 'Mã Ngân Hàng',
    iconUrl: 'URL Icon',
    bankCreated: 'Đã thêm ngân hàng thành công',
    bankUpdated: 'Đã cập nhật ngân hàng thành công',
  }
}
```

### 6.6 Common Actions

```typescript
admin: {
  actions: {
    create: 'Tạo Mới',
    edit: 'Chỉnh Sửa',
    delete: 'Xóa',
    save: 'Lưu',
    cancel: 'Hủy',
    search: 'Tìm Kiếm',
    filter: 'Lọc',
    export: 'Xuất',
    refresh: 'Làm Mới',
  }
}
```

## 7. Responsive Design Strategy

### 7.1 Breakpoints

```typescript
// Tailwind breakpoints
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
```

### 7.2 Layout Behavior

| Screen Size | Sidebar | Table | Form | Stats |
|-------------|---------|-------|------|-------|
| < 768px | Hamburger menu | Horizontal scroll | Stack vertical | 1 column |
| 768px - 1024px | Collapsed | Full width | 2 columns | 2 columns |
| > 1024px | Expanded | Full width | 2-3 columns | 4 columns |

## 8. Performance Considerations

### 8.1 Data Caching

- Cache dữ liệu trong Redux để tránh gọi API lại không cần thiết
- Invalidate cache khi có thay đổi (create, update, delete)
- Sử dụng `staleTime` cho các dữ liệu ít thay đổi (banks, durations)

### 8.2 Pagination

- Default page size: 25 items
- Options: 10, 25, 50, 100
- Server-side pagination với offset/limit
- Hiển thị loading state khi chuyển trang

### 8.3 Lazy Loading

- Lazy load admin routes để giảm bundle size
- Code splitting cho từng admin page
- Preload data khi hover vào navigation item

## 9. Security Considerations

### 9.1 Role-Based Access Control

- Kiểm tra role ở cả frontend và backend
- Redirect về dashboard nếu không phải ADMIN
- Hiển thị toast error khi truy cập không được phép

### 9.2 API Token

- Gửi token trong header Authorization
- Refresh token khi hết hạn
- Logout và redirect về login nếu token invalid

## 10. Testing Strategy

### 10.1 Unit Tests

- Test Redux slices (reducers, async thunks)
- Test utility functions
- Test component logic (không test UI)

### 10.2 Integration Tests

- Test API integration
- Test routing và navigation
- Test role-based access control

### 10.3 E2E Tests (Optional)

- Test complete user flows
- Test CRUD operations
- Test error handling
