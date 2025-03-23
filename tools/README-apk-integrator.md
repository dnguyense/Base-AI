# APK Module Integrator

Công cụ đơn giản để tích hợp module từ APK đã decompile vào project hiện tại, phù hợp với quy trình làm việc thêm module Java (không có resource) vào APK hiện có.

## Tính Năng Chính

- 🔍 Tự động phân tích cấu trúc thư mục smali trong project
- 📁 Tự động xác định thư mục smali_classes tiếp theo để tránh xung đột
- 📦 Tạo backup tự động trước khi thực hiện thay đổi
- 🔄 Copy module từ APK nguồn sang project đích
- ⚙️ Đơn giản, dễ sử dụng và không yêu cầu cấu hình phức tạp

## Yêu Cầu

- Python 3.6 trở lên
- APK đã được decompile bằng apktool
- Module đã được biên dịch và decompile

## Cách Sử Dụng

```bash
# Cú pháp cơ bản
python apk-module-integrator.py --module-path /đường/dẫn/đến/module/đã/decompile --module-folder tên_thư_mục_module

# Ví dụ thực tế
python apk-module-integrator.py --module-path /Users/trungkientn/Dev2/HuyDev/NewSdk2111/app/release/DemoSdk --module-folder miui

# Nếu project không ở thư mục hiện tại
python apk-module-integrator.py --module-path /path/to/module --module-folder tên_thư_mục_module --project-dir /path/to/target/project
```

## Các Tham Số

| Tham số           | Viết tắt | Mô tả                                                  | Bắt buộc |
| ----------------- | -------- | ------------------------------------------------------ | -------- |
| `--module-path`   | `-m`     | Đường dẫn đến thư mục smali của module đã decompile    | Có       |
| `--module-folder` | `-f`     | Tên thư mục chứa code của module (ví dụ: miui)         | Có       |
| `--project-dir`   | `-p`     | Đường dẫn đến project APK (mặc định: thư mục hiện tại) | Không    |

## Quy Trình Làm Việc Đề Xuất

1. Decompile APK cần nâng cấp bằng apktool:

   ```bash
   apktool d target-app.apk -o target-app
   ```

2. Decompile APK chứa module cần chèn:

   ```bash
   apktool d module-app.apk -o module-app
   ```

3. Sử dụng công cụ để tích hợp module:

   ```bash
   cd target-app
   python /path/to/apk-module-integrator.py --module-path /path/to/module-app --module-folder module_name
   ```

4. Kiểm tra và chỉnh sửa AndroidManifest.xml nếu cần

5. Biên dịch lại APK:

   ```bash
   apktool b . -o ../upgraded.apk
   ```

6. Ký và tối ưu APK:
   ```bash
   jarsigner -sigalg SHA1withRSA -digestalg SHA1 -keystore /path/to/keystore -storepass password ../upgraded.apk alias_name
   zipalign -v 4 ../upgraded.apk ../final.apk
   ```

## Lưu Ý

- Tool tự động tạo backup trong thư mục `_backups/` trước khi thực hiện thay đổi
- Nếu module yêu cầu permissions đặc biệt, bạn cần thêm vào AndroidManifest.xml thủ công
- Kiểm tra tính tương thích của module trước khi biên dịch để tránh lỗi runtime
- Module nên được thiết kế để không phụ thuộc vào resource để tránh xung đột

## Xử Lý Sự Cố

Nếu gặp lỗi trong quá trình tích hợp:

1. Kiểm tra đường dẫn đến module và tên thư mục module
2. Kiểm tra cấu trúc thư mục của module đã decompile
3. Khôi phục từ backup nếu cần trong thư mục `_backups/`
4. Kiểm tra log để xác định nguyên nhân lỗi

## Đóng Góp

Vui lòng gửi các đề xuất cải tiến hoặc báo cáo lỗi qua mục Issues.

## Giấy Phép

MIT License
