# Tài Liệu Yêu Cầu: Bảng Quản Trị (Admin Panel)

## Giới Thiệu

Tính năng Bảng Quản Trị cung cấp giao diện quản trị toàn diện để quản lý ứng dụng web HyperPay. Tính năng này cho phép người dùng có vai trò ADMIN quản lý người dùng, gói dịch vụ, ngân hàng, thời hạn, gói người dùng, webhook, giao dịch và cài đặt hệ thống thông qua giao diện web chuyên dụng. Bảng quản trị tích hợp với các API backend hiện có tại endpoint `/admin/*` và cung cấp cấu trúc điều hướng riêng biệt với dashboard người dùng thông thường.

## Thuật Ngữ

- **Admin_Panel** (Bảng Quản Trị): Giao diện quản trị web chỉ có thể truy cập bởi người dùng có vai trò ADMIN
- **Dashboard_Header** (Thanh Đầu Dashboard): Component điều hướng hiển thị ở đầu dashboard người dùng
- **Admin_Layout** (Bố Cục Admin): Component bố cục bao bọc tất cả các trang admin với điều hướng chuyên dụng
- **User_Role** (Vai Trò Người Dùng): Liệt kê các cấp độ quyền của người dùng (USER, AUTHOR, EDITOR, ADMIN)
- **Package** (Gói Dịch Vụ): Gói đăng ký xác định giới hạn giao dịch, giới hạn gửi webhook và quyền truy cập loại ngân hàng
- **Duration** (Thời Hạn): Tùy chọn thời gian cho gói dịch vụ (ví dụ: 1 tháng, 3 tháng, 12 tháng) với giảm giá tùy chọn
- **User_Package** (Gói Người Dùng): Phân công gói dịch vụ cho người dùng với ngày bắt đầu, ngày kết thúc và trạng thái
- **Bank** (Ngân Hàng): Tổ chức tài chính mà người dùng có thể kết nối tài khoản
- **Webhook**: Endpoint HTTP do người dùng cấu hình để nhận thông báo giao dịch
- **Transaction** (Giao Dịch): Bản ghi giao dịch ngân hàng liên kết với tài khoản ngân hàng của người dùng
- **System_Settings** (Cài Đặt Hệ Thống): Cấu hình toàn ứng dụng bao gồm SMTP, giới hạn tốc độ và mặc định thông báo
- **Auth_State** (Trạng Thái Xác Thực): Trạng thái Redux chứa thông tin người dùng đã xác thực bao gồm vai trò
- **Toast_Notification** (Thông Báo Toast): Thông báo UI tạm thời hiển thị bằng thư viện sonner
- **i18n** (Đa Ngôn Ngữ): Hệ thống quốc tế hóa hỗ trợ tiếng Anh và tiếng Việt

## Yêu Cầu

### Yêu Cầu 1: Kiểm Soát Truy Cập Bảng Quản Trị

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn bảng quản trị chỉ có thể truy cập bởi người dùng có vai trò ADMIN, để người dùng không được phép không thể truy cập các chức năng quản trị.

#### Tiêu Chí Chấp Nhận

1. KHI người dùng có vai trò ADMIN được xác thực, THÌ Dashboard_Header PHẢI hiển thị liên kết điều hướng "Bảng Quản Trị"
2. KHI người dùng không có vai trò ADMIN được xác thực, THÌ Dashboard_Header KHÔNG ĐƯỢC hiển thị liên kết điều hướng "Bảng Quản Trị"
3. KHI người dùng chưa xác thực cố gắng truy cập route admin, THÌ Ứng Dụng PHẢI chuyển hướng đến trang đăng nhập
4. KHI người dùng đã xác thực nhưng không có vai trò ADMIN cố gắng truy cập route admin, THÌ Ứng Dụng PHẢI chuyển hướng đến dashboard với thông báo toast lỗi
5. Admin_Panel PHẢI xác minh vai trò người dùng từ Auth_State trước khi render bất kỳ nội dung admin nào

