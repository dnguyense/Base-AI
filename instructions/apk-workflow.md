# Quy Trình Làm Việc Với APK

## Giới Thiệu

Tài liệu này mô tả quy trình làm việc toàn diện với các ứng dụng Android (APK), bao gồm phân tích, decompile, chỉnh sửa, build lại và kiểm thử. Quy trình này được thiết kế để tối ưu hóa và chuẩn hóa cách làm việc với các dự án APK.

## Cấu Trúc Thư Mục

```
/project-root/
├── input/               # Thư mục chứa APK gốc đầu vào
├── output/              # Thư mục chứa các APK đã decompile
├── build/               # Thư mục chứa các APK đã build lại
├── keystore/            # Thư mục chứa các keystore
├── reports/             # Thư mục chứa báo cáo phân tích
├── dex2jar/             # Thư mục chứa kết quả chuyển đổi sang JAR
├── aab/                 # Thư mục chứa các file AAB
└── tools/               # Thư mục chứa công cụ cần thiết
    ├── apktool/         # Các phiên bản apktool
    ├── bundletool/      # Công cụ để làm việc với AAB
    ├── dex2jar/         # Công cụ để chuyển đổi DEX sang JAR
    └── jadx/            # Công cụ để decompile và phân tích APK
```

## 1. Phân Tích APK

### Quy Trình Phân Tích

1. **Phân Tích Cơ Bản**

   ```
   1. Nhận file APK đầu vào
   2. Trích xuất thông tin cơ bản (package name, version, signature)
   3. Kiểm tra đã bị chỉnh sửa hay chưa (thông qua signature verification)
   4. Phân loại ứng dụng theo loại (game, tiện ích, mạng xã hội, v.v.)
   ```

2. **Phân Tích Chuyên Sâu**

   ```
   1. Liệt kê các thành phần của ứng dụng:
      - Activities, Services, Broadcast Receivers, Content Providers
      - Permissions được yêu cầu
      - Libraries được sử dụng (native và Java/Kotlin)
   2. Phân tích cấu trúc tài nguyên
      - Layouts (XML)
      - Strings (multilingual support)
      - Drawables và assets
      - Raw resources
   3. Tìm điểm nhập ứng dụng (main activity)
   4. Phân tích các API được sử dụng
   ```

3. **Tạo Báo Cáo**
   ```
   1. Tạo báo cáo tổng quan với các thông tin đã thu thập
   2. Đánh giá mức độ phức tạp của ứng dụng
   3. Xác định các thành phần quan trọng cần chú ý
   4. Đề xuất các điểm có thể sửa đổi
   ```

### Công Cụ Phân Tích

- **AAPT/AAPT2** - Android Asset Packaging Tool để trích xuất thông tin cơ bản
- **APK Analyzer** - Phân tích cấu trúc và kích thước APK
- **jadx-gui** - Decompile và phân tích mã nguồn
- **MobSF** - Phân tích bảo mật

## 2. Decode APK

### Quy Trình Decode

1. **Chuẩn Bị**

   ```
   1. Tạo thư mục làm việc cho APK (dựa trên package name và version)
   2. Tạo .gitignore phù hợp (loại bỏ file .DS_Store, tệp tạm, v.v.)
   3. Chuẩn bị các công cụ cần thiết (chọn phiên bản apktool phù hợp)
   ```

2. **Decode Với Các Tùy Chọn**

   ```
   1. Decode hoàn toàn (resources + smali code)
      java -jar apktool.jar d input.apk -o output_dir --force

   2. Chỉ decode resources (không decompile code)
      java -jar apktool.jar d input.apk -o output_dir -r --force

   3. Decode với debug info
      java -jar apktool.jar d input.apk -o output_dir -d --force
   ```

3. **Xử Lý Sau Decode**

   ```
   1. Làm sạch AndroidManifest.xml (loại bỏ thuộc tính liên quan đến split APK)
   2. Tổ chức lại cấu trúc thư mục nếu cần
   3. Tạo các chỉ mục để dễ tìm kiếm
   4. Backup trạng thái ban đầu để có thể so sánh sau khi chỉnh sửa
   ```

4. **Convert to JAR (Tùy Chọn)**

   ```
   1. Sử dụng dex2jar để chuyển đổi APK thành JAR
      d2j-dex2jar input.apk -o output.jar

   2. Sử dụng JD-GUI hoặc công cụ tương tự để xem mã Java
   ```

### Giải Quyết Vấn Đề Phổ Biến

- **Xử Lý .DS_Store**: Thay vì xử lý thủ công, sử dụng .gitignore và script tự động để loại bỏ

  ```
  find . -name ".DS_Store" -delete
  ```

