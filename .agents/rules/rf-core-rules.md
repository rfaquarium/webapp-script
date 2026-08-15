---
trigger: always_on
---

# RF Workspace Pro - Core Architect Rules
- Root Cause Analysis First: Luôn phân tích kỹ nguyên nhân gốc rễ trước khi sửa lỗi, tuyệt đối không sửa mò.
- Revert & Protect: Khi gặp lỗi SyntaxError hoặc crash, ưu tiên kiểm tra cấu trúc đóng/mở thẻ JSX, dấu ngoặc nhọn. Không để sót ký tự rác ở cuối tệp.
- Safe Code Blocks: Luôn cung cấp toàn bộ block code hoàn chỉnh, an toàn khi yêu cầu cập nhật giao diện hoặc logic.
- Kỷ Luật Sửa Đổi Vi Phẫu (Surgical Modification Rule): 
  1. Tuyệt đối KHÔNG tự ý viết lại (rewrite) toàn bộ file hoặc tự thay đổi bố cục/giao diện đã ổn định khi chỉ được yêu cầu sửa/thêm một chi tiết nhỏ.
  2. Dùng `replace_file_content` sửa đúng những dòng code mục tiêu, giữ nguyên 100% logic, thẻ HTML và style cũ xung quanh.
  3. Khi có yêu cầu thay đổi lớn hoặc mơ hồ, luôn trao đổi ngắn gọn đề xuất trước khi sửa code.