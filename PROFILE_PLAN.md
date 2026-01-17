# Kế hoạch Triển khai Toàn diện Tính năng Profile

Tài liệu này chi tiết hóa các bước cần thiết để hoàn thiện tính năng Profile cho Freelance Marketplace, đảm bảo đầy đủ chức năng như Upwork/LinkedIn, giao diện đẹp và trải nghiệm người dùng tối ưu.

## Phase 1: Nâng cấp Sửa thông tin Cơ bản (Data Consistency)
Mục tiêu: Đảm bảo người dùng có thể xem và sửa lại toàn bộ thông tin cá nhân cũ, không phải nhập lại từ đầu.

- [x] **Fix `ProfileEditPage` Form Population**
  - Fetch API `/users/me` (hoặc `/users/:id`) ngay khi component mount.
  - Điền dữ liệu cũ vào các ô: Title, Overview, Hourly Rate.
  - Sửa logic Skills: Hiển thị skills đã có, cho phép xóa/thêm mới.
- [x] **Mở rộng User Schema & API (nếu cần)**
  - Kiểm tra `billingAddress`, `phone` đã có trong form chưa.
  - Thêm phần nhập **Social Links** (Github, LinkedIn, Website, Portfolio URL) vào Schema (nếu chưa lưu dạng JSON/Relation) và trên Form Edit.
- [x] **Avatar & Cover Image Upload**
  - **Frontend**: User clicks on Avatar -> File Picker.
  - **Backend**: API Upload base64 (`avatarUrl`).
  - [x] Cover Image implemented (`coverImageUrl`).
  - Hỗ trợ upload ảnh bìa (Cover Image) để tăng tính cá nhân hóa (giống LinkedIn).

## Phase 2: Module Chuyên môn (Professional Qualifications)
Mục tiêu: Cho phép Freelancer thể hiện năng lực chuyên môn chi tiết.

- [x] **Certifications (Chứng chỉ)**
  - **Backend**: API CRUD đã có (`/users/:id/certifications`).
  - **Frontend**:
    - Tạo `CertificationModal.tsx`: Form nhập Tên chứng chỉ, Tổ chức cấp, ID, URL xác thực, Ngày cấp/Hết hạn.
    - Hiển thị danh sách chứng chỉ trên trang Profile (khu vực Sidebar hoặc Main Content).
- [x] **Languages (Ngôn ngữ)**
  - **Backend**: Update Schema `User` để lưu mảng JSON `languages` (VD: `[{ "lang": "English", "level": "Native" }]`).
  - **Frontend**: Tạo Modal quản lý ngôn ngữ & trình độ.
- [x] **Categories & Services**
  - Cho phép user chọn Primary Category (Lập trình, Thiết kế...) chính xác hơn.

## Phase 3: Độ tin cậy & Huy hiệu (Trust & Badges)
Mục tiêu: Xây dựng lòng tin cho khách hàng (Client) khi xem hồ sơ.

- [x] **Widget "Profile Completeness"**
  - Hiển thị thanh tiến trình (Progress Bar): "70% Profile Strength".
  - Gợi ý hành động tiếp theo: "Add a portfolio item (+10%)", "Verify Identity (+20%)".
  - Logic Frontend tính toán dựa trên các trường dữ liệu còn trống.
- [x] **Hiển thị Huy hiệu (Badges Display)**
  - Tạo Component `BadgeList`.
  - Hiển thị các icon đẹp mắt cho: `Identity Verified`, `Payment Verified`, `Top Rated`, `Rising Star`.
  - Tooltip giải thích ý nghĩa của từng huy hiệu khi hover.
- [x] **Identity Verification UI**
  - Tại tab Security, cải thiện UI phần upload ID card (đã có backend `submitDocumentKyc`).
  - Hiển thị trạng thái "Pending Review" hoặc "Verified" rõ ràng hơn.

## Phase 4: Chế độ Xem & Tương tác (View Modes)
Mục tiêu: Phân biệt giữa việc "Tự xem profile mình" và "Khách hàng xem profile".

- [x] **Public View UI**
  - Ẩn các nút "Edit", "Delete", "Security Settings" khi người xem không phải là chủ sở hữu.
  - Thêm nút **"Invite to Job"** hoặc **"Hire Now"** (dành cho Client).
  - [x] Thêm nút **"Save Freelancer"** (Heart icon) gọi API `/users/saved-freelancers`.
- [x] **SEO & Sharing**
  - Tạo trang Profile Public (`/freelancers/:id`) có thể truy cập mà không cần login (tùy chọn).
  - Cấu hình OpenGraph tags để khi share link profile lên Facebook/LinkedIn hiện ảnh và title đẹp.

## Lộ trình thực hiện chi tiết (Next Steps)
1.  **Ngay lập tức**: Thực hiện **Phase 1** - Sửa form Edit để user cập nhật được thông tin. (Done)
2.  Sau đó: Làm **Phase 2** - Thêm Certification. (Done)
3.  Cuối cùng: Làm **Phase 3 & 4** để trau chuốt UX. (Done)