- **Xử Lý Lỗi Decode**: Sử dụng các phiên bản apktool khác nhau cho các APK khác nhau
- **Xử Lý APK Bị Bảo Vệ**: Thử nghiệm với các tùy chọn khác nhau hoặc sử dụng công cụ chuyên dụng

## 3. Chỉnh Sửa APK

### Quy Trình Chỉnh Sửa

1. **Trước Khi Chỉnh Sửa**

   ```
   1. Tạo branch mới trong git repository (nếu sử dụng git)
   2. Backup toàn bộ thư mục dự án vào _backups
   3. Xác định rõ mục tiêu chỉnh sửa
   ```

2. **Sử Dụng Quick Backup (Bước Quan Trọng)**

   ```
   1. Trước khi chỉnh sửa bất kỳ file quan trọng nào, sử dụng tính năng quick backup:
      ./scripts/apk-tools.sh backup path/to/file.xml "Mô tả lý do backup"

   2. Hoặc sử dụng lệnh edit tích hợp để tự động backup và mở editor:
      ./scripts/apk-tools.sh edit path/to/file.xml "Lý do chỉnh sửa"

   3. Kiểm tra danh sách các phiên bản backup của file bằng cách:
      ./scripts/apk-tools.sh list-backups path/to/file.xml

   4. Khôi phục từ backup nếu cần:
      ./scripts/apk-tools.sh restore path/to/backup/file.timestamp.bak
   ```

3. **Chỉnh Sửa Resources**

   ```
   1. Chỉnh sửa strings.xml để thay đổi text
   2. Thay thế hình ảnh trong res/drawable
   3. Chỉnh sửa layout XML để thay đổi giao diện
   4. Cập nhật styles và themes
   ```

4. **Chỉnh Sửa Mã Nguồn (Smali)**

   ```
   1. Sử dụng công cụ tìm kiếm để xác định vị trí cần sửa đổi
   2. Chỉnh sửa code smali với syntax highlighting
   3. Thêm logging để debug nếu cần
   4. Thực hiện các thay đổi logic
   ```

5. **Thêm/Xóa Tính Năng**

   ```
   1. Thêm/xóa activities trong AndroidManifest.xml
   2. Thêm/xóa permissions nếu cần
   3. Thêm/xóa services và receivers
   4. Thay đổi cấu hình ứng dụng
   ```

6. **Theo Dõi Thay Đổi**
   ```
   1. Ghi lại tất cả các thay đổi đã thực hiện
   2. Tạo diff để xem sự khác biệt
   3. Đánh giá tác động của thay đổi
   ```

### Nguyên Tắc Quan Trọng Khi Chỉnh Sửa Resource ID

1. **Không Thay Đổi ID của Layout**

   ```
   - TUYỆT ĐỐI KHÔNG thay đổi ID của bất kỳ phần tử nào trong layout XML
   - ID của view (android:id="@+id/example_id") được compile thành constants trong file R.java
   - Thay đổi ID sẽ làm code không còn truy cập được vào view đó
   - Các module thường sử dụng findViewById() hoặc data binding để truy cập view
   ```

2. **Bảo Toàn Tên Drawable**

   ```
   - TUYỆT ĐỐI KHÔNG đổi tên các file trong thư mục drawable
   - Nhiều ứng dụng sử dụng getIdentifier() để lấy drawable theo tên động:
     resources.getIdentifier("drawable_name", "drawable", packageName)
   - Khi thay thế drawable, phải giữ nguyên tên file và định dạng
   - Nếu thêm drawable mới, đặt tên theo quy ước của ứng dụng
   ```

3. **Xử Lý String Resources**

   ```
   - Cẩn thận khi thay đổi tên key trong strings.xml
   - Đảm bảo giữ nguyên các placeholder (%s, %d, %1$s, etc.)
   - Khi thêm ngôn ngữ mới, copy toàn bộ cấu trúc strings từ ngôn ngữ gốc
   ```

4. **Style và Theme**
   ```
   - Không xóa hoặc đổi tên các style đã định nghĩa
   - Thận trọng khi thay đổi thuộc tính của style hoặc theme
   - Khi thêm style mới, cần kế thừa từ style gốc tương ứng
   ```

### Ví Dụ Đúng Khi Chỉnh Sửa Layout

```xml
<!-- ĐÚNG: Chỉ thay đổi thuộc tính mà không thay đổi ID -->
<!-- Trước khi chỉnh sửa -->
<Button
    android:id="@+id/login_button"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="Login" />

<!-- Sau khi chỉnh sửa - vẫn giữ nguyên ID -->
<Button
    android:id="@+id/login_button"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="Sign In"
    android:textColor="#FFFFFF"
    android:background="#2196F3" />
```

### Ví Dụ Sai Khi Chỉnh Sửa Layout

