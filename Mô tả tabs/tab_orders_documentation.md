# Tài Liệu Đặc Tả Chi Tiết: Tab Đơn Hàng (Orders Tab)

File gốc: [`Tab_Orders.html`](file:///c:/Users/ADMIN/RF_Workspace_Pro/Tab_Orders.html)

Tab Đơn Hàng là trung tâm điều khiển (Command Center) phục vụ quản lý vòng đời trọn vẹn của một đơn hàng, từ lúc tạo mới, giao việc cho xưởng sản xuất, cho đến lúc đóng gói, bàn giao vận chuyển và xử lý hoàn huỷ. 

Dưới đây là mô tả chi tiết toàn bộ cấu trúc và chức năng bên trong bộ source code của Tab Đơn Hàng:

---

## 1. Các Component Cốt Lõi

### A. `<OrdersTab />` (Component Chính)
Đảm nhận việc kết nối dữ liệu từ `App_Main`, phân loại đơn hàng, hiển thị danh sách và chứa các bộ điều khiển logic cấp cao.

**1. Hệ thống Filter (Bộ Lọc):**
- **Lọc theo Thời gian (`filterTime`, `customMonth`):** Lọc đơn theo "Hôm Nay", "Tuần Này", "Tháng Này" hoặc "Tùy Chỉnh" tháng.
- **Lọc theo Trạng thái (`filterStatus`):** Bao gồm 7 trạng thái chính:
  - `Chờ Sản Xuất` (Bao gồm các lệnh đang làm, chưa xong).
  - `Sẵn Sàng Đóng Gói` (Hệ thống tự nhận diện khi tất cả các sản phẩm con trong 1 đơn đã được thợ đánh dấu `Done`).
  - `Chờ Bàn Giao`
  - `Đã Bàn Giao` (Có thêm Sub-tabs lọc chi tiết theo Kênh: Tất Cả, Shopee, Bán Lẻ, CTV, TikTok).
  - `Đơn Huỷ`
  - `Hàng Hoàn`
  - `Hoàn Thành`
- **Thanh Tìm kiếm (`searchCode`):** Tìm cực nhanh theo tên Khách Hàng, Mã Đơn, Số điện thoại hoặc Mã Vận Đơn (MVĐ). 
- **Phân quyền hiển thị:** Nếu user là CTV, họ chỉ nhìn thấy các đơn thuộc về tài khoản của mình.

**2. Bảng Thống Kê Doanh Thu (Dashboard Mini):**
Chỉ hiển thị cho Quản lý. Bao gồm 4 chỉ số (Cộng dồn dựa trên các đơn không bị huỷ/hoàn trong khoảng thời gian đang lọc):
- **Tổng Doanh Thu:** Tổng tiền các đơn hợp lệ.
- **Hoàn Trả:** Tổng giá trị các đơn bị hoàn.
- **Bán Lẻ (Hương Bán):** Doanh số từ kênh Bán Lẻ của nhân sự "Hương".
- **Cộng Tác Viên:** Doanh số từ hệ thống CTV.

**3. Khối Cảnh Báo Khẩn Cấp (Urgent Alerts):**
Tự động nhấp nháy màu đỏ (pulse animation) khi phát hiện có **Đơn Huỷ** hoặc **Hàng Hoàn** phát sinh trong ngày hôm nay. Giúp quản lý lập tức kiểm soát tình hình mà không bị trôi mất thông tin.

### B. `<ReturnScannerModal />` (Máy Quét Hoàn Hàng Chuyên Dụng)
Đây là module cực kỳ tiên tiến được nhúng trong Tab Đơn Hàng để xử lý hàng hoàn số lượng lớn.
- **Chế độ Súng Mã Vạch:** Ô textbox luôn tự động focus. Khi nhân viên dùng súng quét mã vạch tít vào MVĐ, hệ thống tự động bóc tách (bỏ qua ký tự thừa, HTTP link) để tìm ra mã đơn khớp nhất và tự động nhảy trạng thái đơn đó về "Hàng Hoàn".
- **Chế độ Đọc PDF AI (OCR):** Hỗ trợ upload file PDF (Ví dụ: Biên bản trả hàng SPX). Hệ thống gửi PDF qua server (Google Apps Script) để đọc text, dùng Regex bóc tách toàn bộ mã vận đơn bên trong và tự động đối chiếu với danh sách đơn hàng. Giúp xác nhận hoàn cả trăm đơn chỉ bằng 1 cú click.

---

## 2. Các Logic Nghiệp Vụ Chuyên Sâu (Business Logics)

### A. Logic Bàn Giao Hàng Loạt & Tự Động Xuất Kho (`handleBulkHandover`)
- Khi Quản lý tick chọn nhiều đơn ở trạng thái "Chờ Bàn Giao" và bấm "BÀN GIAO HÀNG LOẠT".
- Hệ thống sẽ chuyển trạng thái các đơn này sang "Đã Bàn Giao".
- **Kho Hàng (ERP):** Tự động bóc tách từng phụ kiện (Accessories) và từng sản phẩm con (nếu lấy từ kho hoặc thuộc danh mục Layout/Bể Kính).
- Tính toán tổng số lượng tiêu hao -> Tự động trừ tồn kho hiện tại.
- Tự động sinh ra 1 phiếu log ở mục **Xuất Kho** (ImportExport) ghi rõ xuất đi cho những mã đơn nào kèm tổng giá trị vốn xuất.

### B. Logic Huỷ Đơn / Hàng Hoàn Siêu Việt (`handleCancelOrder`)
Đây là một trong những hàm phức tạp nhất bảo toàn tính toàn vẹn dữ liệu:
- **Nếu đơn chưa bàn giao (Chờ SX, Sẵn Sàng, Chờ Bàn Giao):** Chuyển sang "Đơn Huỷ".
- **Nếu đơn đã bàn giao:** Chuyển sang "Hàng Hoàn".
- **Cảnh báo Tài chính:** Nếu đơn này đã được thu/chi tiền (Có phiếu trong Tab Finance), hệ thống cảnh báo và hỏi người dùng có muốn XÓA BỎ các phiếu thu/chi đó không để không làm sai lệch dòng tiền.
- **Tương tác API bên thứ 3:** Tự động gọi API của Giao Hàng Nhanh (GHN) để huỷ mã vận đơn tương ứng trên hệ thống GHN.
- **Cập nhật KPIs:** Xóa các bản ghi thưởng/phạt gắn liền với đơn này.
- **Sản Phẩm Xưởng (Production):** 
  - Nếu là Huỷ Đơn: Sản phẩm nào thợ đang làm dở thì giữ nguyên cho thợ làm tiếp (để thành tồn kho), sản phẩm nào lấy trực tiếp từ kho bù ra thì chuyển sang "Đã Huỷ".
- **Tự động Hoàn Kho:** Nếu đơn ĐÃ BÀN GIAO bị chuyển thành HÀNG HOÀN, hệ thống tính toán lại mọi phụ kiện và sản phẩm đi kèm, tự động **Cộng Lại Số Lượng Tồn Kho** cho sản phẩm đó và ghi một phiếu "Nhập Kho" tự động lưu vết.

### C. Nhập Kho Nội Bộ (`handleConfirmStockIn`)
Khi một lệnh sản xuất dư thừa hoặc khách không lấy, người dùng có thể ấn nút để Nhập Kho toàn bộ thành phẩm. Hệ thống sẽ:
1. Cộng dồn số lượng thành phẩm đó vào Kho Hàng.
2. Chuyển trạng thái lệnh thành "Đã Nhập Kho".
3. Tạo ra phiếu Nhập Kho giá trị nội bộ (Dựa trên CostPrice của sản phẩm) để kế toán dễ theo dõi.

---

## 3. Danh sách các Nút Tác Vụ Công Cụ (Toolbar)
- 🔍 **Tìm Kiếm & Bộ Lọc:** Real-time filter.
- 📩 **QUÉT MAIL (Huỷ & Hoàn):** Gắn API đọc Email tự động tìm thông báo huỷ từ Tiktok/Shopee để đồng bộ về app.
- 📊 **NHẬP FILE:** Import loạt đơn từ file Excel (Mở Modal BulkImport).
- 💰 **ĐỐI SOÁT:** Nút bật trạm Đối Soát Tài Chính (`BulkFinanceModal`) chuyên khớp doanh thu từ sàn về tài khoản ngân hàng.
- ➕ **Dấu Cộng (Tạo Đơn):** Bật Modal `AddModal` để tạo hoặc chỉnh sửa đơn.

---

## Tổng Kết
Tab Đơn Hàng không chỉ là nơi xem danh sách, mà thực chất là một mini-ERP:
1. Liên kết chặt chẽ với **Kho Hàng** (Tự trừ kho khi giao, tự hoàn kho khi huỷ).
2. Liên kết chặt chẽ với **Tài Chính** (Cảnh báo xoá phiếu thu chi nếu huỷ đơn).
3. Liên kết chặt chẽ với **Sản Xuất** (Nhìn vào tiến độ thợ để tự chuyển đơn sang "Sẵn sàng đóng gói").
4. Tiên phong áp dụng **AI (OCR)** và tự động hoá API vận chuyển.
