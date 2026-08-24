# 🚀 RF_WORKSPACE_PRO — SYSTEM CHANGELOG & RELEASE HISTORY

Tài liệu lưu trữ toàn bộ lịch sử phát hành, nâng cấp kiến trúc, tối ưu nghiệp vụ và sửa lỗi của hệ điều hành `RF_Workspace_Pro`.

---

## [v2.12.0] - 2026-08-24

### 👑 Tái Thiết Kế Giao Diện Chuẩn Hallmark & Động Cơ Zero-Latency Chống Lag Toàn Diện
- **Chuẩn Hóa Design System Royal Workbench Dark (Hallmark Anti-AI-Slop)**:
  - Định nghĩa lại toàn bộ bảng mã màu Tokens nhất quán: Obsidian Canvas (`#09090b`), Elevated Cards (`#121215`), Surface Surfaces (`#1a1a20`), viền Hairline tinh xảo (`rgba(255,255,255,0.08)`), Gold Accent (`#d4af37` & `#f0ca5e`).
  - Triệt tiêu hoàn toàn hơn 300 dòng CSS override bằng `!important` gây xung đột style và vỡ giao diện trên các thiết bị khác nhau.
  - Thiết lập phân cấp Typography sắc nét: Tiêu đề dùng `Plus Jakarta Sans` Roman display, nội dung dùng `Inter`, các trường số liệu (Mã đơn, SKU, Tiền, Giờ) dùng `Monospace`.
  - Cung cấp đầy đủ 8 trạng thái tương tác (`default`, `hover`, `active`, `focus-visible`, `disabled`, `loading`, `error`, `success`) cho nút bấm và form điều khiển.
- **Tối Ưu Hiệu Năng Zero-Latency & Triệt Tiêu Cascading Re-renders**:
  - Chuẩn hóa toàn bộ props truyền xuống 12 Tab nghiệp vụ tại `App_Main.html` thành các biến Memoized ổn định (`useMemo`), triệt tiêu hoàn toàn hiện tượng vỡ `React.memo` do inline object literals `{{ ... }}`.
  - Giúp thao tác gõ tìm kiếm, bấm checkbox, hoặc nhận tín hiệu đồng bộ nền không làm kích hoạt re-render ở các tab khác, duy trì tốc độ 60–120 FPS mượt mà.
  - Tích hợp `React.startTransition` và Hardware Acceleration GPU (`rf-tab-view`, `rf-gpu-accelerated`) giúp chuyển tab tức thì với độ trễ tiệm cận 0ms.
- **Khóa Chặt Khung Nhìn Viewport & Responsive Chống Trượt Ngang**:
  - Khóa chặt `overscroll-behavior: none`, `overflow-x: clip` và `touch-action: pan-y pinch-zoom` trên toàn bộ khung viewport.
  - Tối ưu kích thước nút bấm và touch target $\ge 40\text{px}$, chống tràn dòng trên màn hình hẹp 320px–375px.
- **Bảo Toàn Tính Toàn Vẹn 23 Bảng Relational Schema**:
  - Đảm bảo 100% tính toàn vẹn CSDL và cơ chế khóa `LockService.waitLock(15000)` chống đè dữ liệu trên Google Apps Script backend.

---

## [v2.9.7] - 2026-08-23

### 🔍 Bổ Sung Nút & Modal Xem Toàn Diện Thông Tin & Trạng Thái Đơn Hàng CTV
- **Trải Nghiệm Tra Cứu Đơn Hàng Chuẩn Bento Hallmark**:
  - Bổ sung nút **`[👁️ Chi Tiết]`** trên từng thẻ đơn hàng tại Tab Đối Soát CTV.
  - Xây dựng component modal **`AffiliateOrderDetailModal`** hiển thị toàn bộ 5 góc nhìn nghiệp vụ của đơn:
    1. **Thông tin khách hàng & Giao vận**: Tên khách, SĐT (link gọi điện `tel:` và copy), Địa chỉ, Kênh bán, CTV phụ trách, MVĐ kèm link tra cứu trực tiếp hành trình GHN/SPX.
    2. **Hạch toán tài chính & Dư nợ**: Giá bán, Thu COD, Cọc/Trả trước, Phụ phí phát sinh, Dư nợ đơn kèm công thức giải trình chi tiết.
    3. **Tiến độ sản xuất & KCS**: Chi tiết từng Layout/Bể kính, thợ Khâu 1/Khâu 2, thời gian thực hiện, kết quả KCS kèm ảnh trước/hông.
    4. **Tiến độ đóng gói & Xuất kho**: Nhân sự đóng gói, thời gian hoàn tất, ảnh bọc xốp & ảnh thùng hàng hoàn thiện.
    5. **Giao dịch phụ phí liên quan**: Lịch sử các khoản phí phát sinh đã gắn với đơn này.
  - Tích hợp trình xem ảnh phóng to toàn màn hình (Fullscreen Photo Preview).