```xml
<!-- SAI: Thay đổi ID của button -->
<!-- Trước khi chỉnh sửa -->
<Button
    android:id="@+id/login_button"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="Login" />

<!-- Sau khi chỉnh sửa - ID đã bị thay đổi -->
<Button
    android:id="@+id/sign_in_button"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="Sign In" />
```

### Tìm Kiếm Trong Code

- **Tìm Kiếm Chuỗi**: Tìm tất cả các chuỗi trong code và resources

  ```
  grep -r "text_to_search" .
  ```

- **Tìm Kiếm Theo Pattern**: Sử dụng regex để tìm các pattern cụ thể

  ```
  grep -r -P "pattern" --include="*.smali" .
  ```

- **Tìm Kiếm Method**: Xác định vị trí của method cần sửa đổi
  ```
  grep -r "method_name" --include="*.smali" .
  ```

## 4. Build và Ký APK

### Quy Trình Build

1. **Chuẩn Bị Build**

   ```
   1. Cập nhật apktool.yml với thông tin phiên bản mới
   2. Xác nhận các thay đổi đã hoàn tất
   3. Loại bỏ các file tạm và file debug
   ```

2. **Build APK**

   ```
   1. Build với apktool
      java -jar apktool.jar b modified_dir -o new.apk --use-aapt2

   2. Kiểm tra kết quả build
      - Đảm bảo không có lỗi
      - Xác nhận APK được tạo thành công
   ```

3. **Zipalign APK**

   ```
   zipalign -p -f -v 4 input.apk output.apk
   ```

4. **Ký APK**

   ```
   1. Chọn keystore (debug hoặc custom)
   2. Ký APK với apksigner
      apksigner sign --ks keystore.jks --ks-pass pass:password --ks-key-alias alias --key-pass pass:password input.apk

   3. Verify APK sau khi ký
      apksigner verify --verbose input.apk
   ```

5. **So Sánh APK**
   ```
   1. So sánh kích thước với APK gốc
   2. So sánh nội dung với APK gốc
   3. Kiểm tra tính toàn vẹn của APK mới
   ```

### Quản Lý Keystore

1. **Tạo Keystore Mới**

   ```
   keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias
   ```

2. **Quản Lý Keystore**
   ```
   1. Lưu trữ các keystore trong thư mục riêng
   2. Ghi nhớ passwords và aliases
   3. Backup các keystores quan trọng
   4. Mã hóa thông tin keystore nếu cần
   ```

## 5. Kiểm Thử APK

### Quy Trình Kiểm Thử

1. **Cài Đặt APK**

   ```
   1. Kết nối thiết bị Android
   2. Gỡ cài đặt phiên bản cũ nếu có
      adb uninstall package.name

   3. Cài đặt APK mới
      adb install -r -d new.apk
   ```

2. **Kiểm Thử Thủ Công**

   ```
   1. Khởi chạy ứng dụng
      adb shell monkey -p package.name -c android.intent.category.LAUNCHER 1

   2. Kiểm tra các tính năng đã sửa đổi
   3. Kiểm tra xem có lỗi crash không
   4. Kiểm tra UX/UI (hiệu suất, giao diện)
   ```

3. **Kiểm Thử Tự Động (Nếu Có)**

   ```
   1. Chạy các automated tests
   2. Sử dụng monkey để kiểm tra độ ổn định
      adb shell monkey -p package.name -v 500
   ```

4. **Thu Thập & Phân Tích Logs**

   ```
   1. Thu thập logcat
      adb logcat -d > logcat.txt

   2. Lọc log theo package name
      adb logcat | grep "package.name"

   3. Phân tích log để phát hiện lỗi
   ```

5. **Tạo Báo Cáo Kiểm Thử**
   ```
   1. Tổng hợp kết quả kiểm thử
   2. Ghi lại các vấn đề phát hiện được
   3. Đề xuất cải tiến nếu cần
   ```

## 6. Phân Phối APK

### Quy Trình Phân Phối

1. **Chuẩn Bị Phân Phối**

   ```
   1. Đổi tên APK theo quy ước: packagename_version_date.apk
   2. Tạo bản mô tả những thay đổi (changelog)
   3. Tính checksum (MD5, SHA1, SHA256) để xác minh tính toàn vẹn
   ```

2. **Phân Phối Qua Các Kênh**

   ```
   1. Gửi qua email
   2. Tải lên cloud storage
   3. Chia sẻ qua messaging apps
   4. Tích hợp với CI/CD nếu cần
   ```

3. **Theo Dõi Phản Hồi**
   ```
   1. Thu thập phản hồi từ người dùng
   2. Ghi nhận các vấn đề được báo cáo
   3. Lên kế hoạch cho các phiên bản tiếp theo
   ```

## 7. Dọn Dẹp và Bảo Trì

### Quản Lý Quick Backups

