# Tài Liệu Đặc Tả Chi Tiết: Tab Mua Dịch Vụ (Services / Digital HR Tab)

File gốc: [`Tab_Services.html`](file:///c:/Users/ADMIN/RF_Workspace_Pro/Tab_Services.html)

Dưới lăng kính của 0.1% chuyên gia thiết kế phần mềm doanh nghiệp, Tab này gây ấn tượng mạnh bởi cách "tái định nghĩa" (reframe) khái niệm **Mua dịch vụ/Phần mềm** thành **Hồ Sơ Nhân Sự Digital** (Digital Employees). 

Cách tư duy này rất hiện đại (Gamification & Behavioral Design), biến những khoản chi phí khô khan thành một dạng tài sản vô hình mang lại giá trị cho doanh nghiệp.

Dưới đây là chi tiết kiến trúc và **Cảnh báo Lỗi nghiêm trọng (Data Loss / Ledger Desync)**.

---

## 1. Điểm Nhấn Kiến Trúc (Architectural Highlights)

### 1.1 Quản Trị Nhân Sự Digital (Digital Employee Management)
Thay vì gọi các nền tảng (VNG, Shopee, KiotViet, LarkSuite...) là "Công cụ", hệ thống gọi đây là các "Nhân Sự Digital".
- **Lương Nhân Sự Digital:** Chính là tổng chi phí thanh toán cho các dịch vụ này. Việc trực quan hóa như vậy giúp chủ doanh nghiệp dễ dàng so sánh hiệu suất giữa một nhân sự người thật và một phần mềm (Ví dụ: Trả 1 triệu/tháng cho bot tự động còn hiệu quả hơn 7 triệu/tháng cho con người).
- **Lá Chắn Thuế (Tax Shield):** Hệ thống tự tính VAT tích lũy `Tổng Tiền * 8%`. Đây là một chỉ số rất hay giúp CFO (Giám đốc tài chính) biết được công ty đang có bao nhiêu dư địa để cấn trừ thuế cuối năm.

### 1.2 Vòng Đời Hoạt Động (Lifecycle & Expiry Tracker)
Quản trị dịch vụ Subscription (SaaS) sợ nhất là quên gia hạn. Tab này có thanh Progress Bar (Thanh tiến trình) tự động trừ lùi số ngày còn lại (dựa vào `expiryDate`) và tự đổi màu (Xanh -> Vàng -> Đỏ). 
- Khi quá hạn, trạng thái hiển thị cực kỳ mạnh mẽ: **"Đã sa thải (Hết hạn)"**.
- Khi `< 7 ngày`, nút **Đánh Giá & Gia Hạn Ngay** sẽ rung bần bật (animate-pulse) để nhắc nhở hành động.

### 1.3 Kích Hoạt Domino (Auto-Reconciliation System)
Khi kế toán lưu 1 hoá đơn mua phần mềm, luồng nghiệp vụ không đơn thuần là "Tạo dòng dữ liệu" mà nó chạy hiệu ứng Domino:
- **Tạo mới:** Khởi tạo `PurchasedServices`.
- **Đối Soát (Reconciliation):** Hệ thống thông minh quét toàn bộ Phiếu Chi trong 7 ngày gần nhất chưa có Hóa đơn. Thay vì tạo phiếu chi mới gây trùng lặp, nó ghép (link) mã HĐ hiện tại vào ghi chú của Phiếu Chi cũ `[HĐ: ...]`.
- **Tự học (Auto-Populate Supplier):** Nếu phát hiện Nhà Cung Cấp chưa tồn tại trong danh bạ `Suppliers`, nó tự động spawn (sinh ra) 1 bản ghi Supplier mới với tag `Dịch vụ`. Rất liền mạch!

---

## 2. LỖI NGHIÊM TRỌNG: Sai Lệch Sổ Quỹ (Ledger Desync Bug)

Dù quy trình Domino rất mượt mà, nhưng tôi đã phát hiện **2 Bug cực kỳ nghiêm trọng** khi ở chế độ `Tạo Phiếu Chi Mới`:

1. **Lỗi truyền sai ID Tài Khoản (Value Type Mismatch):**
   - Ở thẻ `<select>` chọn Nguồn Tiền, hệ thống đang truyền `value={acc.accountName}` thay vì `value={acc.id}`.
   - Điều này làm cho Tab Tài Chính (Finance) không thể đọc được phiếu chi này rút từ quỹ nào, dẫn đến việc tính toán báo cáo dòng tiền bị vỡ (Break).

2. **Lỗi Rò Rỉ Tiền Mặt (Ghost Transaction):**
   - Tương tự như lỗi ở Tab Tài Chính, khi hệ thống đẩy lệnh `payload.Transactions` đi, nó **QUÊN KHÔNG CẬP NHẬT TRỪ TIỀN** ở mảng `payload.Accounts`.
   - Kết quả: Phiếu chi vẫn được tạo thành công, nhưng tiền trong ngân hàng (Sổ quỹ) không bị trừ đi 1 đồng nào!

### Giải Pháp Fix Lỗi Đề Xuất
Tôi sẽ tiến hành vá ngay lỗi này trong file `Tab_Services.html`:
- Đổi `value={acc.accountName}` thành `value={acc.id}` trong dropdown.
- Bổ sung thuật toán trừ thẳng tiền trong quỹ: `balance = currentBalance - formData.amount` và nhét vào mảng `payload.Accounts` để kích hoạt hiệu ứng Domino một cách trọn vẹn và an toàn tuyệt đối.
