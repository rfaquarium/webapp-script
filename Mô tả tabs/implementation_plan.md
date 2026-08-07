# 🎯 Đánh Giá UX/UI Phân Hệ Tài Liệu (SOP & Mẫu)

Dưới lăng kính của một Kiến trúc sư Giao diện (Top 0.1%), thiết kế hiện tại của `Tab_Documents.html` sử dụng dạng **Card Grid** rất đẹp và mang lại cảm giác hiện đại (Dark Theme + Gold Accents). Cấu trúc Icon tự động nhận diện định dạng file (Word, Excel, Video) cũng là một điểm cộng lớn cho trải nghiệm người dùng.

Tuy nhiên, nếu xét trên góc độ **Hành vi Doanh nghiệp (Enterprise Behavior)** và **Kỹ thuật Thúc đẩy Tuân thủ (Compliance Gamification)**, bản thiết kế này đang bỏ lỡ 3 "điểm chạm" tâm lý cực kỳ quan trọng.

---

## 🧐 3 Vấn Đề UX Cốt Lõi (Pain Points)

### 1. Thiếu Cơ Chế "Báo Động Ký Nhận" (Unread Blindspot)
- **Hiện trạng:** Thẻ tài liệu có nút "Xem ai đã đọc", nhưng lại **không hề có tín hiệu thị giác nào báo cho chính nhân viên biết rằng họ chưa đọc tài liệu này**. 
- **Tâm lý học UX:** Người dùng sẽ không bao giờ chủ động click từng cái để xem mình đọc chưa. Nếu có một quy định mới (SOP) được tải lên, nhân viên lướt qua sẽ không thấy sự khác biệt so với tài liệu cũ.
- **Hậu quả:** Tỷ lệ đọc và tuân thủ SOP sẽ rất thấp.

### 2. Sự Câm Lặng Của Bộ Lọc (Silent Filters)
- **Hiện trạng:** Thanh Filter (Hướng Dẫn, Biểu Mẫu...) chỉ hiển thị chữ.
- **Tâm lý học UX:** Trải nghiệm người dùng cao cấp luôn đi kèm với "Dự báo dữ liệu". Nếu bấm vào "Biểu Mẫu" mà không có tài liệu nào, người dùng sẽ cảm thấy hụt hẫng.
- **Giải pháp:** Cần có con số Count báo trước lượng tài liệu trong từng danh mục.

### 3. Hiệu Ứng Bức Tường Nút Bấm (Button Wall Effect)
- **Hiện trạng:** Nếu 1 tài liệu đính kèm 3 file (VD: 1 PDF, 1 Video, 1 Excel) + 1 Link kiểm tra. Thẻ tài liệu sẽ phình to ra với 4 cái nút bấm rực rỡ màu sắc chen chúc nhau.
- **Hậu quả:** Gây quá tải nhận thức (Cognitive Overload). Thẻ mất đi sự cân đối.

---

## 🛠️ Đề Xuất Nâng Cấp Chuẩn 0.1% (Implementation Plan)

Nếu bạn đồng ý, tôi sẽ tiến hành "giải phẫu" file `Tab_Documents.html` với 3 nâng cấp sau:

### 🔴 Cải tiến 1: Hiệu ứng "Bắt Ép Chú Ý" (Attention Hijacking)
- Tự động check chéo `currentUser` với danh sách `readBy`. 
- Nếu tài liệu **Chưa Đọc**, hệ thống sẽ gắn một Badge đỏ chót `[CHƯA ĐỌC]` kèm hiệu ứng nhịp đập (Pulse Animation) ở góc phải của Card.
- Khi người dùng click vào xem và bấm "Xác Nhận Đã Đọc", Badge này sẽ vỡ ra và biến mất một cách thỏa mãn. Kỹ thuật này kích thích não bộ con người muốn "dọn dẹp" các thông báo đỏ (giống như việc bạn không chịu nổi khi thấy icon Messenger có số 1 màu đỏ).

### 📊 Cải tiến 2: Smart Filter Counters
- Nhúng thuật toán đếm thời gian thực vào các nút Danh mục.
- Hiển thị thành: `Hướng Dẫn (12)`, `Biểu Mẫu (5)`, `Đào Tạo (0)`. Nhạt màu các danh mục có 0 tài liệu để định hướng thao tác.

### 🗂️ Cải tiến 3: Thu Gọn Hành Động (Smart Action Grouping)
- Nếu tài liệu chỉ có 1 file, giữ nguyên nút mở file lớn.
- Nếu tài liệu có từ 2 file trở lên, gom chúng lại thành một khối Vertical List gọn gàng bên trong thẻ, thay vì để các nút màu mè dàn hàng ngang. (Đồng thời tích hợp tính năng tự động convert Document Data Model cũ sang mảng Array để tránh lỗi).

> [!IMPORTANT]
> **Vui lòng xác nhận**
> Bạn có đồng ý với các phân tích tâm lý học giao diện trên không? Hãy bấm **Proceed** hoặc cho tôi thêm chỉ thị, tôi sẽ bắt tay vào sửa Code ngay lập tức.
