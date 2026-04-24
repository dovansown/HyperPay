# Prompt mô tả màu sắc & bố cục từng component UI

Bạn là **UI/UX Designer + Visual/Design System Specialist**. Hãy mô tả **chi tiết màu sắc + bố cục + style** dựa trên `web/index.css`, `web/tailwind.config.js`, `web/components/ui/` và các màu dùng trong `web/components/` (layout, sections, v.v.).  
Không nhắc hệ thống là gì. Chỉ tập trung **màu (kèm hex/RGBA khi có)**, **bố cục**, **states**, **radius/shadow**, **motion**.

## 1) Bảng màu — nguồn sự thật & ánh xạ

### 1.1 CSS variables (`web/index.css` — `:root`)

| Token CSS | Class Tailwind tương ứng | Hex / giá trị |
|-----------|-------------------------|---------------|
| `--color-primary` | `primary`, `text-primary`, `bg-primary`, `border-primary`, `ring-primary` | **#2ecc71** |
| `--color-primary-dark` | `primary-dark`, `hover:bg-primary-dark`, `to-primary-dark` (gradient) | **#27ae60** |
| `--color-dark` | `dark`, `text-dark`, `bg-dark` | **#1a1a1a** |
| `--color-gray` | `gray`, `text-gray` | **#666666** |
| `--color-light-gray` | `light-gray`, `text-light-gray` | **#999999** |
| `--color-bg` | `bg` (nếu dùng), `body` background | **#e8ebe8** |
| `--color-section-bg` | `section-bg`, `bg-section-bg` | **#f5f8f5** |
| `--color-footer` | `footer`, `bg-footer` | **#1a2820** |