### Yêu Cầu 2: Cấu Trúc Điều Hướng Bảng Quản Trị

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn có cấu trúc điều hướng chuyên dụng cho bảng quản trị, để tôi có thể dễ dàng truy cập các chức năng quản trị khác nhau.

#### Tiêu Chí Chấp Nhận

1. Admin_Layout PHẢI hiển thị thanh điều hướng bên với liên kết đến tất cả các trang admin
2. Admin_Layout PHẢI làm nổi bật mục điều hướng đang hoạt động hiện tại
3. Admin_Layout PHẢI responsive và hiển thị điều hướng thân thiện với mobile trên màn hình nhỏ
4. Admin_Layout PHẢI bao gồm liên kết để quay lại dashboard người dùng
5. Admin_Layout PHẢI hiển thị tên và vai trò của người dùng admin trong header
6. Admin_Layout PHẢI hỗ trợ cả tiếng Anh và tiếng Việt thông qua i18n
7. Admin_Layout PHẢI có giao diện khác biệt rõ ràng với bố cục dashboard người dùng thông thường

### Yêu Cầu 3: Giao Diện Quản Lý Người Dùng

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn quản lý tài khoản và vai trò người dùng, để tôi có thể kiểm soát quyền và cấp độ truy cập của người dùng.

#### Tiêu Chí Chấp Nhận

1. KHI admin xem trang người dùng, THÌ Hệ Thống PHẢI hiển thị danh sách phân trang tất cả người dùng
2. Users_List PHẢI hiển thị email, họ tên, vai trò và ngày tạo của mỗi người dùng
3. Users_List PHẢI hỗ trợ tìm kiếm theo email hoặc họ tên
4. Users_List PHẢI hỗ trợ lọc theo vai trò (USER, AUTHOR, EDITOR, ADMIN)
5. KHI admin cập nhật vai trò người dùng, THÌ Hệ Thống PHẢI gửi request PATCH đến `/admin/users/:userId/role`
6. KHI cập nhật vai trò thành công, THÌ Hệ Thống PHẢI hiển thị Toast_Notification thành công
7. KHI cập nhật vai trò thất bại, THÌ Hệ Thống PHẢI hiển thị Toast_Notification lỗi với thông báo lỗi
8. Users_List PHẢI tự động làm mới sau khi cập nhật vai trò thành công

### Yêu Cầu 4: Giao Diện Quản Lý Gói Dịch Vụ

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn tạo và quản lý các gói đăng ký, để tôi có thể định nghĩa giá và giới hạn cho các cấp dịch vụ khác nhau.

#### Tiêu Chí Chấp Nhận

1. KHI admin xem trang gói dịch vụ, THÌ Hệ Thống PHẢI hiển thị danh sách tất cả gói với giá và giới hạn
2. Packages_List PHẢI hiển thị tên gói, trạng thái, giá, giới hạn giao dịch, giới hạn webhook và ngân hàng liên kết
3. KHI admin tạo gói mới, THÌ Hệ Thống PHẢI xác thực tất cả trường bắt buộc trước khi gửi
4. KHI admin tạo gói, THÌ Hệ Thống PHẢI gửi request POST đến `/admin/packages` với chi tiết gói, liên kết ngân hàng và giá theo thời hạn
5. KHI admin cập nhật gói, THÌ Hệ Thống PHẢI gửi request PATCH đến `/admin/packages/:id`
6. KHI thao tác gói thành công, THÌ Hệ Thống PHẢI hiển thị Toast_Notification thành công
7. KHI thao tác gói thất bại, THÌ Hệ Thống PHẢI hiển thị Toast_Notification lỗi
8. Package_Form PHẢI hỗ trợ chọn nhiều ngân hàng với giới hạn tài khoản riêng
9. Package_Form PHẢI hỗ trợ định nghĩa giá cho nhiều thời hạn
10. Package_Form PHẢI hỗ trợ bật áp dụng giảm giá tự động dựa trên giảm giá mặc định của thời hạn

