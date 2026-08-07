# Tài Liệu Đặc Tả Chi Tiết: Tab Phân Quyền (User Management Tab)

File gốc: [`Tab_UserManagement.html`](file:///c:/Users/ADMIN/RF_Workspace_Pro/Tab_UserManagement.html)

Đứng dưới góc độ một Kiến trúc sư Hệ thống (0.1%), Tab Quản trị Nhân sự & Phân quyền này không chỉ đơn thuần là nơi tạo tài khoản. Nó đóng vai trò là **"Xương sống Định danh" (Identity Backbone)** cho toàn bộ hệ thống ERP (từ Chấm công, Tính lương, Giao việc sản xuất, đến Quyền truy cập module).

Dưới đây là phân tích kiến trúc và **2 LỖI CHÍ MẠNG (Critical Bugs)** liên quan đến Toàn vẹn Dữ liệu (Data Integrity) và Bảo mật (Security) vừa được phát hiện.

---

## 1. Điểm Nhấn Kiến Trúc (Architectural Highlights)

### 1.1 Cơ Chế Cảnh Báo An Ninh Tự Động (Proactive Security Scanner)
Thay vì chờ có sự cố, hệ thống tự động quét toàn bộ kho mã PIN của nhân sự theo thời gian thực (Real-time). Nếu phát hiện mã PIN trống hoặc thuộc danh sách "Mã PIN yếu" (1234, 0000, 1111...), nó sẽ:
- Rung cảnh báo (Animate Pulse) màu đỏ gắt ngay trên thẻ nhân sự.
- Hiển thị Banner Cảnh Báo khẩn cấp yêu cầu Boss can thiệp.
*Nhận định: Tính năng này mang đậm hơi hướng của các hệ thống Zero-Trust Security hiện đại.*

### 1.2 Kiến Trúc Dữ Liệu Dạng Từ Điển (Dictionary-based State)
Hệ thống lưu trữ User thông qua Object Key-Value `userConfigs.pins`, với Key chính là Mã PIN. Việc này giúp tốc độ Đăng nhập và Truy xuất dữ liệu đạt mức `O(1)` (Tức thời) thay vì phải dùng vòng lặp `O(N)` để tìm kiếm.

### 1.3 Phân Quyền Đa Tầng (Granular Permissions)
Hệ thống kết hợp cả **Role-based (Nhóm Quyền gốc)** như *TỐI CAO, KẾ TOÁN, KHO VẬN* và **Permission-based (Quyền Hạn Chi Tiết)** như *Quản lý Kho, Quản lý Lương...* cho phép tùy biến cực sâu (Cấp quyền chéo).

---

## 2. PHÁT HIỆN LỖI CHÍ MẠNG (CRITICAL BUGS)

Trong quá trình dịch ngược luồng lưu trữ `handleSave`, tôi phát hiện ra 2 lỗi có thể phá hủy dữ liệu toàn hệ thống.

### Lỗi 1: Ghi đè Định Danh Mã PIN (Security & Data Loss)
- **Cơ chế hiện tại:** Key của tài khoản chính là Mã PIN. Khi Boss sửa mã PIN của "Nhân Viên A" thành `1234`. 
- **Kịch bản lỗi:** Nếu `1234` đang là mã PIN của "Nhân Viên B". Hàm lưu dữ liệu sẽ "Vô tình" ghi đè toàn bộ hồ sơ của Nhân Viên A lên Nhân Viên B.
- **Hậu quả:** Tài khoản Nhân Viên B bị bốc hơi vĩnh viễn khỏi hệ thống mà không có cảnh báo nào!

### Lỗi 2: Phá vỡ Tính Toàn Vẹn Hệ Thống (Orphaned Foreign Keys)
- **Cơ chế hiện tại:** Tên Nhân Sự (`name`) đang được dùng làm Khóa Ngoại (Foreign Key) để liên kết với hệ thống Chấm công, Tính lương (Tab HR), và Lịch sử Giao việc (Tab Sản xuất). Hệ thống hiện tại cho phép Boss/Nhân sự thoải mái đổi "Tên Nhân Sự" trong form.
- **Hậu quả:** Nếu Nhân Sự A đổi tên thành Nhân Sự B, toàn bộ dữ liệu Chấm công và Bảng lương trong quá khứ của A sẽ trở thành "Mồ côi" (Vẫn nằm trong DB nhưng không thuộc về ai cả), làm sai lệch toàn bộ báo cáo kế toán. Khác với lỗi ở Tab Suppliers (chỉ liên quan 1 mảng Import), lỗi đổi tên ở đây ảnh hưởng tới hàng chục mảng dữ liệu toàn cục.

---

### 3. Giải Pháp Vá Lỗi Đề Xuất
Tôi sẽ can thiệp trực tiếp vào file `Tab_UserManagement.html` để triển khai 3 lớp bảo vệ:
1. **Khóa cứng Định Danh:** Vô hiệu hóa (Disable) ô nhập "Họ Tên Nhân Sự" nếu đây là tài khoản đã tồn tại. Định danh gốc (Primary Key) là bất khả xâm phạm. Nếu sai tên, bắt buộc phải Xóa đi tạo lại (Tương đương quy trình nghỉ việc - nhận việc mới).
2. **Scanner Chống Trùng Mã PIN:** Chặn đứng thao tác Lưu nếu mã PIN mới nhập vào đã bị sở hữu bởi một nhân sự khác.
3. **Dọn Rác Khi Xóa (Garbage Collection):** Bổ sung lệnh xóa Dữ liệu Lương cơ bản (`updatedSalaries`) khi tài khoản bị xóa (Hệ thống cũ đang bỏ quên mảng này gây phình to rác dữ liệu).
