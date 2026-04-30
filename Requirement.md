# TicketRush - Tổng hợp toàn bộ yêu cầu bài tập lớn

**Môn học:** INT3306 - Phát triển ứng dụng web  
**Học kỳ:** Spring 2026  
**Dự án:** TicketRush - Đặt vé online  
**Nguồn:** File đề bài `TicketRush.pdf`

---

## 1. Yêu cầu chung

TicketRush là một nền tảng phân phối vé điện tử do một đơn vị tổ chức sự kiện tự xây dựng và vận hành. Hệ thống cho phép đơn vị tổ chức sự kiện đăng tải các sự kiện âm nhạc/giải trí, thiết lập sơ đồ ghế ngồi trực quan và mở bán vé trực tuyến cho khán giả.

Trọng tâm của dự án là xây dựng một hệ thống có khả năng chịu tải tốt, xử lý chính xác tình huống có hàng ngàn người dùng cùng truy cập để giành được một số lượng vé giới hạn trong một khoảng thời gian ngắn, tương tự tình huống **flash sale**.

| Nội dung | Yêu cầu |
|---|---|
| Hình thức làm bài | Làm theo nhóm 3 sinh viên |
| Công nghệ | Tự do lựa chọn công nghệ, framework, library cho frontend và backend |
| Trình bày sản phẩm | Demo trực tiếp tại buổi thi vấn đáp |
| Slide / document | Không cần slide, không cần document |
| Thời gian demo | 11-16/5/2026 |
| Mục tiêu chính | Xây dựng hệ thống đặt vé online có khả năng chịu tải, xử lý tranh chấp đặt vé chính xác |

---

## 2. Vai trò nghiệp vụ trong hệ thống

Hệ thống gồm 2 vai trò nghiệp vụ chính:

1. **Customer - Khán giả**
2. **Admin - Chủ hệ thống kiêm Ban tổ chức**

---

## 3. Yêu cầu chức năng cho Customer

Customer là người dùng cuối của hệ thống, có nhu cầu tìm kiếm sự kiện, chọn ghế, đặt vé, thanh toán và quản lý vé điện tử.

### 3.1. Tìm kiếm và xem sự kiện

Customer cần có khả năng:

- Tìm kiếm sự kiện.
- Xem danh sách sự kiện.
- Xem thông tin chi tiết của một sự kiện.
- Xem sơ đồ chỗ ngồi của sự kiện.

Thông tin sự kiện nên bao gồm:

- Tên sự kiện.
- Mô tả sự kiện.
- Thời gian tổ chức.
- Địa điểm tổ chức.
- Hình ảnh/banner sự kiện.
- Danh sách khu vực ghế.
- Giá vé theo từng khu vực hoặc từng loại ghế.
- Trạng thái mở bán vé.

### 3.2. Chọn ghế

Customer cần có khả năng:

- Xem sơ đồ ghế trực quan.
- Click trực tiếp vào ghế để chọn.
- Nhìn thấy trạng thái từng ghế.
- Biết ghế nào còn trống, ghế nào đang bị giữ, ghế nào đã bán.
- Chọn một hoặc nhiều ghế tùy theo thiết kế của hệ thống.

Các trạng thái ghế nên hiển thị rõ ràng bằng màu sắc hoặc ký hiệu:

| Trạng thái | Ý nghĩa gợi ý |
|---|---|
| Available | Ghế còn trống, có thể chọn |
| Selected | Ghế đang được người dùng hiện tại chọn |
| Locked | Ghế đang được người khác giữ chỗ |
| Sold | Ghế đã được thanh toán / đã bán |
| Released | Ghế từng bị giữ nhưng đã được nhả lại do quá hạn thanh toán |

### 3.3. Giữ chỗ

Customer cần có khả năng:

- Click vào ghế để gửi yêu cầu giữ chỗ.
- Nhận phản hồi thành công nếu giữ ghế thành công.
- Nhận phản hồi thất bại nếu ghế đã bị người khác giữ hoặc đã bán.
- Ghế được giữ trong thời gian quy định.
- Người dùng có thời gian giới hạn để hoàn tất thanh toán.

