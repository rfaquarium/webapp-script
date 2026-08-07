# Tài Liệu Đặc Tả Chi Tiết: Tab Sản Xuất (Production Tab)

File gốc: [`Tab_Production.html`](file:///c:/Users/ADMIN/RF_Workspace_Pro/Tab_Production.html)

Tab Sản Xuất là hệ thống MES (Manufacturing Execution System) thu nhỏ của phân xưởng. Nó quản lý từng công đoạn làm việc của thợ, tự động đo lường thời gian (KPI), nghiệm thu chất lượng bằng hình ảnh, và liên kết ngược lại với hệ thống Đơn Hàng.

Dưới đây là đặc tả chi tiết toàn bộ logic và kiến trúc đang vận hành:

---

## 1. Các Component Cốt Lõi

### A. `<ProductionTab />` (Trung tâm điều phối xưởng)
Đây là màn hình bao quát tổng thể của Quản lý và Thợ.
- **Phân loại Ngành hàng (`typeTab`):** Chia làm 2 nhóm rõ rệt dựa theo Tên/Type sản phẩm chứa từ "Bể":
  - `Bể Kính`: Có 2 công đoạn (Cắt Dán -> Gọt Keo).
  - `Layout`: Có 2 công đoạn (Dựng Khung -> Gia Cố).
- **Trạng thái Lệnh (`statusTab`):**
  - `CHỜ SẢN XUẤT`: Gồm các lệnh thợ chưa nhận, hoặc đang làm dở (In Progress).
  - `KIỂM ĐỊNH`: Các lệnh thợ đã ấn "Done" tất cả các công đoạn nhưng chờ Quản lý duyệt cuối.
  - `ĐÃ XONG`: Hoàn thành KCS. (Mặc định ở tab này các Kênh Bán sẽ được **thu gọn** `collapsedGroups` để dễ nhìn).
  - `ĐÃ HUỶ`: Lệnh bị khách huỷ ngang hoặc quản lý huỷ.
- **Gom nhóm Kênh Bán:** Các lệnh sản xuất tự động nhóm theo Kênh (Quốc Tế, Bảo Hành, Shopee, Bán Lẻ...). Quản lý có thể bấm vào Header để Đóng/Mở nhóm.
- **Tạo Lệnh Tồn:** Nút dấu `+` màu vàng dành riêng cho Admin tạo lệnh "Sản Xuất Tồn" (không cần gắn với đơn hàng của khách).

### B. `<WorkerCardV2 />` (Thẻ Lệnh Sản Xuất)
Mỗi thẻ đại diện cho 1 sản phẩm (1 Item) cần làm.
- **Hiệu ứng Nhận diện (Visual Enforcement):** 
  - Đang làm: Viền nhấp nháy đèn Neon xanh lá (hoặc cam).
  - Có lỗi/Bị trả về (`Chất Lượng Kém`): Viền nhấp nháy Neon Đỏ chớp liên tục để thợ phải ưu tiên làm lại ngay.
- **Ghi chú đa luồng:**
  - `Ghi chú Lệnh`: Hiển thị dải màu đỏ (Cảnh báo riêng cho cái bể/khung này).
  - `Ghi chú Đơn Hàng`: Hiển thị dải màu xanh (Cảnh báo từ Sale truyền xuống xưởng).
- **Quản lý QC Khung (Chỉ hiện với Admin):**
  - Khi thợ làm xong Khâu 1, thẻ sẽ hiện ra bảng Duyệt Khung kèm 2 ảnh (Mặt trước, mặt nghiêng).
  - Nút **TỪ CHỐI LÀM LẠI**: Bật modal `ImageAnnotationModal` để Admin dùng chuột vẽ khoanh tròn điểm lỗi trên ảnh và gửi trả lại Khâu 1.
  - Nút **DUYỆT ĐẠT**: Mở khoá (Unlock) Khâu 2 cho thợ tiếp theo làm. Đồng thời chấm công và tính tiền thưởng cho thợ Khâu 1.
- **Kiểm định cuối KCS (Chỉ hiện với Admin):**
  - Khi cả 2 khâu hoàn thành. Bấm **DUYỆT ĐẠT KCS**. 
  - **Logic Auto-Link tới Đơn Hàng:** Code sẽ vòng ngược lại tìm mảng `prodItems` của cái đơn gốc. Nếu phát hiện *tất cả các sản phẩm khác* trong đơn đó cũng đã XONG, nó sẽ tự động update cái Đơn Hàng thành trạng thái **"Sẵn Sàng Đóng Gói"** (Đồng bộ tuyệt đối).
  - Nút **LÀM LẠI**: Ép buộc trạng thái của khâu chỉ định (vd Phase 1) quay về `Pending` kèm lý do.

### C. `<WorkerPhaseV2 />` (Từng Công Đoạn Nhỏ - VD: Cắt Dán, Gọt Keo)
Đây là nơi Thợ tương tác trực tiếp.
- **Khoá Liên Hoàn (Interlock Logic):**
  - Khâu 2 luôn bị `isLocked = true` nếu Khâu 1 chưa `Done` hoặc chưa được QC `Đã duyệt`.
- **Ràng buộc Chấm Công:** Khi thợ ấn nút "NHẬN LÀM" (`In Progress`), code sẽ quét mảng `Attendance` trong ngày. Nếu thợ chưa Check-in (vân tay/app), hệ thống sẽ chặn không cho nhận việc.
- **Đồng hồ Đếm Ngược (Live KPI Timer):**
  - Gọi hàm `getSopAndReward` (Nằm ở `Config.html`) để tính ra Định Mức Thời Gian (Ví dụ: 30 phút) tuỳ vào Kích thước và Độ chi tiết.
  - Đồng hồ đếm ngược từng giây. Vạch Progress Bar đổi màu Xanh -> Cam -> Đỏ.
- **Nghiệm Thu Hình Ảnh (`handlePhotoUpload` & `submitQC`):**
  - Thợ phải tải ảnh lên Google Drive (qua `runGAS('uploadImage')`). 
  - **Phạt Trễ Hạn:** Ngay khi tải ảnh xong, hệ thống chốt giờ (`endTime`). Tính khoảng cách so với `start`. Nếu thời gian làm > Định Mức => Tự động phạt gạch bỏ toàn bộ tiền thưởng (`reward_vnd = 0`), ghi chú "Trễ hạn - Cắt Thưởng KPI". Ngược lại thì thưởng tiền.

---

## 2. Luồng Dữ Liệu Thực Tế (Data Flow)

1. **Khởi tạo:** Một lệnh sản xuất được sinh ra (Trạng thái: `CHỜ SẢN XUẤT`).
2. **Nhận Việc (Phase 1):** Thợ A ấn "Nhận Làm" -> Status Phase 1 chuyển thành `In Progress`. Đồng hồ tính KPI bắt đầu chạy.
3. **Chụp QC (Phase 1):** Thợ A xong việc, bắt buộc chụp 2 ảnh góc thẳng và góc nghiêng -> Gửi duyệt -> Trạng thái Lệnh chuyển thành `Chờ duyệt khung`.
4. **Duyệt Khung:** Quản lý xem 2 ảnh. 
   - Nếu từ chối, vẽ lỗi -> Phase 1 bị đẩy về `Pending` để sửa.
   - Nếu duyệt đạt -> Phase 1 thành `Done`, tiền thưởng của Thợ A được chốt. Phase 2 được MỞ KHOÁ.
5. **Nhận Việc (Phase 2):** Thợ B nhận làm Khâu 2 -> `In Progress`.
6. **Hoàn Thành (Phase 2):** Thợ B chụp 1 ảnh kết quả cuối -> Phase 2 `Done`. Trạng thái lệnh tổng chuyển sang `KIỂM ĐỊNH`.
7. **Duyệt KCS Cuối:** Quản lý xem thực tế. Bấm "DUYỆT ĐẠT KCS" -> Lệnh chuyển sang `ĐÃ XONG`. (Đồng thời kích hoạt hook chuyển trạng thái Đơn Hàng gốc sang Sẵn sàng đóng gói nếu đủ điều kiện).

---

## Tổng Kết
Tab Sản Xuất là minh chứng cho việc số hoá triệt để xưởng sản xuất:
1. **Minh bạch:** Đo lường KPI tới từng phút. Trễ hẹn là mất thưởng, giúp tối đa hóa năng suất.
2. **Chặt chẽ:** Không chấm công thì không được nhận việc. Không được duyệt khung thì không được gọt keo.
3. **Tương tác cao:** Đồ hoạ hiện đại (Viền nhấp nháy, cảnh báo), cho phép ghim trực tiếp lỗi lên ảnh (`ImageAnnotationModal`).
