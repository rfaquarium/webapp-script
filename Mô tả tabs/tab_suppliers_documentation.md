# Tài Liệu Đặc Tả Chi Tiết: Tab Nhà Cung Cấp (Suppliers Tab)

File gốc: [`Tab_Suppliers.html`](file:///c:/Users/ADMIN/RF_Workspace_Pro/Tab_Suppliers.html)

Đứng trên quan điểm của một chuyên gia thiết kế phần mềm doanh nghiệp, Tab Nhà Cung Cấp có một tính năng vô cùng đáng giá, đó là **Khớp Lệnh Đối Soát Ngân Hàng (N:1)**. Hầu hết các phần mềm kế toán vừa và nhỏ đều vật lộn với việc quản lý công nợ, nhưng tính năng này đã giải quyết triệt để sự phức tạp.

Dưới đây là chi tiết kiến trúc và **1 Lỗi Đứt gãy Dữ Liệu (Data Disassociation Bug)** cực kỳ nghiêm trọng tôi vừa phát hiện ra.

---

## 1. Điểm Nhấn Kiến Trúc (Architectural Highlights)

### 1.1 Khớp Lệnh Đối Soát Bank Tự Động (Bank Reconciliation N:1)
Đây là tính năng đắt giá nhất của Tab này:
- **Bài toán thực tế:** Trong ngày doanh nghiệp nhập 10 phiếu hàng từ cùng 1 nhà cung cấp. Cuối ngày, kế toán ra lệnh chuyển khoản ngân hàng **1 cục tiền duy nhất** để thanh toán cho cả 10 phiếu đó. Trên Bank sinh ra 1 Phiếu Chi duy nhất.
- **Cách hệ thống giải quyết (N:1):** Thay vì bắt kế toán ngồi tự cộng trừ, tính năng này liệt kê `1 Phiếu Chi Bank` ở trên, và danh sách `N Phiếu Nhập` đang nợ ở dưới. Kế toán chỉ việc "Tick" chọn các phiếu nhập.
- **Cán cân Kế toán:** Hệ thống tự động thiết lập một Cán cân. Nếu tổng tiền Phiếu Chi khớp với tổng nợ Phiếu Nhập, nó cho phép bấm lưu, tự động giảm `totalDebt` và đánh dấu `isPaid=true` cho N phiếu nhập cùng lúc.

### 1.2 Dashboard Nợ Nâng Cao (Smart Debt Metrics)
Thống kê rất thực chiến:
- CÔNG NỢ CẦN TRẢ: Bức tranh toàn cảnh tiền nợ thị trường.
- ĐƠN CHƯA CHI TRẢ: Cảnh báo số lượng phiếu nhập đang treo.

### 1.3 Hệ thống Tags & Category
Phân tách nhà cung cấp thành: `HÀNG HOÁ`, `NGUYÊN LIỆU`, `MÁY MÓC`, `NỘI BỘ`. Kết hợp màu sắc và bộ icon phân loại trực quan (Emerald, Amber, Blue, Purple).

---

## 2. LỖI NGHIÊM TRỌNG: Mất Tích Lịch Sử Phiếu Nhập (Data Disassociation)

Quá trình truy vết logic `handleSaveSup` (Lưu thông tin Nhà Cung Cấp) đã làm lộ ra một điểm yếu chết người liên quan đến **Khóa Ngoại (Foreign Key)**.

### Mô Tả Lỗi
Trong hệ thống, các "Phiếu Nhập Hàng" (nằm trong mảng `ImportExport`) đang được liên kết với Nhà Cung Cấp thông qua trường `target: sup.name` (Tức là dùng Tên nhà cung cấp làm móc nối thay vì dùng `id`).

**Kịch bản gây lỗi:**
1. Nhà Cung Cấp có tên là **"Đại Lý A"**. Hệ thống có 50 phiếu nhập hàng gắn với tên "Đại Lý A". Cả 50 phiếu này đang nợ 100 Triệu.
2. Một ngày đẹp trời, kế toán đổi tên "Đại Lý A" thành **"Đại Lý A - Cổ Phần"** trong form Sửa.
3. Form lưu thành công. Tên đổi thành "Đại Lý A - Cổ Phần".
4. **HẬU QUẢ:** Hàm `getImportHistory('Đại Lý A - Cổ Phần')` lập tức trả về rỗng! 
   - Cả 50 phiếu nhập hàng lịch sử bốc hơi hoàn toàn khỏi hồ sơ của Nhà Cung Cấp này.
   - Sổ nợ vẫn hiển thị nợ 100 Triệu, nhưng KHÔNG CÓ BẤT KỲ MỘT PHIẾU NỢ NÀO HIỂN THỊ để kế toán bấm thanh toán! 
   - Số tiền nợ này trở thành "Nợ mù", không thể xóa, không thể đối soát.

### Giải Pháp Fix Lỗi Đề Xuất
Tôi sẽ sửa luồng Lưu thông tin Nhà Cung Cấp (`handleSaveSup`). Thuật toán mới như sau:
1. Khi có lệnh sửa Tên Nhà Cung Cấp (existing.name !== newSup.name).
2. Hệ thống sẽ ngay lập tức "Quét" toàn bộ kho dữ liệu `ImportExport`.
3. Tìm tất cả các phiếu nhập đang gắn tên cũ, cập nhật thành tên mới, và gộp vào chung 1 payload để đưa lên Server. 
4. Điều này giúp Dữ liệu của quá khứ đi theo tên mới, vĩnh viễn không bao giờ bị đứt gãy.

Đồng thời, theo yêu cầu của bạn, tôi sẽ tiến hành **đổi toàn bộ các text giao diện từ "Đối Tác" thành "Nhà Cung Cấp"**.