Yêu cầu quan trọng:

- Một ghế chỉ được giữ bởi một người tại một thời điểm.
- Không được xảy ra tình trạng nhiều người cùng giữ thành công một ghế.
- Backend phải là nơi quyết định việc giữ ghế thành công hay thất bại.

### 3.4. Thanh toán giả lập

Đề bài không yêu cầu tích hợp cổng thanh toán thật.

Chức năng thanh toán chỉ cần:

- Hiển thị đơn hàng hoặc thông tin vé đang mua.
- Hiển thị danh sách ghế đã chọn.
- Hiển thị tổng số tiền cần thanh toán.
- Có nút **XÁC NHẬN**.
- Khi người dùng bấm **XÁC NHẬN**, hệ thống coi như thanh toán thành công.
- Sau khi xác nhận, ghế chuyển sang trạng thái **Sold**.
- Hệ thống tạo vé điện tử cho người dùng.

### 3.5. Nhận và quản lý vé điện tử

Customer cần có khả năng:

- Nhận vé điện tử sau khi thanh toán thành công.
- Xem danh sách vé đã mua.
- Xem thông tin chi tiết từng vé.
- Xem mã QR Code của vé.

Thông tin vé điện tử nên bao gồm:

- Mã vé.
- Mã QR.
- Tên sự kiện.
- Thời gian tổ chức.
- Địa điểm tổ chức.
- Khu vực ghế.
- Số hàng ghế.
- Số ghế.
- Giá vé.
- Thông tin người mua.
- Thời gian mua vé.
- Trạng thái vé.

---

## 4. Yêu cầu chức năng cho Admin

Admin là chủ hệ thống kiêm ban tổ chức. Admin có toàn quyền quản trị nền tảng.

### 4.1. Quản lý sự kiện

Admin cần có khả năng:

- Tạo mới sự kiện.
- Cập nhật thông tin sự kiện.
- Xóa hoặc ẩn sự kiện nếu cần.
- Quản lý trạng thái mở bán của sự kiện.
- Cấu hình thông tin chi tiết của sự kiện.

Thông tin sự kiện cần quản lý:

- Tên sự kiện.
- Mô tả sự kiện.
- Ảnh/banner sự kiện.
- Thời gian tổ chức.
- Địa điểm tổ chức.
- Thời gian bắt đầu mở bán vé.
- Thời gian kết thúc bán vé.
- Trạng thái sự kiện.

### 4.2. Cấu hình sơ đồ ghế

Admin cần có khả năng:

- Thiết lập sơ đồ ghế cho sự kiện.
- Chia khu vực ghế.
- Khai báo ma trận ghế cho từng khu vực.
- Gán giá tiền cho từng loại ghế hoặc từng khu vực.

Ví dụ:

- Khu A có 10 hàng.
- Mỗi hàng có 15 ghế.
- Khu VIP có giá khác khu thường.
- Ghế ở từng khu vực có thể có mã như `VIP-A1`, `A-01`, `B-15`.

### 4.3. Theo dõi doanh thu

Admin cần có dashboard để:

- Theo dõi biến động doanh thu.
- Xem doanh thu theo thời gian thực.
- Xem tổng số vé đã bán.
- Xem tổng tiền thu được.
- Xem doanh thu theo từng sự kiện.
- Xem doanh thu theo từng khu vực ghế.

### 4.4. Theo dõi tình trạng lấp đầy ghế

Admin cần có khả năng:

- Theo dõi số lượng ghế còn trống.
- Theo dõi số lượng ghế đang bị giữ.
- Theo dõi số lượng ghế đã bán.
- Theo dõi tỷ lệ lấp đầy ghế.
- Xem tình trạng ghế theo thời gian thực.

### 4.5. Real-time Dashboard

Dashboard của Admin cần có khả năng cập nhật theo thời gian thực hoặc gần thời gian thực.

Nên hiển thị:

- Doanh thu hiện tại.
- Số vé đã bán.
- Số ghế đang giữ.
- Số ghế còn trống.
- Tỷ lệ lấp đầy.
- Biểu đồ doanh thu theo thời gian.
- Biểu đồ trạng thái ghế.

Có thể dùng:

- WebSocket.
- Server-Sent Events.
- Polling.
- Long polling.

### 4.6. Thống kê khán giả

Admin cần có chức năng thống kê khách hàng theo:

- Độ tuổi.
- Giới tính.

Mục tiêu là giúp ban tổ chức nắm được thị hiếu khách hàng.

Có thể mở rộng thêm:

- Thống kê theo sự kiện.
- Thống kê theo khu vực ghế.
- Thống kê theo thời gian mua vé.
- Thống kê nhóm tuổi mua nhiều nhất.
- Thống kê giới tính theo từng sự kiện.

---

## 5. Yêu cầu kỹ thuật

---

## 5.1. Trải nghiệm sơ đồ ghế

Frontend bắt buộc phải xây dựng được giao diện chọn ghế trực quan.

### Yêu cầu chi tiết

- Giao diện cần hiển thị sơ đồ ghế rõ ràng.
- Ghế cần được thể hiện trực quan, không chỉ là danh sách chữ.
- Customer có thể click vào ghế để chọn.
- Admin có thể khai báo ma trận ghế khi thiết lập sự kiện.
- Sơ đồ ghế cần phản ánh trạng thái thực tế của từng ghế.
- Trạng thái ghế cần tự động cập nhật khi có người khác giữ chỗ.
- Người dùng không cần bấm F5 để cập nhật trạng thái.

### Ví dụ về ma trận ghế

```text
Khu A:
- 10 hàng
- Mỗi hàng 15 ghế
- Tổng cộng 150 ghế
```

### Cập nhật trạng thái ghế

Khi có người khác vừa giữ chỗ, giao diện của các người dùng còn lại phải cập nhật tự động.

Ví dụ:

```text
Ghế A1 đang màu xanh, nghĩa là còn trống.
Người dùng khác giữ ghế A1 thành công.
Giao diện của người dùng hiện tại tự động chuyển ghế A1 sang màu xám.
Người dùng hiện tại không cần tải lại trang.
```

Có thể sử dụng:

- Polling.
- WebSocket.
- Server-Sent Events.

---

## 5.2. Tranh chấp dữ liệu - Database Concurrency

Đây là yêu cầu quan trọng nhằm đảm bảo một ghế không bị bán cho nhiều người.

### Yêu cầu bắt buộc

- Phải áp dụng **Database Transaction** khi xử lý hành động click giữ ghế.
- Phải áp dụng **Row Locking** khi xử lý hành động click giữ ghế.
- Phải đảm bảo không xảy ra **Race Condition**.
- Nếu nhiều người cùng click vào một ghế tại cùng thời điểm, chỉ một người được giữ ghế thành công.
- Các người còn lại phải nhận phản hồi thất bại.

### Tình huống bắt buộc phải xử lý đúng

```text
Nếu 2 người cùng click vào ghế VIP-A1 lúc 09:00:00.001,
chỉ 1 người được giữ ghế thành công.
```

### Nguyên tắc xử lý

- Không được chỉ dựa vào frontend để kiểm tra trạng thái ghế.
- Backend phải kiểm tra lại trạng thái ghế trong transaction.
- Backend phải khóa dòng dữ liệu của ghế trước khi cập nhật.
- Backend phải commit transaction nếu giữ ghế thành công.
- Backend phải rollback hoặc trả lỗi nếu ghế không còn khả dụng.

### Gợi ý luồng xử lý giữ ghế

```text
1. Người dùng gửi request giữ ghế.
2. Backend mở database transaction.
3. Backend khóa row của ghế cần giữ.
4. Backend kiểm tra trạng thái hiện tại của ghế.
5. Nếu ghế còn Available:
   - Cập nhật ghế sang Locked.
   - Ghi thông tin người giữ ghế.
   - Ghi thời gian hết hạn giữ ghế.
   - Commit transaction.
   - Trả về giữ ghế thành công.
6. Nếu ghế không còn Available:
   - Rollback transaction.
   - Trả về giữ ghế thất bại.
```

