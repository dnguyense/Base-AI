# Hướng Dẫn Làm Việc Với APK

## Giới Thiệu

Tài liệu này cung cấp hướng dẫn tổng quan về việc làm việc với các file APK trong dự án. Đây là điểm khởi đầu cho bất kỳ ai muốn tham gia vào quá trình phân tích, sửa đổi và xây dựng lại các ứng dụng Android.

## Các Tài Liệu Liên Quan

- **[Quy Trình Làm Việc Với APK](./apk-workflow.md)**: Mô tả chi tiết quy trình làm việc với APK.
- **Quy Tắc APK**: Các quy tắc và hướng dẫn bắt buộc phải tuân thủ.
- **Scripts**: Các script tự động hóa để hỗ trợ quy trình làm việc.

## Nguyên Tắc Cốt Lõi

### 1. Bảo Toàn Resource ID - QUY TẮC QUAN TRỌNG NHẤT

> ⚠️ **TUYỆT ĐỐI KHÔNG** thay đổi ID của bất kỳ resource nào, bao gồm cả layout ID, drawable name, string key, styles và themes.

Lý do:

- Nhiều module trong APK không truy cập trực tiếp vào resources thông qua `R.id`, `R.drawable`, v.v.
- Thay vào đó, chúng thường sử dụng các phương thức động như `getIdentifier()` để lấy resources theo tên.
- Thay đổi ID hoặc tên của resources sẽ gây ra lỗi `ResourceNotFoundException` hoặc `NullPointerException`.

Ví dụ về việc lấy drawable theo tên:

```java
// Code Java trong APK có thể truy cập drawable như sau
int resourceId = context.getResources().getIdentifier(
    "my_image", "drawable", context.getPackageName());
Drawable drawable = ContextCompat.getDrawable(context, resourceId);
```

Nếu bạn đổi tên file `my_image.png` thành `my_new_image.png`, code này sẽ bị lỗi!

### 2. Backup Luôn Luôn Là Bước Đầu Tiên

- Luôn tạo bản sao lưu của APK gốc trước khi bắt đầu bất kỳ thay đổi nào.
- Sử dụng git để theo dõi các thay đổi khi chỉnh sửa.
- Đánh version cho mỗi lần thay đổi lớn.
- **_MỚI:_** Sử dụng tính năng Quick Backup trước khi chỉnh sửa file quan trọng.

### 3. Kiểm Thử Là Bắt Buộc

- Kiểm thử APK trên nhiều thiết bị khác nhau sau khi chỉnh sửa.
- Kiểm tra tất cả các chức năng liên quan đến thay đổi.
- Thu thập logs để phân tích lỗi nếu có.

## Quy Trình Làm Việc Cơ Bản

1. **Chuẩn Bị Môi Trường**

   ```
   ./scripts/apk-tools.sh check-tools
   ```

2. **Phân Tích APK**

   ```
   ./scripts/apk-tools.sh analyze input/example.apk
   ```

3. **Decode APK**

   ```
   ./scripts/apk-tools.sh decode input/example.apk
   ```

4. **Chỉnh Sửa & Theo Dõi Thay Đổi**

   - Backup file trước khi chỉnh sửa:
     ```
     ./scripts/apk-tools.sh backup path/to/file.xml "Lý do backup"
     ```
   - Hoặc chỉnh sửa với backup tự động:
     ```
     ./scripts/apk-tools.sh edit path/to/file.xml "Lý do chỉnh sửa"
     ```
   - Sửa đổi files theo yêu cầu
   - Kiểm tra resource IDs sau khi chỉnh sửa:
     ```
     ./scripts/apk-tools.sh check-res output/original output/modified
     ```

5. **Build APK**

   ```
   ./scripts/apk-tools.sh build output/com.example.app
   ```

6. **Ký & Zipalign APK**

   ```
   ./scripts/apk-sign.sh sign build/com.example.app_1.0.apk keystore/debug.keystore
   ```

