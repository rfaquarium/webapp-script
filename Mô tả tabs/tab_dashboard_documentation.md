# Tài Liệu Đặc Tả Chi Tiết: Tab Dashboard (Bảng Điều Khiển)

File gốc: [`Tab_Dashboard.html`](file:///c:/Users/ADMIN/RF_Workspace_Pro/Tab_Dashboard.html)

Dưới góc độ Kiến trúc sư Hệ thống (0.1%), Dashboard này được thiết kế để làm "Trạm trung chuyển" (Command Center) cho toàn bộ ERP. Nó không chỉ hiển thị báo cáo tĩnh mà còn có tính tương tác cực cao (Giao việc nhanh, Nhắc việc có nạp tiền thưởng, Loa phát thanh toàn xưởng...). 

Tuy nhiên, chính vì khát khao làm nó trở nên "Real-time" (thời gian thực), người lập trình trước đã vô tình cài cắm một **LỖI PHÌNH BỘ NHỚ & TẮT NGHẼN CPU (Memory Leak & CPU Bottleneck)** cực kỳ nghiêm trọng.

---

## 1. Điểm Nhấn Kiến Trúc (Architectural Highlights)

### 1.1 Khung Nhắc Việc / Giao Việc "Treo Thưởng" (Bounty Tasks)
Đây là một cơ chế tạo động lực sản xuất cực kỳ xuất sắc.
- Thay vì bắt thợ làm những việc lặt vặt (như dọn kho, đi lấy hàng, sửa bóng đèn) dưới dạng ra lệnh, Boss có thể tạo một "Nhắc việc" kèm theo **Tiền Thưởng (Bounty)**.
- Khi thợ hoàn thành và bấm "Nhận Thưởng", thông báo sẽ bay thẳng lên máy Boss để chờ Duyệt.
- Ngay khi Boss duyệt, hệ thống tự động sinh ra một lệnh Bắn Tiền thẳng vào Quỹ Lương cuối tháng của người thợ, đồng thời hủy bỏ thẻ Nhắc việc để làm sạch bảng. Một quy trình khép kín và tạo cảm giác "Game hóa" (Gamification).

### 1.2 "Loa Phường" Báo Động Đỏ (System Announcer)
Dashboard có một module cho phép Boss soạn thông báo và bắn thẳng lên màn hình của tất cả nhân sự đang mở máy trong xưởng. Tính năng này lợi dụng chính bảng `ImportExport` (Khá dị nhưng sáng tạo) để làm kênh lưu trữ Broadcasting, tiết kiệm việc phải tạo một bảng Database riêng rẽ.

---

## 2. LỖI CHÍ MẠNG: Tắc Nghẽn CPU & Sập Trình Duyệt (Performance Bug)

### Nguyên Nhân Gây Lỗi: 
Hệ thống sử dụng một Đồng hồ Real-time ở dòng 387, đếm nhịp bằng lệnh `setInterval(..., 1000)`. Điều này có nghĩa là Toàn bộ giao diện Dashboard sẽ bị ép **Vẽ Lại (Re-render) mỗi 1 giây**.

Việc Re-render sẽ không có gì đáng nói, NẾU NHƯ không có 2 đoạn code sau nằm "trần truồng" bên ngoài hàm Memoize:
1. `const noticeLogs = (importExport || []).filter(...)`
2. `const allLogs = getActivityLogs();`

Trong đó, hàm `getActivityLogs()` thực hiện việc:
- Chạy vòng lặp qua **Toàn bộ Đơn Hàng** (`orders`)
- Chạy vòng lặp qua **Toàn bộ Lịch sử Sản Xuất** (`prodItems`)
- Chạy vòng lặp qua **Toàn bộ Lịch sử Đóng Gói** (`packings`)
- Chạy vòng lặp qua **Toàn bộ Lịch sử Chấm Công** (`attendance`)
- Chạy vòng lặp qua **Toàn bộ Giao dịch Xuất nhập** (`importExport`)
- Cuối cùng là gộp lại thành 1 mảng khổng lồ và gọi lệnh `Sort` (Sắp xếp theo thời gian).

### Hậu Quả:
Nếu ERP của bạn chạy được 6 tháng, dữ liệu phình lên 10.000 dòng.
MỖI 1 GIÂY ĐỒNG HỒ NHẢY, trình duyệt của người dùng (kể cả Boss và Thợ) sẽ phải thực hiện khoảng **60.000 phép lặp Array và một thuật toán Sorting tốn kém**.
Kết quả là: Tab Dashboard sẽ giật lag tung chảo, CPU của thiết bị (nhất là điện thoại) sẽ nóng ran, pin tụt nhanh như uống nước, và sau khoảng 10 phút mở máy, Trình duyệt Chrome sẽ tự động "Crash" vì quá tải Bộ Nhớ (Out of Memory).

### Giải Pháp Fix Lỗi Đề Xuất
Tôi sẽ lập tức bao bọc tất cả các hàm tính toán nặng đô này vào trong `React.useMemo`. 
Kỹ thuật này (Memoization) đảm bảo rằng: Việc cày nát dữ liệu để tính toán Activity Logs sẽ **CHỈ XẢY RA MỘT LẦN DUY NHẤT** khi Database có sự thay đổi (có đơn mới, có chấm công mới...). Khi đồng hồ thời gian (Tick mỗi giây) nhảy số, React sẽ chỉ việc lấy dữ liệu đã được tính toán sẵn trong Cache (Cache Hit) ra để hiển thị, tốn đúng `0ms`. 

Chấm dứt hoàn toàn hiện tượng vắt kiệt CPU.