### Gợi ý SQL với row locking

```sql
BEGIN;

SELECT *
FROM seats
WHERE id = :seat_id
FOR UPDATE;

-- Kiểm tra trạng thái ghế
-- Nếu Available thì cập nhật sang Locked

UPDATE seats
SET status = 'Locked',
    locked_by = :user_id,
    locked_until = :locked_until
WHERE id = :seat_id
  AND status = 'Available';

COMMIT;
```

---

## 5.3. Quản lý vòng đời vé

Vé cần trải qua các trạng thái sau:

```text
Available -> Locked -> Sold
                    -> Released
```

### Ý nghĩa từng trạng thái

| Trạng thái | Ý nghĩa |
|---|---|
| Available | Ghế còn trống, có thể được chọn và giữ |
| Locked | Ghế đang được giữ chỗ để chờ thanh toán |
| Sold | Ghế đã được thanh toán thành công |
| Released | Ghế đã hết hạn giữ chỗ và được nhả lại thị trường |

### Yêu cầu thời gian giữ ghế

- Khán giả chỉ có **10 phút** để thanh toán.
- Trong 10 phút này, ghế ở trạng thái **Locked**.
- Người khác không được đặt ghế đang ở trạng thái **Locked**.
- Nếu hết 10 phút mà người dùng chưa thanh toán, ghế phải được nhả lại.

### Cơ chế tự động nhả ghế

Cần có một cơ chế nền để quét và tự động nhả các ghế đã quá thời gian khóa mà chưa thanh toán.

Có thể dùng:

- Cronjob.
- Background Worker.
- Scheduled Task.
- Queue Worker.

### Luồng release ghế quá hạn

```text
1. Worker chạy định kỳ.
2. Tìm các ghế đang Locked và có locked_until < thời gian hiện tại.
3. Chuyển các ghế đó sang Available hoặc Released.
4. Xóa hoặc cập nhật thông tin locked_by.
5. Thông báo cho frontend cập nhật trạng thái ghế nếu có realtime.
```

### Lưu ý về thanh toán

- Không cần tích hợp cổng thanh toán thật.
- Chỉ cần làm checkout giả lập.
- Người dùng bấm **XÁC NHẬN** thì coi như thanh toán thành công.
- Sau khi thanh toán thành công:
  - Ghế chuyển sang **Sold**.
  - Đơn hàng chuyển sang trạng thái thành công.
  - Vé điện tử được tạo.
  - QR Code được sinh cho vé.

---

## 5.4. Thử thách nâng cao - Virtual Queue

Virtual Queue là hàng chờ ảo dùng để bảo vệ hệ thống khi lưu lượng truy cập tăng đột biến.

### Mục tiêu

- Tránh để database bị quá tải.
- Tránh để hệ thống bị sập khi có quá nhiều người truy cập cùng lúc.
- Điều tiết số lượng người được vào màn hình chọn ghế.
- Phục vụ tốt tình huống flash sale.

### Yêu cầu chi tiết

- Khi lưu lượng truy cập vượt quá sức chịu đựng của database, hệ thống tự động chuyển người dùng vào trang phòng chờ.
- Trang phòng chờ hiển thị vị trí của người dùng trong hàng đợi.
- Người dùng được khuyến cáo không tải lại trang.
- Hệ thống lần lượt cấp token hoặc quyền truy cập đặt vé cho từng nhóm người dùng.
- Ví dụ: mỗi lượt chỉ cho 50 người vào màn hình chọn ghế.

### Giao diện phòng chờ cần có

Ví dụ nội dung hiển thị:

```text
Bạn đang ở vị trí thứ 105 trong hàng đợi.
Vui lòng không tải lại trang...
```

### Cơ chế cấp quyền truy cập

Có thể thiết kế như sau:

```text
1. Người dùng truy cập sự kiện flash sale.
2. Nếu số người đang đặt vé vượt ngưỡng cho phép, người dùng được đưa vào Waiting Room.
3. Hệ thống ghi nhận người dùng vào hàng đợi.
4. Giao diện hiển thị vị trí hàng đợi hiện tại.
5. Theo từng khoảng thời gian, hệ thống cấp token cho một nhóm người dùng.
6. Người có token hợp lệ được vào màn hình chọn ghế.
7. Token có thời hạn sử dụng.
8. Nếu token hết hạn hoặc không hợp lệ, người dùng quay lại hàng chờ hoặc bị từ chối truy cập.
```

### Dữ liệu cần lưu cho Virtual Queue

Có thể cần lưu:

- Mã người dùng hoặc session ID.
- Mã sự kiện.
- Vị trí trong hàng đợi.
- Thời gian vào hàng đợi.
- Trạng thái trong hàng đợi.
- Token truy cập đặt vé.
- Thời gian hết hạn token.

---

## 6. Tiêu chí chấm điểm

Bảng tiêu chí chấm điểm gồm 9 mục với tổng hệ số là 1.0.

| STT | Tiêu chí chấm điểm | Hệ số | Yêu cầu cần đáp ứng |
|---:|---|---:|---|
| 1 | Chức năng và các features đã cài đặt | 0.35 | Cài đặt đầy đủ chức năng Customer, Admin, đặt vé, giữ ghế, thanh toán giả lập, vé điện tử, QR Code, dashboard, thống kê |
| 2 | Thiết kế: Logic, dễ sử dụng | 0.10 | Thiết kế luồng nghiệp vụ hợp lý, thao tác rõ ràng, dễ hiểu, dễ sử dụng |
| 3 | Giao diện: Responsive, đẹp, hiện đại, có bản sắc, đặc trưng nhận dạng thương hiệu nổi bật | 0.20 | Giao diện responsive, hiện đại, có nhận diện thương hiệu TicketRush, dùng tốt trên desktop/mobile/tablet |
| 4 | Hiệu năng | 0.10 | Sử dụng fetch/AJAX để tải bộ phận, không tải lại toàn trang, backend API dùng dữ liệu JSON, cập nhật DOM trên frontend |
| 5 | Phong cách lập trình | 0.05 | Sử dụng mẫu thiết kế, tách biệt mã, tạo giao diện và mã xử lý nghiệp vụ riêng, tổ chức thư viện, trình bày và chú thích mã |
| 6 | Xử lý nhập liệu | 0.05 | Kiểm tra hợp thức, tự động điền, gợi ý, chuyển đổi dữ liệu |
| 7 | An ninh | 0.05 | Xác thực, quản lý phiên, điều khiển truy cập, mã hóa |
| 8 | Viết lại và/hoặc định tuyến URL | 0.05 | Có hệ thống routing rõ ràng, URL thân thiện, định tuyến frontend/backend hợp lý |
| 9 | Thao tác CSDL theo lập trình hướng đối tượng và độc lập CSDL | 0.05 | Có tầng model/repository/service, thao tác CSDL có tổ chức, hạn chế phụ thuộc trực tiếp vào loại CSDL |

---

## 7. Checklist yêu cầu tối thiểu để hoàn thành bài

### 7.1. Checklist Customer

- [ ] Đăng ký tài khoản.
- [ ] Đăng nhập.
- [ ] Xem danh sách sự kiện.
- [ ] Tìm kiếm sự kiện.
- [ ] Xem chi tiết sự kiện.
- [ ] Xem sơ đồ ghế trực quan.
- [ ] Chọn ghế bằng cách click trực tiếp.
- [ ] Giữ ghế trong 10 phút.
- [ ] Xem đồng hồ đếm ngược thời gian thanh toán.
- [ ] Checkout giả lập.
- [ ] Bấm **XÁC NHẬN** để thanh toán thành công.
- [ ] Nhận vé điện tử.
- [ ] Xem QR Code của vé.
- [ ] Xem danh sách vé đã mua.
- [ ] Thấy trạng thái ghế tự động cập nhật không cần F5.

### 7.2. Checklist Admin

