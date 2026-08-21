# QUY TẮC BẢO VỆ HẠN MỨC DEPLOYMENT (STRICT QUOTA DISCIPLINE)

1. Quản lý Phiên bản Web App:
   - Dự án đã chạm mốc 181/200 phiên bản.
   - Tuyệt đối KHÔNG tạo thêm Web App Deployment ID mới (`AKfycb...`).
   - Mọi bản cập nhật code backend (Code.js) và HTML components (Tab_Orders, Tab_Production, Modals_Orders, Tab_Finance, App_Main, Config, Components) chỉ ghi đè trực tiếp lên Script hiện tại hoặc cập nhật vào Deployment ID `AKfycbytd9c_FzcqJ_65nqNI-xplYVRD3gstZcIL6PBk34P81XdSqXTNcRWsYt5bbeqjg66N`.
   - Sử dụng `clasp push` thay vì tạo deployment mới để cập nhật code.