### Yêu Cầu 5: Giao Diện Quản Lý Ngân Hàng

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn quản lý danh sách ngân hàng được hỗ trợ, để người dùng có thể kết nối tài khoản từ các tổ chức tài chính có sẵn.

#### Tiêu Chí Chấp Nhận

1. KHI admin xem trang ngân hàng, THÌ Hệ Thống PHẢI hiển thị danh sách tất cả ngân hàng
2. Banks_List PHẢI hiển thị tên ngân hàng, mã và URL icon cho mỗi ngân hàng
3. KHI admin tạo ngân hàng mới, THÌ Hệ Thống PHẢI xác thực mã ngân hàng là duy nhất
4. KHI admin tạo ngân hàng, THÌ Hệ Thống PHẢI gửi request POST đến `/admin/banks`
5. KHI admin cập nhật ngân hàng, THÌ Hệ Thống PHẢI gửi request PATCH đến `/admin/banks/:id`
6. KHI thao tác ngân hàng thành công, THÌ Hệ Thống PHẢI hiển thị Toast_Notification thành công
7. KHI thao tác ngân hàng thất bại, THÌ Hệ Thống PHẢI hiển thị Toast_Notification lỗi
8. Bank_Form PHẢI chuyển đổi mã ngân hàng thành chữ hoa trước khi gửi

### Yêu Cầu 6: Giao Diện Quản Lý Thời Hạn

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn quản lý các tùy chọn thời hạn đăng ký, để tôi có thể cung cấp các khoảng thời gian khác nhau với giảm giá tùy chọn.

#### Tiêu Chí Chấp Nhận

1. KHI admin xem trang thời hạn, THÌ Hệ Thống PHẢI hiển thị danh sách tất cả thời hạn được sắp xếp theo thứ tự
2. Durations_List PHẢI hiển thị tên thời hạn, số tháng, số ngày, phần trăm giảm giá và trạng thái mặc định
3. KHI admin tạo thời hạn, THÌ Hệ Thống PHẢI gửi request POST đến `/admin/durations`
4. KHI admin cập nhật thời hạn, THÌ Hệ Thống PHẢI gửi request PATCH đến `/admin/durations/:id`
5. KHI admin xóa thời hạn, THÌ Hệ Thống PHẢI gửi request DELETE đến `/admin/durations/:id`
6. KHI thời hạn được đánh dấu là mặc định, THÌ Hệ Thống PHẢI đảm bảo chỉ có một thời hạn được đánh dấu là mặc định
7. KHI thao tác thời hạn thành công, THÌ Hệ Thống PHẢI hiển thị Toast_Notification thành công
8. KHI thao tác thời hạn thất bại, THÌ Hệ Thống PHẢI hiển thị Toast_Notification lỗi

### Yêu Cầu 7: Giao Diện Quản Lý Gói Người Dùng

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn phân công gói cho người dùng và quản lý trạng thái đăng ký của họ, để tôi có thể kiểm soát quyền truy cập tính năng dịch vụ của người dùng.

#### Tiêu Chí Chấp Nhận

1. KHI admin xem trang gói người dùng, THÌ Hệ Thống PHẢI hiển thị danh sách tất cả phân công gói người dùng
2. User_Packages_List PHẢI hiển thị email người dùng, tên gói, ngày bắt đầu, ngày kết thúc, trạng thái và thống kê sử dụng
3. User_Packages_List PHẢI hỗ trợ lọc theo người dùng, gói và trạng thái
4. KHI admin phân công gói cho người dùng, THÌ Hệ Thống PHẢI gửi request POST đến `/admin/user-packages/assign`
5. KHI admin cập nhật trạng thái gói người dùng, THÌ Hệ Thống PHẢI gửi request PATCH đến `/admin/user-packages/:id/status`
6. KHI thao tác gói người dùng thành công, THÌ Hệ Thống PHẢI hiển thị Toast_Notification thành công
7. KHI thao tác gói người dùng thất bại, THÌ Hệ Thống PHẢI hiển thị Toast_Notification lỗi
8. Assign_Package_Form PHẢI hỗ trợ chọn người dùng, gói, thời hạn, ngày bắt đầu và trạng thái ban đầu