`body`: chữ mặc định = `var(--color-dark)` (**#1a1a1a**), nền = `var(--color-bg)` (**#e8ebe8**).

### 1.2 Ánh xạ trong Tailwind (`web/tailwind.config.js`)

Các màu `primary`, `primary-dark`, `dark`, `gray`, `light-gray`, `bg`, `section-bg`, `footer` đều trỏ tới biến ở mục 1.1 — **dùng class là ra đúng hex trên**.

### 1.3 Opacity phổ biến trên `primary` (cùng nền gốc #2ecc71)

Khi code dùng `primary/5`, `primary/10`, `primary/20`, `primary/30`, `ring-primary/50`… đó là **màu primary với alpha** (Tailwind). Ví dụ diễn giải cho designer/dev:

- `bg-primary/10` — nền xanh nhạt (10% opacity của #2ecc71)
- `bg-primary/20` — đậm hơn một bậc (ví dụ “today” trong DatePicker)
- `shadow-primary/30` — bóng có sắc primary
- `ring-primary/50` — vòng focus quanh Checkbox

### 1.4 Nút CTA gradient (trong `web/components/sections/Features.tsx`)

Nút “Explore more” dùng **`bg-gradient-to-br from-primary to-primary-dark`** → gradient **#2ecc71 → #27ae60**, chữ **trắng**, hover **`hover:opacity-90`**, icon trong vòng tròn **`bg-white/30`**.

### 1.5 `Button` (`web/components/ui/Button.tsx`) — bảng màu đủ hex

| Variant | Nền | Chữ | Viền | Hover | Focus |
|--------|-----|-----|------|-------|-------|
| **primary** | **#2ecc71** (`bg-primary`) | trắng | — | **#27ae60** (`hover:bg-primary-dark`) | `ring-2` màu **#2ecc71** + `ring-offset-2` |
| **outline** | **#ffffff** | **#2ecc71** | **2px #2ecc71** | nền **~#f9fafb** (`hover:bg-gray-50`, Tailwind mặc định) | như trên |
| **ghost** | transparent | **~#374151** (`text-gray-700`, Tailwind mặc định) | — | nền **~#f3f4f6** (`hover:bg-gray-100`) | như trên |
| **white** | **#ffffff** | **#1a3d2e** (hard-coded) | — | **~#f3f4f6** (`hover:bg-gray-100`) | như trên |

Ghi chú: Navbar có override ghost login: `text-[#4a4a4a]` — vẫn là nút **ghost** nhưng chữ **#4a4a4a** thay vì gray-700.

### 1.6 Màu hex / utility bổ sung trong `web/components/` (không nằm trong `:root`)

| Vị trí / mục đích | Giá trị |
|-------------------|---------|
| Viền neutral dùng chung | `#e8e8e8` |
| Viền nhạt (Partners) | `#f0f0f0` |
| Link nav (desktop) | `#4a4a4a`, hover → `primary` (**#2ecc71**) |
| Newsletter section | gradient `from-[#1a3d2e] to-[#2d5a45]`, phụ `#a8c8b8` |
| Hero — thẻ mockup | gradient lá `#c8e6d0`→`#d8f0e0`, `#b5ddc4`→`#c8e8d4`; chữ `#2d5a3d`, phụ `#4a6a54`; chip vàng `#f4d03f`→`#e6b800` |
| Features — khối nền mockup | `#f2f7f6` |
| Features — ô icon nhỏ | `#f0e6ff`, `#ffe6f0`, `#e6f0ff` |
| Features — biểu đồ SVG | fill/stroke **#2ecc71**, **#1a1a1a** (đúng hex trong file) |
| Finance — cột chart / gradient line | `#e8f5ee`, `primary` **#2ecc71**, line `to-[#a8e6c1]` |
| Footer — chữ meta | `#888` |
| Footer — icon social nền | `#2a3a30`, hover `bg-primary` (**#2ecc71**) |
| Dashboard popover (header) | `shadow-[0_4px_20px_rgba(0,0,0,0.08)]` |
| Trạng thái “success / active” (pages dùng chung pattern) | `bg-[#e8f5ee] text-primary` |

### 1.7 Danger & đỏ (Tailwind 3.4 mặc định — không override trong repo)

| Class | Hex (tham khảo) |
|-------|-----------------|
| `red-50` | #fef2f2 |
| `red-500` | #ef4444 |
| `red-600` | #dc2626 |

Dùng trong PopConfirm, Features (số chi tiêu), v.v.

## 2) Hình khối (radius) & bóng (shadow)
Ghi rõ theo nhóm component:
- **Pill**: `rounded-full` (Button, Input)
- **Card**: `rounded-[20px]` + shadow nhẹ
- **Modal**: `rounded-2xl` + `shadow-xl`
- **Drawer panel**: không bo đặc biệt ở code, nhưng dùng panel trắng + `shadow-2xl`
- **Popover**: `rounded-xl` + `shadow-xl`
- **Dropdown menu**: `rounded-lg` + `shadow-lg`
- **DatePicker / PopConfirm panel**: `rounded-2xl` + shadow “20/60”
- **Checkbox**: `rounded-[4px]`
- **Switch**: `rounded-full`

## 3) Typography & spacing (trích đúng từ code)

### 3.1 Cỡ chữ (theo usage)
- **11px**: Dropdown trigger
- **12px**: DataTable header (uppercase + tracking), DatePicker weekday labels
- **13px**: DatePicker trigger, DataTable empty
- **14px**: DatePicker day, PopConfirm description, button ghost tại DatePicker/PopConfirm
- **15px**: Button md, Input, Newsletter subtitle
- **16px**: DatePicker month/year
- **18px**: Modal/Drawer title, PopConfirm title
- **36px**: Newsletter heading

### 3.2 Spacing/bố cục quan sát được
- **Section lớn**: `py-20`
- **Khối trung tâm**: `max-w-[800px] mx-auto px-10`
- **Form (Newsletter)**: `max-w-[480px]`, wrapper `p-1`, responsive `flex-col` → `sm:flex-row`

## 4) Spec chi tiết từng component (bắt buộc theo format)
Với mỗi component dưới đây, hãy viết theo đúng 6 mục:
1) **Anatomy**  
2) **Layout & sizing**  
3) **Màu sắc & states** (default/hover/focus/disabled/selected)  
4) **Border/radius/shadow**  
5) **Motion** (nếu có)  
6) **A11y tối thiểu**

### 4.1 `Button` (`web/components/ui/Button.tsx`)
- **Anatomy**: inline-flex, center, label + icon
- **Layout & sizing**:
  - sm: `px-4 py-2 text-sm`
  - md: `px-6 py-2.5 text-[15px]`
  - lg: `px-8 py-3.5 text-base`
  - icon: `p-2`