1. **Xem Danh Sách Backups**

   ```
   ./scripts/apk-tools.sh list-backups path/to/file.xml
   ```

2. **Khôi Phục Từ Backups**

   ```
   # Xem danh sách backup
   ./scripts/apk-tools.sh list-backups path/to/file.xml

   # Chọn ID của backup muốn khôi phục
   # Hoặc khôi phục trực tiếp nếu biết đường dẫn
   ./scripts/apk-tools.sh restore path/to/backup/file.timestamp.bak
   ```

3. **Dọn Dẹp Backups Cũ**

   ```
   # Xóa tất cả backups cũ hơn 7 ngày (mặc định)
   ./scripts/apk-tools.sh cleanup-backups

   # Hoặc chỉ định số ngày
   ./scripts/apk-tools.sh cleanup-backups 14   # Xóa backups cũ hơn 14 ngày
   ```

4. **Sao Lưu Thư Mục Backups Quan Trọng**

   ```
   # Sao lưu thư mục _temp_backups nếu cần giữ backup lâu dài
   cp -r _temp_backups /path/to/permanent/storage
   ```

### Lịch Trình Bảo Trì

Để giữ dự án gọn gàng và hiệu quả, nên thực hiện các công việc bảo trì định kỳ:

1. **Hàng ngày**: Sử dụng quick backup cho mỗi lần chỉnh sửa file
2. **Hàng tuần**: Chạy lệnh cleanup-backups để xóa các backups cũ
3. **Hàng tháng**: Sao lưu thư mục backups quan trọng và kiểm tra không gian ổ đĩa

## Công Cụ Cần Thiết

1. **Công Cụ Cốt Lõi**

   - apktool (các phiên bản khác nhau)
   - dex2jar
   - jadx
   - apksigner
   - zipalign
   - adb (Android Debug Bridge)

2. **Công Cụ Bổ Sung**

   - bundletool (cho AAB)
   - MobSF (phân tích bảo mật)
   - keytool (quản lý keystore)
   - grep, find (tìm kiếm)
   - diff (so sánh files)

3. **IDE và Editors**
   - Visual Studio Code với extension cho smali
   - Android Studio
   - JD-GUI (xem Java code)

## Kết Luận

Quy trình này cung cấp một cách tiếp cận có hệ thống để làm việc với APK, từ phân tích ban đầu đến phân phối cuối cùng. Tuân thủ quy trình này sẽ giúp tối ưu hóa việc phát triển, sửa đổi và kiểm thử các ứng dụng Android.

---

## Phụ Lục: Các Lệnh Thường Dùng

### Lệnh ADB

```bash
# Liệt kê thiết bị
adb devices

# Cài đặt APK
adb install -r path/to/app.apk

# Gỡ cài đặt ứng dụng
adb uninstall com.package.name

# Lấy logcat
adb logcat -d > logcat.txt

# Khởi chạy ứng dụng
adb shell monkey -p com.package.name -c android.intent.category.LAUNCHER 1

# Kiểm tra thông tin thiết bị
adb shell getprop

# Push file đến thiết bị
adb push local/path /sdcard/

# Pull file từ thiết bị
adb pull /sdcard/file.txt local/path/
```

### Lệnh Apktool

```bash
# Decode APK
java -jar apktool.jar d app.apk -o output_dir

# Build APK
java -jar apktool.jar b modified_dir -o new.apk

# Chỉ decode resources
java -jar apktool.jar d app.apk -o output_dir -r

# Decode với debug info
java -jar apktool.jar d app.apk -o output_dir -d
```

### Lệnh Keystore

```bash
# Tạo keystore mới
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias

# Kiểm tra thông tin keystore
keytool -list -v -keystore my-release-key.jks

# Xuất certificate
keytool -exportcert -keystore my-release-key.jks -alias my-alias -file certificate.pem
```

### Lệnh Zipalign & Signing

```bash
# Zipalign APK
zipalign -p -f -v 4 input.apk output.apk

# Ký APK
apksigner sign --ks keystore.jks --ks-pass pass:password --ks-key-alias alias --key-pass pass:password input.apk

# Verify APK signature
apksigner verify --verbose input.apk
```

### Lệnh Quick Backup

```bash
# Tạo backup nhanh cho file
./scripts/apk-tools.sh backup path/to/file.xml "Lý do backup"

# Chỉnh sửa file với backup tự động
./scripts/apk-tools.sh edit path/to/file.xml "Mô tả chỉnh sửa"

# Liệt kê các backups của file
./scripts/apk-tools.sh list-backups path/to/file.xml

# Khôi phục từ backup
./scripts/apk-tools.sh restore path/to/backup/file.timestamp.bak

# Dọn dẹp backups cũ
./scripts/apk-tools.sh cleanup-backups 7
```