### Yêu Cầu 8: Giao Diện Giám Sát Webhook

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn xem tất cả webhook của người dùng, để tôi có thể giám sát cấu hình webhook trên toàn hệ thống.

#### Tiêu Chí Chấp Nhận

1. KHI admin xem trang giám sát webhook, THÌ Hệ Thống PHẢI hiển thị danh sách phân trang tất cả webhook người dùng
2. Webhooks_List PHẢI hiển thị email người dùng, URL webhook, loại xác thực, loại nội dung, trạng thái hoạt động và ngày tạo
3. Webhooks_List PHẢI hỗ trợ tìm kiếm theo email người dùng hoặc URL webhook
4. Webhooks_List PHẢI hỗ trợ lọc theo loại xác thực và trạng thái hoạt động
5. Webhooks_List PHẢI hiển thị số lượng tài khoản ngân hàng được chọn cho mỗi webhook
6. Hệ Thống PHẢI lấy dữ liệu webhook từ endpoint `/admin/webhooks`

### Yêu Cầu 9: Giao Diện Giám Sát Giao Dịch

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn xem tất cả giao dịch trên toàn hệ thống, để tôi có thể giám sát hoạt động thanh toán và khắc phục sự cố.

#### Tiêu Chí Chấp Nhận

1. KHI admin xem trang giám sát giao dịch, THÌ Hệ Thống PHẢI hiển thị danh sách phân trang tất cả giao dịch
2. Transactions_List PHẢI hiển thị ID giao dịch, email người dùng, tài khoản ngân hàng, số tiền, loại, mã thanh toán, mô tả và ngày xảy ra
3. Transactions_List PHẢI hỗ trợ tìm kiếm theo mô tả, mã thanh toán, ID ngoài, số tài khoản hoặc email người dùng
4. Transactions_List PHẢI hỗ trợ lọc theo loại giao dịch (IN, OUT)
5. Transactions_List PHẢI hỗ trợ lọc theo khoảng thời gian (từ ngày và đến ngày)
6. Transactions_List PHẢI hỗ trợ lọc theo người dùng
7. Hệ Thống PHẢI lấy dữ liệu giao dịch từ endpoint `/admin/transactions`

### Yêu Cầu 10: Giao Diện Cài Đặt Hệ Thống

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn cấu hình cài đặt toàn hệ thống, để tôi có thể kiểm soát hành vi ứng dụng và tích hợp.

#### Tiêu Chí Chấp Nhận

1. KHI admin xem trang cài đặt hệ thống, THÌ Hệ Thống PHẢI hiển thị cấu hình SMTP hiện tại, cài đặt giới hạn tốc độ, mức cảnh báo và mặc định thông báo
2. System_Settings_Form PHẢI cho phép cập nhật host SMTP, port, username, password, email người gửi và tên người gửi
3. System_Settings_Form PHẢI cho phép cập nhật cửa sổ giới hạn tốc độ và số request tối đa
4. System_Settings_Form PHẢI cho phép cập nhật mức cảnh báo (INFO, WARNING, ERROR)
5. System_Settings_Form PHẢI cho phép cập nhật tùy chọn mặc định thông báo
6. KHI admin cập nhật cài đặt hệ thống, THÌ Hệ Thống PHẢI gửi request PUT đến `/admin/system-settings`
7. KHI cập nhật cài đặt hệ thống thành công, THÌ Hệ Thống PHẢI hiển thị Toast_Notification thành công
8. KHI cập nhật cài đặt hệ thống thất bại, THÌ Hệ Thống PHẢI hiển thị Toast_Notification lỗi
9. System_Settings_Form PHẢI che mật khẩu mặc định với tùy chọn hiển thị

