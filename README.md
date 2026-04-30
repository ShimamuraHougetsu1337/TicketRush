# 🎫 TicketRush

> High-concurrency ticket booking platform với real-time seat map, pessimistic locking, và virtual queue system.

![NestJS](https://img.shields.io/badge/NestJS-11-ea2845?style=flat-square&logo=nestjs)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-v5-007FFF?style=flat-square&logo=mui)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=flat-square&logo=socket.io)

---

## ✨ Premium UI/UX Redesign (New!)

Hệ thống đã được nâng cấp toàn diện về giao diện (UI) và trải nghiệm người dùng (UX) theo phong cách **Modern Dark Premium**:

- **Dark Mode Aesthetic**: Sử dụng bảng màu tối sâu (Deep Dark) kết hợp với các hiệu ứng Glassmorphism (kính mờ).
- **Responsive Seat Map**: Bản đồ ghế ngồi tương tác mượt mà, hỗ trợ zoom và chọn nhiều ghế cùng lúc với màu sắc trạng thái rõ ràng.
- **Real-time Synchronization**: Trạng thái ghế (Available, Locked, Sold) được cập nhật tức thì qua WebSocket mà không cần reload trang.
- **Admin Analytics**: Dashboard quản trị hiển thị doanh thu, tỷ lệ lấp đầy và biểu đồ hiệu suất thời gian thực.
- **Seamless Checkout**: Quy trình thanh toán được tối ưu hóa với bộ đếm ngược thời gian giữ chỗ (Seat Lock Timer).
- **Custom Typography**: Sử dụng font chữ **Outfit** cao cấp cho trải nghiệm đọc tốt hơn.

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Seat Map UI │  │   Admin      │  │   Zustand Store       │  │
│  │  (MUI v5)    │  │   Dashboard  │  │   (Client Selection)  │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘  │
│         │                 │                      │              │
│         └────────┬────────┴──────────────────────┘              │
│                  │                                              │
│          ┌───────▼────────┐                                     │
│          │  Next.js 14    │                                     │
│          │  (App Router)  │                                     │
│          └───────┬────────┘                                     │
└──────────────────┼──────────────────────────────────────────────┘
                   │  HTTP (REST) + WebSocket
                   │
┌──────────────────┼──────────────────────────────────────────────┐
│                  │          SERVER                               │
│          ┌───────▼────────┐                                     │
│          │   NestJS 11    │                                     │
│          │   API Gateway  │                                     │
│          └───────┬────────┘                                     │
│                  │                                              │
│    ┌─────────────┼──────────────────┐                           │
│    │             │                  │                            │
│    ▼             ▼                  ▼                            │
│ ┌──────┐  ┌───────────┐  ┌──────────────┐  ┌────────────────┐  │
│ │ REST │  │ WebSocket │  │  Cron Jobs   │  │  Virtual Queue │  │
│ │ API  │  │ Gateway   │  │  (Schedule)  │  │  (Redis+Bull)  │  │
│ └──┬───┘  └─────┬─────┘  └──────┬───────┘  └────────────────┘  │
│    │            │               │                               │
│    └────────────┼───────────────┘                               │
│                 │                                               │
│         ┌───────▼────────┐                                     │
│         │  Prisma ORM    │                                     │
│         │  + $executeRaw  │                                     │
│         └───────┬────────┘                                     │
│                 │                                               │
│         ┌───────▼────────┐                                     │
│         │    MySQL 8     │                                     │
│         │  (InnoDB)      │                                     │
│         └────────────────┘                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MySQL 8 running locally
- (Optional) Redis — cho Virtual Queue

### Backend

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Configure database
#    Edit .env → DATABASE_URL="mysql://user:pass@localhost:3306/ticketrush"

# 3. Setup Database & Seed Data
npx prisma db push
npx prisma db seed # Creates Admin, Customer, and Sample Events

# 4. Start dev server
npm run dev
# → http://localhost:8080
```

### Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
# → http://localhost:3000
```

---

## 🔑 Demo Accounts (Seed Data)

Sau khi chạy lệnh `npx prisma db seed`, bạn có thể sử dụng các tài khoản sau để test hệ thống:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@ticketrush.io` | `Password123` |
| **Customer** | `user@ticketrush.io` | `Password123` |

---

## 🗂️ Project Structure

```
TicketRush/
├── backend/                         # NestJS 11 API Server
│   ├── prisma/
│   │   ├── schema.prisma            # Prisma schema (MySQL)
│   │   └── seed.ts                  # Database seeding script
│   ├── src/
│   │   ├── prisma/                  # Database Layer
│   │   ├── auth/                    # JWT Authentication & Login/Register
│   │   ├── booking/                 # Core Booking Domain (Lock/Confirm)
│   │   ├── events/                  # Event management
│   │   ├── users/                   # User management
│   │   └── cron/                    # Scheduled Tasks (Lock Cleanup)
│
└── frontend/                        # Next.js 14 (App Router)
    ├── src/
    │   ├── app/                     # App Router pages (public/customer/admin)
    │   ├── components/              # UI Components (SeatMap, TopNav, Dashboard)
    │   ├── lib/                     # Auth options & Fetch wrappers
    │   └── store/                   # Zustand state management
```

---

## 🔄 Ticket Lifecycle (State Machine)

```mermaid
stateDiagram-v2
    [*] --> AVAILABLE : Seat created

    AVAILABLE --> LOCKED : User locks seat
    note right of LOCKED
        SELECT ... FOR UPDATE
        (Pessimistic Lock)
    end note

    LOCKED --> SOLD : User confirms booking
    LOCKED --> AVAILABLE : User releases
    LOCKED --> AVAILABLE : Cron timeout (10 min)

    SOLD --> [*] : Final state
```

---

## 🔒 Race Condition Handling

Hệ thống sử dụng **Pessimistic Locking (`SELECT ... FOR UPDATE`)** để đảm bảo tính toàn vẹn dữ liệu khi hàng ngàn người dùng cùng đặt một ghế:

1. **Acquire Lock**: Ngay khi user gửi request lock, DB sẽ giữ khóa trên hàng dữ liệu đó.
2. **Double Check**: Kiểm tra lại trạng thái ghế sau khi đã giữ khóa.
3. **Atomic Update**: Cập nhật trạng thái sang `LOCKED` và chỉ release khóa sau khi transaction hoàn tất.

---

