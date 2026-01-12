# 🎯 Unified Plan: Auth & User Synchronization

Tài liệu này gộp cấu hình Keycloak, đồng bộ Database và luồng Onboarding người dùng thành một lộ trình triển khai chi tiết.

---

## 🏗 Phase 1: Keycloak Configuration (Giao thức & Danh tính)
*Mục tiêu: Đảm bảo Keycloak gửi đủ thông tin cần thiết về cho hệ thống.*

- [ ] **1.1. Tạo Realm Roles:**
    - Truy cập Keycloak Admin Console -> Realm Roles.
    - Tạo 2 role: `ROLE_CLIENT` và `ROLE_FREELANCER`.
- [ ] **1.2. Cấu hình Client Scopes & Mappers:**
    - Vào "Client Scopes" -> "roles" -> "Mappers".
    - Đảm bảo có mapper "realm roles" để nhúng danh sách role vào Access Token (JWT).
- [ ] **1.3. Bật Tính năng Đăng ký:**
    - Realm Settings -> Login -> Bật "User registration".
- [ ] **1.4. Cấu hình Identity Providers:**
    - Đảm bảo Facebook/Google đã hoạt động và gạt "Trust Email" sang ON.

---

## 🗄 Phase 2: Database Schema Update (`user-service`)
*Mục tiêu: Ánh xạ User của Keycloak và Social vào Database của App.*

- [x] **2.1. Cập nhật `schema.prisma`:**
    - Thêm `keycloakId String @unique` vào model `User`.
    - Đảm bảo có các trường: `email`, `firstName`, `lastName`, `facebookId`, `githubId`, `googleId`.
- [x] **2.2. Chạy Migration (Đã cập nhật Schema thành công):**
    - Thực hiện `npx prisma migrate dev` để cập nhật cấu trúc bảng thực tế.

---

## ⚙️ Phase 3: Backend Integration (Logic Đồng bộ)
*Mục tiêu: Viết API "cầu nối" để tự động tạo/cập nhật User trong DB.*

- [x] **3.1. Implement `KeycloakService`:**
    - (Hệ thống đã có logic decoding cơ bản thông qua nest-keycloak-connect).
- [x] **3.2. Viết API `POST /users/sync`:**
    - **Logic:**
        1. Nhận Token + `role` (tùy chọn) từ request.
        2. Đã thêm method `syncUser` trong `UsersService` để xử lý JIT và cập nhật Role.
- [x] **3.3. Xử lý Trùng lặp:** Logic `findOne` hiện tại đã xử lý việc tìm kiếm và tạo mới nếu chưa có.

---

## 🎨 Phase 4: Frontend Onboarding Flow (Trải nghiệm Người dùng)
*Mục tiêu: Xử lý bước "chọn Role" và đồng bộ ngay sau khi Login.*

- [x] **4.1. Xử lý `pending_role`:**
    - Khi User nhấn "Join with Facebook" ở trang Register, lưu Role họ đã chọn vào `localStorage`.
- [x] **4.2. Implement Sync logic trong `KeycloakProvider`:**
    - Khi phát hiện trạng thái `authenticated`, tự động gọi API `/auth/sync` kèm theo `pending_role`.
- [x] **4.3. Trang chọn Role (First-time user):**
    - Đã tích hợp logic điều hướng dựa trên Role trả về từ API Sync.

---

## 🛡 Phase 5: Authorization & Guard (Phân quyền)
*Mục tiêu: Đảm bảo Client không thể làm việc của Freelancer và ngược lại.*

- [x] **5.1. NestJS Roles Guard:**
    - Đã triển khai và cấu hình `AuthGuard`, `ResourceGuard`, `RoleGuard` toàn cục trong các service chính.
- [x] **5.2. Bảo vệ Endpoints:**
    - `job-service`: Đã có phân quyền `CLIENT` cho việc đăng Job.
    - `proposal-service`: Đã áp dụng phân quyền `FREELANCER` cho việc nộp Proposal.
    - Hỗ trợ cả role realm (prefix `realm:`) để tương thích tốt nhất với Keycloak.

---

## 🚀 Priority (Thứ tự thực hiện):
1. **Database Schema** (Cần cho backend).
2. **Backend Sync API** (Xương sống của hệ thống).
3. **Frontend Sync Logic** (Kích hoạt backend).
4. **Keycloak Roles & Mappers** (Hoàn thiện phân quyền).