### Yêu Cầu 11: Tổng Quan Dashboard Admin

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn xem thống kê hệ thống và hoạt động gần đây, để tôi có thể nhanh chóng đánh giá tình trạng và mức sử dụng của hệ thống.

#### Tiêu Chí Chấp Nhận

1. KHI admin xem dashboard admin, THÌ Hệ Thống PHẢI hiển thị tổng số người dùng
2. Admin_Dashboard PHẢI hiển thị tổng số gói đang hoạt động
3. Admin_Dashboard PHẢI hiển thị tổng số giao dịch trong kỳ hiện tại
4. Admin_Dashboard PHẢI hiển thị tổng số webhook đang hoạt động
5. Admin_Dashboard PHẢI hiển thị đăng ký người dùng gần đây (10 người dùng cuối)
6. Admin_Dashboard PHẢI hiển thị giao dịch gần đây (10 giao dịch cuối)
7. Admin_Dashboard PHẢI hiển thị chỉ số sức khỏe hệ thống
8. Admin_Dashboard PHẢI làm mới thống kê khi trang được tải

### Yêu Cầu 12: Bảng Dữ Liệu Với Phân Trang

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn tất cả bảng dữ liệu hỗ trợ phân trang, để tôi có thể duyệt hiệu quả các tập dữ liệu lớn.

#### Tiêu Chí Chấp Nhận

1. Data_Table PHẢI hiển thị tùy chọn kích thước trang (10, 25, 50, 100 mục mỗi trang)
2. Data_Table PHẢI hiển thị số trang hiện tại và tổng số trang
3. Data_Table PHẢI hiển thị tổng số mục
4. Data_Table PHẢI cung cấp nút điều hướng trang trước và trang sau
5. KHI admin thay đổi kích thước trang, THÌ Data_Table PHẢI reset về trang 1
6. KHI admin điều hướng đến trang khác, THÌ Data_Table PHẢI lấy dữ liệu với offset và limit đúng
7. Data_Table PHẢI vô hiệu hóa nút trước ở trang đầu tiên
8. Data_Table PHẢI vô hiệu hóa nút sau ở trang cuối cùng

### Yêu Cầu 13: Xác Thực Form và Xử Lý Lỗi

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn form xác thực đầu vào và hiển thị thông báo lỗi rõ ràng, để tôi có thể sửa lỗi trước khi gửi.

#### Tiêu Chí Chấp Nhận

1. KHI trường bắt buộc để trống, THÌ Form PHẢI hiển thị thông báo lỗi xác thực
2. KHI trường email chứa định dạng email không hợp lệ, THÌ Form PHẢI hiển thị thông báo lỗi xác thực
3. KHI trường số chứa đầu vào không phải số, THÌ Form PHẢI hiển thị thông báo lỗi xác thực
4. KHI gửi form thất bại do lỗi server, THÌ Form PHẢI hiển thị thông báo lỗi từ phản hồi API
5. KHI gửi form thất bại do lỗi mạng, THÌ Form PHẢI hiển thị thông báo lỗi mạng chung
6. Form PHẢI vô hiệu hóa nút gửi trong khi đang xử lý gửi
7. Form PHẢI hiển thị chỉ báo loading trên nút gửi trong quá trình gửi

### Yêu Cầu 14: Thiết Kế Responsive Cho Bảng Quản Trị

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn bảng quản trị hoạt động trên thiết bị di động, để tôi có thể thực hiện các tác vụ quản trị từ bất kỳ thiết bị nào.

#### Tiêu Chí Chấp Nhận

1. KHI bảng quản trị được xem trên màn hình rộng dưới 768px, THÌ Admin_Layout PHẢI hiển thị menu điều hướng thân thiện với mobile
2. Data_Table PHẢI có thể cuộn ngang trên màn hình nhỏ
3. Form PHẢI xếp các trường form theo chiều dọc trên màn hình nhỏ
4. Admin_Dashboard PHẢI hiển thị thẻ thống kê trong một cột trên màn hình nhỏ
5. Navigation_Sidebar PHẢI thu gọn thành menu hamburger trên màn hình nhỏ
6. KHI menu hamburger được nhấp, THÌ Navigation_Sidebar PHẢI trượt vào từ bên trái
7. KHI mục điều hướng được nhấp trên mobile, THÌ Navigation_Sidebar PHẢI tự động đóng