- **Màu sắc & states** (hex đầy đủ: xem **mục 1.5**):
  - **primary**: nền **#2ecc71**, hover **#27ae60**, chữ trắng, focus ring **#2ecc71**
  - **outline**: viền & chữ **#2ecc71**, nền trắng, hover nền xám rất nhạt (`gray-50`)
  - **ghost**: chữ `gray-700` (~#374151), hover nền `gray-100`; có thể override chữ (vd. Navbar `#4a4a4a`)
  - **white**: chữ **#1a3d2e**, nền trắng, hover `gray-100`
- **Border/radius/shadow**: `rounded-full`, `transition-colors`
- **Motion**: không có motion riêng
- **A11y**: `focus:ring-2 focus:ring-primary focus:ring-offset-2`

### 4.2 `Input` (`web/components/ui/Input.tsx`)
- **Anatomy**: input 1 dòng
- **Layout & sizing**: `w-full rounded-full px-6 py-4 text-[15px]`
- **Màu sắc & states**:
  - default: `bg-white`
  - placeholder: `placeholder:text-[#a8c8b8]`
  - focus: `focus-visible:ring-2 focus-visible:ring-primary`
  - disabled: `opacity-50 cursor-not-allowed`
- **Border/radius/shadow**: pill, không border mặc định trong class gốc
- **Motion**: không
- **A11y**: đảm bảo label/aria-label ở nơi dùng

### 4.3 `Card` (`web/components/ui/Card.tsx`)
- **Anatomy**: container
- **Layout & sizing**: tuỳ content
- **Màu sắc & states**: `bg-white`
- **Border/radius/shadow**: `rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)]`
- **Motion**: không
- **A11y**: dùng heading/landmark đúng ngữ nghĩa ở nơi chứa

### 4.4 `DataTable` (`web/components/ui/DataTable.tsx`)
- **Anatomy**: table wrapper (scroll x), thead/tbody, footer pagination
- **Layout & sizing**:
  - header cells: `px-6 py-4`
  - body cells: `px-6 py-4`
  - footer: `p-4`
- **Màu sắc & states**:
  - header row: `bg-gray-50/50`, border `#e8e8e8`
  - header text: `text-gray` → token **#666666**, sortable hover `hover:text-dark` → **#1a1a1a**
  - sort icon: idle `text-gray-300` (Tailwind mặc định), active `text-dark` → **#1a1a1a**
  - row hover: `hover:bg-gray-50/50`
  - empty: `text-[13px] text-gray`
  - pagination controls: border `#e8e8e8`, hover `bg-gray-50`, disabled `opacity-50`
- **Border/radius/shadow**: bảng border theo hàng; nút/selext radius md
- **Motion**: không
- **A11y**: header clickable cần role/aria-sort (đề xuất bổ sung khi implement)

### 4.5 `Modal` (`web/components/ui/Modal.tsx`)
- **Anatomy**: overlay + dialog + header(title/close) + body
- **Layout & sizing**: `max-w-md`, `mx-4`, header `px-6 py-4`, body `p-6`
- **Màu sắc & states**:
  - overlay: `bg-black/40 backdrop-blur-sm`
  - dialog: `bg-white`
  - divider: `border-[#e8e8e8]`
  - close hover: `hover:bg-gray-100 text-gray`
- **Border/radius/shadow**: `rounded-2xl shadow-xl`
- **Motion**: overlay fade 0.2s; dialog fade+scale+y (0.2s)
- **A11y**: cần focus trap + escape to close (đề xuất bổ sung)

### 4.6 `Drawer` (`web/components/ui/Drawer.tsx`)
- **Anatomy**: overlay + side panel + header + scroll body
- **Layout & sizing**: panel `w-full max-w-md h-full`, header `px-6 py-5`, body `p-6`
- **Màu sắc & states**: overlay `bg-black/40 backdrop-blur-sm`, divider `#e8e8e8`, close hover `bg-gray-100`
- **Border/radius/shadow**: panel `shadow-2xl`
- **Motion**: slide-in spring (damping 25, stiffness 200)
- **A11y**: focus management/escape (đề xuất bổ sung)

### 4.7 `Popover` (`web/components/ui/Popover.tsx`)
- **Anatomy**: trigger + floating panel
- **Layout & sizing**: `min-w-[180px] p-2 mt-2`, align left/right
- **Màu sắc & states**: panel `bg-white border-[#e8e8e8]`
- **Border/radius/shadow**: `rounded-xl shadow-xl`
- **Motion**: fade+y+scale 0.15s
- **A11y**: đóng khi click outside đã có; cần keyboard mở/đóng (đề xuất)

### 4.8 `Dropdown` (`web/components/ui/Dropdown.tsx`)
- **Anatomy**: trigger text + chevron + menu list
- **Layout & sizing**: menu `w-32`, item `px-3 py-2`
- **Màu sắc & states**:
  - trigger: `text-[11px] text-gray hover:text-dark`
  - menu: `bg-white border-[#e8e8e8] shadow-lg`
  - selected: `bg-primary/10 text-primary`
  - hover item: `hover:bg-gray-50`
- **Border/radius/shadow**: `rounded-lg`
- **Motion**: không
- **A11y**: cần role=listbox/option nếu dùng như select (đề xuất)

### 4.9 `DatePicker` (`web/components/ui/DatePicker.tsx`)
- **Anatomy**: trigger button + full-screen overlay + calendar panel
- **Layout & sizing**:
  - trigger: `px-4 py-2 rounded-xl`
  - panel: `max-w-[320px] p-6`
  - day cell: `w-9 h-9 rounded-xl`
- **Màu sắc & states**:
  - overlay: `bg-black/40 backdrop-blur-[2px]`
  - panel: `bg-white border-[#e8e8e8] shadow-[0_20px_60px_rgba(0,0,0,0.15)]`
  - selected day: `bg-primary text-white shadow-primary/30 scale-110`
  - today: `bg-primary/10 text-primary hover:bg-primary/20`
  - hover: `hover:bg-gray-50 hover:scale-105`
- **Border/radius/shadow**: `rounded-2xl`
- **Motion**: spring (damping 25, stiffness 300) fade+scale+y
- **A11y**: điều hướng bằng phím (đề xuất), aria-label cho ngày

### 4.10 `Checkbox` (`web/components/ui/Checkbox.tsx`)
- **Anatomy**: hidden input (peer) + box + check icon
- **Layout & sizing**: box `18px`, icon `12px`
- **Màu sắc & states**:
  - default: `border-[#d1d1d1] bg-white`
  - hover: border → primary
  - focus: `ring-primary/50`
  - checked: `bg-primary border-primary` + icon hiện
- **Border/radius/shadow**: radius 4px
- **Motion**: icon opacity transition
- **A11y**: input thật vẫn tồn tại (sr-only), cần label text ở nơi dùng

### 4.11 `Switch` (`web/components/ui/Switch.tsx`)
- **Anatomy**: track + thumb
- **Layout & sizing**: track `h-5 w-9`, thumb `h-4 w-4`
- **Màu sắc & states**: checked `bg-primary`, unchecked `bg-gray-200`
- **Border/radius/shadow**: rounded-full, thumb shadow
- **Motion**: translate thumb (duration 200ms)
- **A11y**: có `role="switch"` + `aria-checked`

### 4.12 `PopConfirm` (`web/components/ui/PopConfirm.tsx`)
- **Anatomy**: overlay + panel + icon badge + title/description + actions
- **Layout & sizing**: panel `max-w-[320px] p-6`, action stack dọc
- **Màu sắc & states**:
  - overlay: `bg-black/40 backdrop-blur-[2px]`
  - panel: `bg-white border-[#e8e8e8] shadow-[0_20px_60px_rgba(0,0,0,0.15)]`
  - danger icon badge: `bg-red-50 text-red-500`
  - danger ok button: `bg-red-500 hover:bg-red-600 shadow-red-500/20`
  - cancel: ghost `text-gray hover:text-dark hover:bg-gray-50`
- **Border/radius/shadow**: `rounded-2xl`
- **Motion**: spring fade+scale+y (damping 25, stiffness 300)
- **A11y**: escape + focus trap (đề xuất bổ sung)

## 5) Ràng buộc đầu ra
- Luôn tham chiếu **mục 1** cho mọi màu token; không tự đặt hex khác cho `primary` / `dark` / `gray` nếu không có trong code.
- Với component UI, giữ đúng class trong file nguồn; khi mô tả cho designer, **chuyển class → hex** theo bảng 1.1 và 1.5.