- [ ] Đăng nhập admin.
- [ ] Tạo sự kiện.
- [ ] Cập nhật sự kiện.
- [ ] Xóa hoặc ẩn sự kiện nếu cần.
- [ ] Khai báo khu vực ghế.
- [ ] Khai báo ma trận ghế.
- [ ] Gán giá tiền cho từng khu vực hoặc loại ghế.
- [ ] Xem danh sách đơn hàng.
- [ ] Xem danh sách vé đã bán.
- [ ] Xem doanh thu.
- [ ] Xem tỷ lệ lấp đầy ghế.
- [ ] Xem trạng thái ghế theo thời gian thực.
- [ ] Xem dashboard realtime.
- [ ] Xem thống kê khán giả theo độ tuổi.
- [ ] Xem thống kê khán giả theo giới tính.

### 7.3. Checklist Backend

- [ ] API đăng ký.
- [ ] API đăng nhập.
- [ ] API phân quyền Customer/Admin.
- [ ] API lấy danh sách sự kiện.
- [ ] API lấy chi tiết sự kiện.
- [ ] API tạo/sửa/xóa sự kiện cho Admin.
- [ ] API tạo sơ đồ ghế.
- [ ] API lấy trạng thái ghế.
- [ ] API giữ ghế.
- [ ] API release ghế.
- [ ] API checkout giả lập.
- [ ] API tạo vé điện tử.
- [ ] API lấy danh sách vé của người dùng.
- [ ] API dashboard Admin.
- [ ] API thống kê khách hàng.
- [ ] Transaction khi giữ ghế.
- [ ] Row locking khi giữ ghế.
- [ ] Cronjob hoặc worker tự động nhả ghế quá hạn.
- [ ] Cơ chế cập nhật realtime hoặc near-realtime.
- [ ] Kiểm tra validation đầu vào.
- [ ] Kiểm tra bảo mật và phân quyền.

### 7.4. Checklist Database

Nên có các bảng hoặc collection tối thiểu sau:

- [ ] `users` - lưu thông tin người dùng.
- [ ] `roles` - lưu vai trò Customer/Admin.
- [ ] `events` - lưu thông tin sự kiện.
- [ ] `seat_areas` - lưu khu vực ghế.
- [ ] `seats` - lưu từng ghế.
- [ ] `seat_locks` - lưu thông tin giữ ghế nếu tách riêng.
- [ ] `orders` - lưu đơn hàng.
- [ ] `order_items` - lưu chi tiết ghế/vé trong đơn hàng.
- [ ] `tickets` - lưu vé điện tử.
- [ ] `payments` hoặc `checkout_logs` - lưu trạng thái thanh toán giả lập.
- [ ] `queue_entries` - lưu hàng chờ ảo nếu làm Virtual Queue.
- [ ] `queue_tokens` - lưu token truy cập đặt vé nếu làm Virtual Queue.

---

## 8. Yêu cầu về hiệu năng

Để đáp ứng tiêu chí hiệu năng, hệ thống nên có:

- Backend API trả dữ liệu JSON.
- Frontend dùng fetch/AJAX để gọi API.
- Không tải lại toàn bộ trang khi cập nhật dữ liệu.
- Chỉ cập nhật DOM hoặc component cần thay đổi.
- Tối ưu API lấy trạng thái ghế.
- Có phân trang hoặc lazy loading nếu danh sách dữ liệu lớn.
- Có cơ chế hạn chế request quá nhiều vào database.
- Có caching nếu cần.
- Có Virtual Queue để điều tiết tải trong flash sale nếu làm phần nâng cao.

---

## 9. Yêu cầu về giao diện

Giao diện cần đáp ứng:

- Responsive.
- Đẹp.
- Hiện đại.
- Dễ sử dụng.
- Có bản sắc riêng.
- Có nhận diện thương hiệu TicketRush.
- Dùng tốt trên desktop.
- Dùng tốt trên tablet.
- Dùng tốt trên mobile.

Các màn hình nên có:

- Trang chủ.
- Trang danh sách sự kiện.
- Trang chi tiết sự kiện.
- Trang chọn ghế.
- Trang checkout.
- Trang vé của tôi.
- Trang chi tiết vé/QR Code.
- Trang đăng nhập/đăng ký.
- Trang dashboard admin.
- Trang quản lý sự kiện.
- Trang cấu hình sơ đồ ghế.
- Trang thống kê.
- Trang Waiting Room nếu làm Virtual Queue.

---

## 10. Yêu cầu về bảo mật

Hệ thống cần đáp ứng các yêu cầu bảo mật cơ bản:

- Có xác thực người dùng.
- Có quản lý phiên đăng nhập hoặc token.
- Có phân quyền Customer/Admin.
- Customer không được truy cập chức năng Admin.
- Admin mới được tạo/sửa/xóa sự kiện.
- Mật khẩu cần được mã hóa/hash.
- API cần kiểm tra quyền truy cập.
- Dữ liệu đầu vào cần được validate.
- Tránh lộ thông tin nhạy cảm.
- Có thể áp dụng rate limit cho các API quan trọng.

---

## 11. Yêu cầu về xử lý nhập liệu

Hệ thống cần xử lý nhập liệu tốt ở cả frontend và backend.

### Frontend validation

- Kiểm tra trường bắt buộc.
- Kiểm tra định dạng email.
- Kiểm tra mật khẩu.
- Kiểm tra ngày giờ sự kiện.
- Kiểm tra số lượng hàng ghế/cột ghế.
- Kiểm tra giá vé hợp lệ.
- Hiển thị lỗi rõ ràng cho người dùng.

### Backend validation

- Không tin tưởng hoàn toàn dữ liệu từ frontend.
- Kiểm tra lại dữ liệu trước khi ghi vào database.
- Kiểm tra quyền của người gửi request.
- Kiểm tra trạng thái ghế trước khi giữ ghế/thanh toán.
- Kiểm tra thời hạn giữ ghế trước khi xác nhận thanh toán.

---

## 12. Yêu cầu về routing và URL

Hệ thống cần có định tuyến rõ ràng.

Ví dụ frontend routes:

```text
/
/events
/events/:eventId
/events/:eventId/seats
/checkout
/my-tickets
/my-tickets/:ticketId
/login
/register
/admin
/admin/events
/admin/events/new
/admin/events/:eventId/edit
/admin/events/:eventId/seats
/admin/dashboard
/admin/statistics
/waiting-room/:eventId
```

Ví dụ backend API routes:

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/events
GET    /api/events/:id
POST   /api/admin/events
PUT    /api/admin/events/:id
DELETE /api/admin/events/:id
POST   /api/admin/events/:id/seat-map
GET    /api/events/:id/seats
POST   /api/seats/:seatId/lock
POST   /api/orders/checkout
GET    /api/tickets/my
GET    /api/admin/dashboard
GET    /api/admin/statistics
POST   /api/queue/join
GET    /api/queue/status
POST   /api/queue/token/validate
```

---

## 13. Yêu cầu về phong cách lập trình

Để đáp ứng tiêu chí phong cách lập trình, dự án nên có:

- Cấu trúc thư mục rõ ràng.
- Tách frontend và backend.
- Tách controller/service/repository/model.
- Không viết toàn bộ logic vào một file.
- Không viết truy vấn database lẫn trực tiếp vào UI.
- Có module riêng cho xác thực.
- Có module riêng cho quản lý sự kiện.
- Có module riêng cho quản lý ghế.
- Có module riêng cho checkout.
- Có module riêng cho vé điện tử.
- Có module riêng cho dashboard.
- Có comment tại các đoạn xử lý phức tạp.
- Có xử lý lỗi thống nhất.
- Có naming convention rõ ràng.

---

## 14. Gợi ý kiến trúc hệ thống

Một kiến trúc hợp lý có thể gồm:

```text
Frontend
  - Customer UI
  - Admin UI
  - Seat Map UI
  - Waiting Room UI

Backend API
  - Auth Module
  - Event Module
  - Seat Module
  - Order Module
  - Ticket Module
  - Admin Dashboard Module
  - Queue Module