### Yêu Cầu 15: Định Tuyến Bảng Quản Trị

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn có route chuyên dụng cho tất cả trang admin, để tôi có thể đánh dấu và chia sẻ liên kết đến các chức năng admin cụ thể.

#### Tiêu Chí Chấp Nhận

1. Ứng Dụng PHẢI định nghĩa route `/admin` cho tổng quan dashboard admin
2. Ứng Dụng PHẢI định nghĩa route `/admin/users` cho quản lý người dùng
3. Ứng Dụng PHẢI định nghĩa route `/admin/packages` cho quản lý gói dịch vụ
4. Ứng Dụng PHẢI định nghĩa route `/admin/banks` cho quản lý ngân hàng
5. Ứng Dụng PHẢI định nghĩa route `/admin/durations` cho quản lý thời hạn
6. Ứng Dụng PHẢI định nghĩa route `/admin/user-packages` cho quản lý gói người dùng
7. Ứng Dụng PHẢI định nghĩa route `/admin/webhooks` cho giám sát webhook
8. Ứng Dụng PHẢI định nghĩa route `/admin/transactions` cho giám sát giao dịch
9. Ứng Dụng PHẢI định nghĩa route `/admin/settings` cho cài đặt hệ thống
10. Ứng Dụng PHẢI bao bọc tất cả route admin với component RequireAuth
11. Ứng Dụng PHẢI xác minh vai trò ADMIN cho tất cả route admin

### Yêu Cầu 16: Quản Lý Trạng Thái Bảng Quản Trị

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn dữ liệu admin được quản lý hiệu quả trong Redux, để giao diện vẫn responsive và dữ liệu được cache phù hợp.

#### Tiêu Chí Chấp Nhận

1. Ứng Dụng PHẢI tạo Redux slice cho quản lý người dùng admin
2. Ứng Dụng PHẢI tạo Redux slice cho quản lý gói dịch vụ admin
3. Ứng Dụng PHẢI tạo Redux slice cho quản lý ngân hàng admin
4. Ứng Dụng PHẢI tạo Redux slice cho quản lý thời hạn admin
5. Ứng Dụng PHẢI tạo Redux slice cho quản lý gói người dùng admin
6. Ứng Dụng PHẢI tạo Redux slice cho giám sát webhook admin
7. Ứng Dụng PHẢI tạo Redux slice cho giám sát giao dịch admin
8. Ứng Dụng PHẢI tạo Redux slice cho cài đặt hệ thống admin
9. Redux_Slice PHẢI định nghĩa async thunk cho tất cả thao tác API
10. Redux_Slice PHẢI xử lý trạng thái loading, success và error cho mỗi thao tác
11. Redux_Slice PHẢI cache dữ liệu đã lấy để tránh gọi API không cần thiết

### Yêu Cầu 17: Đa Ngôn Ngữ Bảng Quản Trị

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn bảng quản trị hỗ trợ nhiều ngôn ngữ, để quản trị viên có thể sử dụng giao diện bằng ngôn ngữ ưa thích của họ.

#### Tiêu Chí Chấp Nhận

1. Admin_Panel PHẢI hỗ trợ tiếng Anh cho tất cả văn bản UI
2. Admin_Panel PHẢI hỗ trợ tiếng Việt cho tất cả văn bản UI
3. Language_Context PHẢI bao gồm khóa dịch cho tất cả nhãn, nút và thông báo của bảng quản trị
4. Admin_Panel PHẢI sử dụng cùng bộ chuyển đổi ngôn ngữ với dashboard người dùng
5. KHI ngôn ngữ được thay đổi, THÌ Admin_Panel PHẢI cập nhật tất cả văn bản ngay lập tức mà không cần tải lại trang
6. Admin_Panel PHẢI lưu trữ tùy chọn ngôn ngữ trong bộ nhớ trình duyệt