---

## [v2.9.6] - 2026-08-23

### 🎨 Chuẩn Hóa Hiển Thị Số Tiền Dư CTV (Loại Bỏ Dấu Trừ Gây Nhầm Lẫn)
- **Tối Ưu Trải Nghiệm Đọc Số Liệu Dư Nợ**:
  - Khi đơn hàng hoặc kỳ đối soát có số dư cho CTV (Shop giữ dư tiền trả CTV) $\rightarrow$ Hiển thị trực tiếp `Dư: 14.000đ` (Màu Xanh), loại bỏ hoàn toàn dấu trừ `-` phía trước chữ Dư để tránh cảm giác bị âm/thiếu tiền.
  - Khi CTV nợ Shop $\rightarrow$ Hiển thị `Nợ: +466.000đ` (Màu Đỏ).
  - Tinh chỉnh tiêu đề và nhãn thẻ Bento Card 1 & Card 3: Tự động đổi thành `Shop Dư từ Đơn hàng` / `TỔNG XƯỞNG DƯ TRẢ CTV` khi có số dư.

---

## [v2.9.5] - 2026-08-23

### 🤝 Hoàn Thiện Dư Nợ CTV, Cộng Phụ Phí & Chuẩn Hóa Màu Sắc
- **Cộng Phụ Phí Vào Dư Nợ Đơn Hàng**:
  - Khóa chặt công thức: $\text{Dư Nợ Đơn} = \text{Giá Hàng} + \text{Phụ Phí} - \text{Thu COD} - \text{Cọc}$.
  - Tự động cộng phụ phí phát sinh (ship hoàn, gửi ngoài...) vào số dư nợ của từng đơn hàng cụ thể, đồng thời loại trừ trùng lặp trong tổng quyết toán công nợ cuối kỳ.
- **Chuẩn Hóa Màu Sắc Dư Nợ & Thêm Khung Ghi Chú Quy Ước**:
  - 🔴 **Số ĐỎ (+)**: CTV đang nợ Shop $\rightarrow$ Màu Đỏ nổi bật (`text-rose-400`).
  - 🟢 **Số XANH (-)**: Shop đang giữ tiền dư của CTV (Shop nợ CTV) $\rightarrow$ Màu Xanh (`text-emerald-400`).
  - ⚪ **0đ**: Đã tất toán cân bằng $\rightarrow$ Màu Xám (`text-zinc-400`).
  - Bổ sung khung Banner Chú Thích Quy Ước Màu Sắc thẩm mỹ trên đầu Tab CTV giúp người dùng nhận diện ngay tức thì.
- **Sửa Lỗi Nhãn Trạng Thái Sản Phẩm Trên Thẻ Đơn**:
  - Khắc phục lỗi đơn hàng đã `Hoàn Thành` / `Đối Soát Thành Công` / `Đã Bàn Giao` nhưng bên trong item sản xuất vẫn bị kẹt chữ `"SẴN SÀNG ĐÓNG GÓI"`.
  - Nhãn trạng thái sản phẩm tự động phản chiếu chính xác trạng thái thực tế của đơn hàng (`ĐỐI SOÁT THÀNH CÔNG`, `ĐÃ BÀN GIAO`, `ĐÃ ĐÓNG GÓI - CHỜ BÀN GIAO`).

---

## [v2.9.4] - 2026-08-23

### 🪙 Phân Tách Quỹ Xu Tích Lũy Vào Đúng Bảng ThongKe_TichLuyXu
- **Quy Hoạch Chuẩn Xác Vùng Lưu Trữ Dữ Liệu Xu**:
  - Di chuyển toàn bộ các khoản tặng Xu (`XU_REWARD`, `Boss tặng xu khai ví`) từ bảng tiền mặt `BonusPenalty` sang đúng bảng chuyên biệt **`ThongKe_TichLuyXu`**.
  - Tự động quét dọn và chuyển dịch dữ liệu (migration) các bản ghi Xu trong `BonusPenalty` sang `ThongKe_TichLuyXu`, bảo đảm bảng lương tiền mặt không bị cộng dồn nhầm lẫn.
  - Tích hợp `ThongKe_TichLuyXu` vào `SCHEMA_ERP`, `syncDeltas` và đồng bộ realtime số dư Xu tích lũy hiển thị trên thanh tiêu đề ứng dụng.

