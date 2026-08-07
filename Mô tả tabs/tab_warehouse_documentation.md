# Tài Liệu Đặc Tả Chi Tiết: Tab Kho Hàng (Inventory Tab)

File gốc: [`Tab_Inventory.html`](file:///c:/Users/ADMIN/RF_Workspace_Pro/Tab_Inventory.html)

Dưới góc nhìn của một kỹ sư thiết kế giải pháp ERP (Top 0.1%), quản lý kho không chỉ là việc đếm "nhập bao nhiêu, xuất bao nhiêu". Bài toán khó nhất của một xưởng sản xuất là **tính giá thành (COGS - Cost of Goods Sold) cho các sản phẩm tuỳ biến (Custom-made)**, nơi mà việc đếm từng giọt keo hay từng mét vuông kính là bất khả thi. 

Tab Kho Hàng của RF Workspace đã giải quyết bài toán này một cách cực kỳ thanh lịch và thông minh bằng "Thuật Toán Phân Bổ Tiêu Hao Tỉ Trọng". 

Dưới đây là kiến trúc chi tiết.

---

## 1. Kiến Trúc Giao Diện & UX (UI Architecture)

Module Kho Hàng chia làm 4 luồng chính (Sub-tabs): `Kho Hàng`, `Nhật Ký`, `Kiểm Kho`, và `Phân Bổ Xưởng`.

### 1.1 Hệ Thống Quản Lý Biến Thể (Variant Grouping)
- Các phần mềm bán lẻ thường list sản phẩm phẳng (Flat List). RF Workspace gộp sản phẩm theo `baseName` (Mẫu gốc) thông qua thủ thuật tách chuỗi `name.split(' - ')`. 
- **Lợi ích UX:** Giao diện rất gọn gàng. 1 thẻ sản phẩm đại diện cho hàng chục kích thước. Người dùng ấn vào thẻ sẽ sổ ra các phiên bản (Kích thước 30, 40, 60...).
- Tự động hiển thị cảnh báo **"CẦN NHẬP"** (Màu vàng - Dưới định mức Min) và **"HẾT HÀNG"** (Màu Đỏ).

### 1.2 Tích hợp Đa phương tiện 3D (3D Model Viewer)
- Hỗ trợ không chỉ ảnh sản phẩm 2D mà còn hỗ trợ **Mô hình 3D (.glb)**.
- Tích hợp thẻ `<model-viewer>` để thợ có thể xoay, zoom, xem trước bản vẽ 3D của các Layout/Bể Kính trực tiếp trên web app. 
- *Insight:* Điều này biến màn hình Kho hàng thành một thư viện thiết kế (Design Library) thực thụ dành riêng cho ngành setup thuỷ sinh/layout.

### 1.3 Quy đổi Đơn Vị Động (Dynamic Unit Conversion)
- Sản xuất thường nhập theo Lô/Thùng nhưng xuất theo Cái/Gram. 
- Module hỗ trợ thiết lập tỷ lệ quy đổi (VD: 1 Thùng = 100 Cái). Giúp cho việc làm phiếu nhập kho trở nên dễ dàng cho kế toán, nhưng tồn kho vẫn chi tiết cho thợ xuất kho.

---

## 2. Điểm Nhấn Kiến Trúc (The 0.1% Masterpiece): Trạm Phân Bổ Kế Toán Sản Xuất

Đây là trái tim của việc tính toán lỗ/lãi. Thuật toán **"Chia Tỉ Trọng Toàn Xưởng"** (FactoryInventoryCheck).

### Bài Toán Khó (Pain point)
Trong xưởng thuỷ sinh, một chai keo Sillicon A300 có thể dán được 3 bể to hoặc 10 bể nhỏ. Không ai có thể đo lường chính xác mỗi bể dùng hết bao nhiêu ml keo để tính giá vốn. Nếu bắt thợ đo đếm từng mililit sẽ làm đình trệ toàn bộ sản xuất.

### Giải Pháp Của RF Workspace
Thay vì tính từ "Dưới lên" (Bottom-up), hệ thống tính từ "Trên xuống" (Top-down) qua 5 bước tự động:

1. **Chốt Tồn Thực Tế (Stocktaking):** 
   - Quản lý kho lôi các vật tư ra đếm. Nhập số liệu đếm được vào ô `Tồn thực tế`.
2. **Tính Ra Độ Lệch (Consumed Value):** 
   - `Giá Trị Tiêu Hao = (Tồn sổ sách - Tồn thực tế) * Giá vốn`. 
   - VD: Sổ sách còn 10 chai keo, thực tế đếm còn 2 chai -> Xưởng đã dùng hết 8 chai (Tương đương 800.000đ).
3. **Gom Đơn Hàng Chưa Chốt:** 
   - Hệ thống tự động gom tất cả các lệnh sản xuất đã *Hoàn Thành* nhưng chưa được phân bổ Giá vốn (COGS = 0).
4. **Chia Tỷ Trọng Kích Thước (Size Coefficient weighting):** 
   - Không chia đều 800.000đ cho các đơn, mà chia theo hệ số kích thước (`sizeCoefficient`). 
   - VD: Đơn bể 120cm (Hệ số 2.0) sẽ gánh nhiều giá vốn hơn đơn bể 60cm (Hệ số 1.0).
5. **Cập nhật Đồng loạt (Push Deltas):** 
   - Ghi đè số lượng tồn kho mới và ốp Giá vốn (COGS) chuẩn xác cho từng đơn hàng vào database chỉ bằng 1 nút bấm.

### Tại sao lại là tư duy Top 0.1%?
- Nó **giải phóng** hoàn toàn thợ thuyền khỏi việc báo cáo tiêu hao lẻ tẻ lắt nhắt. 
- Cực kỳ **thực tế** cho các xưởng gia công tuỳ biến (Custom Fabrication).
- Đảm bảo **báo cáo tài chính luôn khớp 100%** (Vì tiền tiêu hao được trừ thẳng vào kho vật tư tổng, không thất thoát 1 đồng nào trên giấy tờ).

---

## 3. Quản Trị Phân Quyền (RBAC)
- Khả năng giấu kín **"Giá Vốn"** và **"Lợi Nhuận"**: Chỉ `KẾ TOÁN`, `QUẢN LÝ KHO` và `TỐI CAO` mới được phép nhìn thấy (hiển thị `******` cho CTV hoặc nhân viên thường).
- Thợ chỉ xem được mã Hàng hoá và Tồn kho để biết vật tư nằm ở đâu.

## Tổng Kết
Tab Kho Hàng (`Tab_Inventory.html`) không chỉ là một Module MRP (Material Requirements Planning) cơ bản, mà thực chất nó sở hữu một bộ máy tính toán Giá Thành (Costing Engine) xuất sắc, phù hợp tuyệt đối với mô hình sản xuất tinh gọn (Lean Manufacturing).