7. **Cài Đặt & Kiểm Thử**
   ```
   ./scripts/apk-sign.sh install signed/com.example.app_1.0_signed.apk
   ```

## Các Lệnh Hữu Ích

### Phân Tích & Decode

```bash
# Phân tích APK
./scripts/apk-tools.sh analyze input/app.apk

# Decode APK
./scripts/apk-tools.sh decode input/app.apk --force

# Chuyển APK sang JAR để xem mã Java
./scripts/apk-tools.sh jar input/app.apk
```

### Kiểm Tra Resource ID

```bash
# Kiểm tra thay đổi resource ID giữa hai thư mục
./scripts/apk-tools.sh check-res output/original output/modified
```

### Quick Backup & Restore

```bash
# Backup file trước khi chỉnh sửa
./scripts/apk-tools.sh backup path/to/file.xml "Trước khi thêm chức năng mới"

# Chỉnh sửa file với auto-backup
./scripts/apk-tools.sh edit path/to/file.xml "Thêm chức năng ABC"

# Xem danh sách các phiên bản backup
./scripts/apk-tools.sh list-backups path/to/file.xml

# Khôi phục từ một bản backup trước đó (tự động hiển thị UI chọn nếu có nhiều bản)
./scripts/apk-tools.sh list-backups path/to/file.xml

# Dọn dẹp các bản backup cũ hơn 7 ngày
./scripts/apk-tools.sh cleanup-backups

# Dọn dẹp các bản backup cũ hơn 14 ngày
./scripts/apk-tools.sh cleanup-backups 14
```

### Build & Ký

```bash
# Build APK từ mã nguồn đã chỉnh sửa
./scripts/apk-tools.sh build output/com.example.app

# Ký APK với keystore
./scripts/apk-sign.sh sign build/app.apk keystore/release.jks my-alias my-password

# Tạo keystore mới
./scripts/apk-sign.sh create keystore/my-key.jks my-alias my-password
```

### Cài Đặt & Kiểm Thử

```bash
# Cài đặt APK lên thiết bị
./scripts/apk-sign.sh install signed/app_signed.apk

# Lấy log từ thiết bị
adb logcat -d > logcat.txt

# Lọc log theo package name
adb logcat | grep "com.example.app"
```

## Các Công Cụ Cần Thiết

- **apktool**: Decode và build APK
- **dex2jar**: Chuyển đổi DEX sang JAR
- **jadx**: Decompile APK
- **apksigner**: Ký APK
- **zipalign**: Tối ưu hóa APK

## Xử Lý Lỗi Thường Gặp

1. **"Resource not found" sau khi chỉnh sửa**:

   - Kiểm tra xem bạn có vô tình thay đổi ID hoặc tên resource không.
   - Chạy lệnh `./scripts/apk-tools.sh check-res` để phát hiện thay đổi.

2. **NullPointerException khi mở ứng dụng**:

   - Thường do đã thay đổi ID của layout hoặc view.
   - Kiểm tra lại tất cả các ID trong layout XML.

3. **Lỗi khi build APK**:

   - Kiểm tra cấu trúc thư mục có đúng không.
   - Đảm bảo không có file .DS_Store trong thư mục.
   - Kiểm tra tính hợp lệ của AndroidManifest.xml.

4. **Lỗi khi cài đặt APK**:
   - Kiểm tra APK đã được ký đúng chưa.
   - Kiểm tra phiên bản cài đặt có cao hơn phiên bản hiện tại không.

## Quản Lý Backup

### Cách Sử Dụng Quick Backup

1. **Backup Tự Động Trước Khi Chỉnh Sửa**

   - Sử dụng lệnh `edit` để tự động backup và mở file trong editor:
     ```
     ./scripts/apk-tools.sh edit path/to/file.xml "Mô tả chỉnh sửa"
     ```
   - Khi chỉnh sửa xong, file gốc sẽ được cập nhật và bản backup được lưu lại