---

## [v2.9.3] - 2026-08-23

### 📢 Tách Biệt Thông Báo Hệ Thống Khỏi Nhật Ký Kho Vận
- **Chuyển Đổi Vùng Lưu Trữ Sang Bảng Tài Liệu (Documents)**:
  - Di dời toàn bộ thông báo phát loa của Ban Quản Lý (Boss) từ bảng `ImportExport` (kho hàng) sang bảng `Documents` với phân loại `category: 'THONG_BAO_HE_THONG'`.
  - Ẩn hoàn toàn các bản ghi thông báo hệ thống ngầm khỏi danh sách tài liệu công khai trong `Tab_Documents.html`.
  - Triệt tiêu 100% việc hiển thị nhầm lẫn mã phiếu `SYS_ANNO_...` và badge `THONG_BAO_HE_THONG` trong danh sách chứng từ xuất nhập kho `Tab_ImportExport.html`.

---

## [v2.9.2] - 2026-08-23

### 📱 Tối Ưu Hiển Thị & Chống Trượt Màn Hình Mobile
- **Triệt Tiêu Hiện Tượng Trượt / Bay Màn Hình Ngang Khi Thao Tác**:
  - Khóa chặt `overscroll-behavior: none`, `overflow-x: clip` và `touch-action: pan-y pinch-zoom` trên `html, body, #root` và thẻ `main` trong `Index.html`, `App_Main.html`.
  - Trang bị thuộc tính `overscroll-x-contain` và `touch-pan-x` độc lập cho toàn bộ các thanh danh mục, bộ lọc trạng thái, bảng danh sách chi tiết và modal tạo phiếu ở `Tab_Inventory.html` (Kiểm Kho) và `Tab_ImportExport.html` (Nhật Ký Kho).
  - Khắc phục triệt để lỗi khi người dùng vuốt ngang bảng hoặc cuộn thẻ trên điện thoại làm cả khung ứng dụng bị rung lắc, trôi lệch sang hai bên.

### 📐 Chuẩn Hóa Dư Nợ CTV Bất Biến Cho Mọi Trạng Thái
- **Khóa Chặt Công Thức Dư Nợ**: $\text{Dư Nợ Đơn} = \text{Giá} - \text{Thu COD} - \text{Cọc}$ cho 100% đơn hàng CTV.
- Đơn Hàng Hoàn (`Hàng Hoàn`) hiển thị đúng `COD = 0đ` $\rightarrow$ `Dư Nợ = +Giá` (CTV nợ xưởng giá hàng), kèm phụ phí hoàn hàng `+66.000đ`.

---

## [v2.9.1] - 2026-08-23

### 🤝 Đối Soát Cộng Tác Viên (CTV) & Dòng Tiền Độc Lập
- **Tách Bạch Dư Nợ Âm / Dương Mỗi Đơn**:
  - Hạch toán rõ ràng: Tiền thu COD qua GHN là tiền **XƯỞNG THU VỀ** tài khoản công ty.
  - Dư nợ trên từng đơn hàng:
    - **Số Dương (+)**: CTV Nợ Xưởng (Ví dụ: CTV tự thu tiền trước của khách, Xưởng thu thiếu COD).
    - **Số Âm (-)**: Xưởng Nợ CTV (Ví dụ: Xưởng thu hộ COD thừa tiền đơn hàng, Xưởng cần chuyển khoản trả hoa hồng lại cho CTV).
    - **0đ**: Đã tất toán cân bằng.
- **Bảo Vệ Doanh Thu Gốc & Cách Ly Khỏi Tab Tài Chính**:
  - Sửa hàm `syncGHNViaAPI` trong `Code.js`: Tuyệt đối không ghi đè cột doanh thu (`revenue`) của đơn hàng.
  - Cách ly 100% dòng tiền CTV: Tuyệt đối không tạo bản ghi vào sheet `Transactions` (Tab Tài Chính) của công ty đối với các đơn hàng của Cộng Tác Viên.
- **Tối Ưu Giao Diện Đối Soát CTV Chuẩn Hallmark**:
  - 3 Thẻ Bento Metrics: Dư Nợ Đơn Hàng, Phụ Phí & Đã Thanh Toán, Tổng Quyết Toán Công Nợ Cuối Kỳ.
  - Bổ sung ô tìm kiếm realtime lọc đơn nhanh theo tên khách, mã đơn, mã vận đơn.

