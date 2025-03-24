# Quyết định thiết kế

Tài liệu này ghi lại các quyết định thiết kế quan trọng trong dự án. Mỗi quyết định bao gồm ngày, vấn đề, các phương án được xem xét, phương án được chọn và lý do.

## 1. Quản lý Database Trong Dự Án - 2024-05-15

### Vấn đề

Dự án cần một cách thức quản lý database hiệu quả, tránh tình trạng tạo nhiều database trùng lặp hoặc thừa thãi, đồng thời đảm bảo việc theo dõi cấu trúc database được nhất quán.

### Phương án được xem xét

1. **Phương án A: Quản lý riêng lẻ**:

   - Ưu điểm: Linh hoạt, mỗi team có thể tự tạo và quản lý database riêng
   - Nhược điểm: Dễ dẫn đến trùng lặp, khó kiểm soát, thiếu nhất quán

2. **Phương án B: Sử dụng ORM tự động migrations**:

   - Ưu điểm: Tự động hóa cao, dễ theo dõi thay đổi
   - Nhược điểm: Phức tạp khi cần tích hợp với hệ thống hiện có, yêu cầu cài đặt framework

3. **Phương án C: Tập trung tất cả schema vào file db-schema.sql**:
   - Ưu điểm: Dễ theo dõi, kiểm soát tập trung, rõ ràng
   - Nhược điểm: Có thể trở nên lớn theo thời gian, cần quy trình để đảm bảo cập nhật

### Quyết định

**Phương án được chọn**: Phương án C - Tập trung tất cả schema vào file db-schema.sql

### Lý do

Phương án C được chọn vì:

- Tạo ra một nguồn thông tin duy nhất về cấu trúc database trong dự án
- Giúp các thành viên team dễ dàng xem xét và hiểu cấu trúc hiện tại
- Đơn giản, không yêu cầu framework hay công cụ phức tạp
- Dễ dàng tích hợp vào quy trình làm việc hiện tại
- Giúp tránh tình trạng tạo database trùng lặp

### Tác động

- Mọi developer phải tuân thủ quy trình kiểm tra db-schema.sql trước khi tạo database mới
- Cần cập nhật file db-schema.sql sau mỗi thay đổi cấu trúc database
- Giảm thiểu được số lượng database thừa thãi
- Tạo ra tài liệu rõ ràng về cấu trúc database cho toàn dự án

---

## 2. [Tên quyết định] - [Ngày]

### Vấn đề

[Mô tả vấn đề cần giải quyết]

### Phương án được xem xét

1. **Phương án A**:

   - Ưu điểm: [Liệt kê ưu điểm]
   - Nhược điểm: [Liệt kê nhược điểm]

2. **Phương án B**:
   - Ưu điểm: [Liệt kê ưu điểm]
   - Nhược điểm: [Liệt kê nhược điểm]

### Quyết định

**Phương án được chọn**: [Tên phương án]

### Lý do

[Giải thích lý do chọn phương án này so với các phương án khác]

### Tác động

[Mô tả tác động của quyết định này đến dự án]