### Yêu Cầu 18: Tính Nhất Quán Thiết Kế Trực Quan Bảng Quản Trị

**Câu Chuyện Người Dùng:** Là quản trị viên hệ thống, tôi muốn bảng quản trị tuân theo cùng hệ thống thiết kế với dashboard người dùng, để giao diện cảm thấy gắn kết và quen thuộc.

#### Tiêu Chí Chấp Nhận

1. Admin_Panel PHẢI sử dụng cùng màu chính (#3b82f6) với dashboard người dùng
2. Admin_Panel PHẢI sử dụng cùng kiểu chữ và khoảng cách với dashboard người dùng
3. Admin_Panel PHẢI sử dụng các lớp tiện ích TailwindCSS nhất quán với dashboard người dùng
4. Admin_Panel PHẢI sử dụng cùng kiểu nút với dashboard người dùng
5. Admin_Panel PHẢI sử dụng cùng kiểu đầu vào form với dashboard người dùng
6. Admin_Panel PHẢI sử dụng cùng kiểu component thẻ với dashboard người dùng
7. Admin_Panel PHẢI sử dụng cùng component modal với dashboard người dùng
8. Admin_Panel PHẢI sử dụng motion/react cho animation nhất quán với dashboard người dùng

### Yêu Cầu 19: Tái Sử Dụng Component Hiện Có

**Câu Chuyện Người Dùng:** Là nhà phát triển, tôi muốn tái sử dụng tối đa các component UI đã có trong dự án, để đảm bảo tính nhất quán về giao diện, giảm thiểu code trùng lặp và dễ bảo trì.

#### Tiêu Chí Chấp Nhận

1. Admin_Panel PHẢI tái sử dụng component `Modal` từ `web/components/ui/Modal.tsx` cho tất cả dialog và popup
2. Admin_Panel PHẢI tái sử dụng component `DataTable` từ `web/components/DataTable.tsx` cho tất cả bảng dữ liệu
3. Admin_Panel PHẢI tái sử dụng component `Card` từ `web/components/ui/Card.tsx` cho tất cả thẻ thông tin
4. Admin_Panel PHẢI tái sử dụng component `Button` từ `web/components/ui/Button.tsx` cho tất cả nút bấm
5. Admin_Panel PHẢI tái sử dụng component `Input` từ `web/components/ui/Input.tsx` cho tất cả trường nhập liệu
6. Admin_Panel PHẢI tái sử dụng component `Select` từ `web/components/ui/Select.tsx` cho tất cả dropdown
7. Admin_Panel PHẢI tái sử dụng component `Badge` từ `web/components/ui/Badge.tsx` cho tất cả nhãn trạng thái
8. Admin_Panel PHẢI tái sử dụng các utility function từ `web/lib/utils.ts` (như `cn` cho className)
9. Admin_Panel PHẢI tái sử dụng hook `useLanguage` từ `web/context/LanguageContext.tsx` cho đa ngôn ngữ
10. Admin_Panel PHẢI tái sử dụng hook `useAppDispatch` và `useAppSelector` từ `web/store/hooks.ts` cho Redux
11. Admin_Panel PHẢI tái sử dụng component `LoadingSpinner` từ `web/components/ui/LoadingSpinner.tsx` cho trạng thái loading
12. Admin_Panel KHÔNG ĐƯỢC tạo component UI mới nếu đã có component tương tự trong `web/components/ui/`
13. KHI cần component mới, THÌ PHẢI đặt trong thư mục `web/components/ui/` để có thể tái sử dụng cho cả user và admin
14. Admin_Panel PHẢI tuân theo cùng pattern và convention code với các component hiện có
15. Admin_Panel PHẢI sử dụng cùng thư viện `sonner` cho Toast_Notification như các trang user đã sử dụng