2. **Backup Thủ Công**

   - Backup file trước khi chỉnh sửa để đề phòng:
     ```
     ./scripts/apk-tools.sh backup path/to/file.xml "Mô tả lý do backup"
     ```
   - Sau đó chỉnh sửa file bằng editor bạn thích

3. **Quản Lý Danh Sách Backup**

   - Xem tất cả các bản backup của một file:
     ```
     ./scripts/apk-tools.sh list-backups path/to/file.xml
     ```
   - Chọn ID của phiên bản muốn khôi phục từ danh sách

4. **Dọn Dẹp Định Kỳ**
   - Thêm vào quy trình làm việc việc dọn dẹp backup hàng tuần:
     ```
     ./scripts/apk-tools.sh cleanup-backups 7
     ```
   - Điều này giúp tiết kiệm không gian ổ đĩa và giữ dự án gọn gàng

### Sử Dụng APK Hooks Tự Động

APK Hooks là một công cụ mạnh mẽ giúp tự động hóa việc backup khi làm việc với APK. Cách kích hoạt:

1. **Kích Hoạt Hooks**

   ```bash
   # Thêm dòng này vào file ~/.bashrc hoặc ~/.zshrc
   source /đường/dẫn/tới/dự/án/scripts/apk-hooks.sh
   ```

2. **Sử Dụng Command `edit` Thay Vì Editor Thông Thường**

   ```bash
   # Thay vì
   vi file/cần/chỉnh/sửa.xml

   # Sử dụng
   edit file/cần/chỉnh/sửa.xml
   ```

   File sẽ được tự động backup trước khi bạn chỉnh sửa mà không cần thêm bước nào khác.

3. **Tùy Chỉnh Cấu Hình**

   ```bash
   # Mở giao diện cấu hình hooks
   config-hooks
   ```

   Tại đây bạn có thể:

   - Bật/tắt auto backup
   - Thay đổi số ngày lưu backup
   - Bật/tắt thông báo khi backup

4. **Các Lệnh Hữu Ích Khác**

   ```bash
   # Xem thống kê về backup đã tạo
   backup-stats

   # Dọn dẹp backup cũ ngay lập tức
   force-cleanup [số_ngày]

   # Xem tất cả các lệnh có sẵn
   hooks-help
   ```

### Lợi Ích Của Việc Sử Dụng Hooks

- **Tự Động Hóa Hoàn Toàn**: Không cần thực hiện bước backup thủ công
- **Không Xâm Phạm**: Sử dụng editor quen thuộc của bạn (hooks sử dụng biến môi trường EDITOR)
- **Dọn Dẹp Tự Động**: Tự động dọn dẹp backup cũ sau mỗi 7 ngày
- **Thống Kê Hữu Ích**: Dễ dàng theo dõi lịch sử backup và dung lượng sử dụng

### Vị Trí Lưu Trữ Backup

Tất cả các file backup được lưu trữ tại thư mục `_temp_backups` trong thư mục gốc của dự án. Cấu trúc thư mục như sau:

```
_temp_backups/
├── 20230715/                    # Ngày backup (YYYYMMDD)
│   ├── output/com.example.app/
│   │   ├── AndroidManifest.xml.123045.bak    # File backup với timestamp
│   │   └── AndroidManifest.xml.123045.bak.info   # Thông tin mô tả
│   └── ...
├── 20230716/
│   └── ...
└── ...
```

Mỗi ngày sẽ có một thư mục riêng, giúp dễ dàng quản lý và dọn dẹp các bản backup theo thời gian.

## Liên Hệ & Hỗ Trợ

Nếu bạn gặp vấn đề hoặc có câu hỏi, vui lòng liên hệ với quản trị viên dự án.

---

_Lưu ý: Tài liệu này được cập nhật lần cuối vào ngày YYYY-MM-DD._
