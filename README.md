# 🎫 TicketRush

Nền tảng đặt vé trực tuyến hiệu năng cao (High-concurrency), hỗ trợ bản đồ ghế ngồi thời gian thực, cơ chế khóa bi quan (Pessimistic Locking) và hệ thống quản lý vòng đời sự kiện tự động.

---

## 🚀 Tính năng cốt lõi

*   **Đồng bộ thời gian thực**: Cập nhật tức thì trạng thái ghế (Trống/Đang giữ/Đã bán) qua WebSocket (Socket.IO).
*   **Chống trùng ghế (Pessimistic Locking)**: Ngăn chặn tình trạng đặt trùng ghế bằng cơ chế `SELECT ... FOR UPDATE` ở mức cơ sở dữ liệu.
*   **Giữ chỗ & Đếm ngược**: Khóa ghế tạm thời 10 phút kèm đếm ngược để người dùng hoàn tất thanh toán.
*   **Tự động hóa hệ thống**: Sử dụng Cron Jobs chạy nền để tự động giải phóng ghế hết hạn và cập nhật trạng thái sự kiện.
*   **Dashboard quản trị**: Theo dõi doanh thu thời gian thực, tỷ lệ lấp đầy và thống kê nhân khẩu học khách hàng.

---

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 14 (App Router), Material UI v5, Zustand, SWR, Socket.io-client.
- **Backend**: NestJS 11, Prisma ORM, WebSockets (Socket.IO).
- **Database**: MySQL 8.

---

## 💻 Hướng dẫn cài đặt & Khởi chạy

### Yêu cầu hệ thống
- Node.js >= 18.x
- Docker (Khuyên dùng để chạy nhanh Database) HOẶC MySQL Server >= 8.0 đã cài trên máy.

---

### Bước 1: Khởi chạy Cơ sở dữ liệu MySQL

Bạn có thể lựa chọn 1 trong 2 cách sau:

#### Cách 1: Sử dụng Docker (Khuyên dùng - Nhanh nhất)
Dự án đã cấu hình sẵn Docker Compose. Bạn chỉ cần chạy lệnh sau tại thư mục gốc của dự án:
```bash
docker compose up -d
```
*Lệnh này sẽ tự động tải, tạo container và khởi chạy MySQL với thông tin cấu hình khớp sẵn với dự án (Port `3306`, Database tên `ticketrush`, password là `root`).*

#### Cách 2: Sử dụng MySQL Server cài trên máy
Nếu sử dụng MySQL cài trực tiếp trên máy:
*   Hãy đảm bảo dịch vụ MySQL đang chạy.
*   **Lưu ý:** Bạn **không cần tạo thủ công database**. Khi bạn chạy lệnh đồng bộ schema ở Bước 2, Prisma sẽ tự động tạo cơ sở dữ liệu mới nếu nó chưa tồn tại.

---

### Bước 2: Cài đặt và Cấu hình Backend

1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Tạo file `.env` từ `.env.example`:
   * Trên Windows: `copy .env.example .env`
   * Trên Linux / macOS: `cp .env.example .env`
4. Cấu hình kết nối cơ sở dữ liệu trong `.env`:
   * Nếu dùng **Docker** (Cách 1 ở Bước 1):
     ```env
     DATABASE_URL="mysql://root:root@localhost:3306/ticketrush"
     PORT=8080
     JWT_SECRET="ticketrush_secret"
     ```
   * Nếu dùng **MySQL cài trên máy** (Cách 2 ở Bước 1): Thay thế `root:root` và cổng `3306` bằng tài khoản MySQL của bạn.
5. Đồng bộ hóa cấu trúc bảng (Prisma sẽ tự động tạo database nếu chưa có) và nạp dữ liệu mẫu:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
6. Khởi chạy backend:
   ```bash
   npm run dev
   ```
   *Backend chạy tại:* [http://localhost:8080](http://localhost:8080)

---

### Bước 3: Cài đặt và Cấu hình Frontend

1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Tạo file `.env.local` từ `.env.example`:
   * Trên Windows: `copy .env.example .env.local`
   * Trên Linux / macOS: `cp .env.example .env.local`
4. Cập nhật các đường dẫn API trong `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   NEXT_PUBLIC_WS_URL=http://localhost:8080/seats
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET="your_nextauth_secret_key_minimum_32_characters"
   ```
5. Khởi chạy frontend:
   ```bash
   npm run dev
   ```
   *Frontend chạy tại:* [http://localhost:3000](http://localhost:3000)

---

## 👥 Tài khoản Demo dùng thử

Hệ thống tự động tạo sẵn các tài khoản sau sau khi chạy lệnh seed:

| Vai trò | Email đăng nhập | Mật khẩu mặc định | Trang trải nghiệm |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@gmail.com` | `123456` | [http://localhost:3000/admin](http://localhost:3000/admin) |
| **Khách hàng (Customer)** | `user@gmail.com` | `123456` | [http://localhost:3000](http://localhost:3000) |