Database
  - Users
  - Events
  - Seats
  - Orders
  - Tickets
  - Queue

Background Worker
  - Release expired locked seats
  - Process queue tokens

Realtime Layer
  - WebSocket / Polling / SSE
  - Seat status updates
  - Admin dashboard updates
```

---

## 15. Các điểm bắt buộc không nên bỏ sót

- [ ] Có 2 vai trò: Customer và Admin.
- [ ] Customer tìm kiếm và xem thông tin sự kiện.
- [ ] Customer xem sơ đồ chỗ ngồi.
- [ ] Customer chọn ghế trực quan bằng cách click vào ghế.
- [ ] Customer giữ chỗ trong thời gian quy định.
- [ ] Customer thanh toán giả lập bằng nút **XÁC NHẬN**.
- [ ] Customer nhận vé điện tử có QR Code.
- [ ] Admin tạo sự kiện.
- [ ] Admin cấu hình sơ đồ ghế.
- [ ] Admin chia khu vực và gán giá ghế.
- [ ] Admin xem dashboard doanh thu realtime.
- [ ] Admin xem tình trạng lấp đầy ghế realtime.
- [ ] Admin thống kê khán giả theo độ tuổi và giới tính.
- [ ] Frontend tự động cập nhật trạng thái ghế không cần F5.
- [ ] Có Database Transaction khi giữ ghế.
- [ ] Có Row Locking khi giữ ghế.
- [ ] Chống Race Condition tuyệt đối.
- [ ] Vé có vòng đời Available -> Locked -> Sold / Released.
- [ ] Ghế Locked quá 10 phút phải tự động được nhả.
- [ ] Có Cronjob hoặc Background Worker.
- [ ] Không cần tích hợp cổng thanh toán thật.
- [ ] Có thể triển khai Virtual Queue để xử lý tải cao.

---

## 16. Mức độ ưu tiên triển khai

### 16.1. Bắt buộc làm trước

- Auth và phân quyền.
- Quản lý sự kiện.
- Cấu hình sơ đồ ghế.
- Hiển thị sơ đồ ghế.
- Giữ ghế bằng transaction và row locking.
- Checkout giả lập.
- Sinh vé điện tử và QR Code.
- Worker nhả ghế quá hạn.
- Dashboard admin cơ bản.

### 16.2. Nên làm để đạt điểm cao

- Giao diện đẹp, responsive, có branding.
- Realtime cập nhật trạng thái ghế bằng WebSocket.
- Realtime dashboard cho Admin.
- Biểu đồ doanh thu.
- Biểu đồ tỷ lệ lấp đầy ghế.
- Thống kê tuổi và giới tính.
- Validation tốt.
- Security tốt.
- Code tổ chức rõ ràng.

### 16.3. Nâng cao

- Virtual Queue.
- Waiting Room.
- Hiển thị vị trí hàng đợi.
- Cấp token theo batch, ví dụ 50 người/lượt.
- Rate limit.
- Load testing.
- Caching.
- Tối ưu database index.

---

## 17. Kết luận phạm vi cần làm

Để đáp ứng toàn bộ yêu cầu trong đề bài, nhóm cần xây dựng TicketRush như một hệ thống đặt vé online hoàn chỉnh gồm:

1. **Customer App**: tìm sự kiện, xem sự kiện, chọn ghế, giữ chỗ, checkout, nhận vé QR.
2. **Admin App**: tạo sự kiện, cấu hình sơ đồ ghế, quản lý giá vé, theo dõi doanh thu, theo dõi tỷ lệ lấp đầy, thống kê khách hàng.
3. **Backend**: API JSON, xử lý transaction, row locking, chống race condition, quản lý vòng đời vé.
4. **Realtime/Near-realtime**: cập nhật trạng thái ghế và dashboard không cần reload trang.
5. **Background Worker/Cronjob**: tự động nhả ghế hết hạn giữ chỗ sau 10 phút.
6. **Virtual Queue**: điều tiết lượng truy cập trong trường hợp flash sale nếu triển khai phần nâng cao.