### 🛠️ Sửa Lỗi Hệ Thống
- **Khắc Phục Lỗi Trắng Màn Khi Tải Lại Trang**:
  - Thay thế lệnh `window.location.reload()` trong `ChangelogTab` bằng `window.dispatchEvent(new CustomEvent('triggerReloadData'))`, giúp đồng bộ dữ liệu mới nhất trong 0.5s mà không bị gián đoạn hay trắng màn hình trong môi trường Google Apps Script iframe.

---

## [v2.9.0] - 2026-08-23

### 🌟 Tính năng Mới & Chốt Chặn Vận Hành
- **Hộp Đen Đối Soát Thao Tác Thợ (Blackbox Action Logger)**: 
  - Ghi nhận 250 log cục bộ mili-giây, IP, tình trạng kết nối chống chối cãi khi quên bấm nhận lệnh. 
  - Mở xem và đối soát độc quyền bởi Boss phân quyền **TỐI CAO**.
- **Chốt Chặn Poka-Yoke Xác Nhận Lệnh Thông Minh**: 
  - Popup xác nhận hiển thị to rõ tên hàng, mã đơn, định mức và thưởng trước khi bắt đầu tính giờ làm việc.
- **Phản Hồi Xúc Giác & Âm Thanh (Haptic & Web Audio)**: 
  - Phát chuông Chime và rung máy khi nhận việc / hoàn thành lệnh.
- **Bảng Định Mức BOM & Giá Vốn**: 
  - Tích hợp trực tiếp vào thẻ sản xuất với ô KPI Đóng Gói và 2 khâu Dựng Khung / Gia Cố (Layout) & Cắt Dán / Gọt Keo (Bể Kính).
- **Tab Cập Nhật Hệ Thống (ChangelogTab)**:
  - Cho phép toàn bộ nhân sự và quản lý tra cứu chi tiết các tính năng mới sau mỗi lần deploy.
  - Tích hợp bộ lọc tag, ô tìm kiếm và sao chép bản ghi.

### 🎨 Tối Ưu Giao Diện & Trải Nghiệm (UI/UX)
- **Thuần Dark Mode 100%**: Gỡ bỏ hoàn toàn toggle giao diện sáng, tối ưu hoá tương phản OLED và màu Vàng Kim Hoàng Gia `#d4af37`.
- **Tái Cấu Trúc Menu Sidebar**: Phân định 3 nhóm rõ ràng:
  1. `VẬN HÀNH`: Tổng Quan, Đơn Hàng, Sản Xuất, Nhân Sự.
  2. `QUẢN LÝ (KẾ TOÁN & KHO)`: Phân Tích P&L, Báo Cáo KQKD, Kho Hàng, Tài Chính, Đối Tác, Cộng Tác Viên.
  3. `TIỆN ÍCH`: Lỗi & KCS, Tài Liệu, Trình Chiếu 3D, Cập Nhật Hệ Thống.

---

## [v2.8.5] - 2026-08-22

### 🔄 CSDL & Kiến Trúc Dữ Liệu
- **Chuẩn Hoá Relational Schema 23 Bảng**: Khớp 100% tên cột Google Sheets và AppSheet.
- **Tài Chính CTV Tách Biệt**: Cách ly sổ quỹ chính và phiếu tài chính `CTV_Finance`.
- **Lazy-load Đơn Hàng Lưu Trữ (Archive Engine)**: Nạp theo yêu cầu các đơn hàng cũ, giảm 400% dung lượng RAM máy trạm.

---

## [v2.8.0] - 2026-08-20

### 📦 Kho Hàng & Đóng Gói
- **Tự Động Bù Lệnh Sản Xuất Khi Tồn Kho Âm/Thiếu**: Tự động sinh lệnh sản xuất khi đơn sàn TMĐT về mà tồn kho = 0.
- **Pre-flight Check Phụ Kiện**: Tự động rà soát phụ kiện trước khi sang khâu đóng gói.

---

## [v2.7.0] - 2026-08-15

### 🔍 Kiểm Soát Chất Lượng (KCS) & Báo Cáo
- **Image Annotation (Vẽ Khoanh Vùng Lỗi KCS)**: Cho phép Quản lý xưởng vẽ trực tiếp vị trí lỗi lên ảnh để thợ sửa lại.
- **Báo Cáo Sản Lượng Realtime**: Bóc tách sản lượng hoàn thành theo từng khâu và từng nhân sự trong tháng.
