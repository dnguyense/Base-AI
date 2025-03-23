# APK Builder Integrator

Công cụ nâng cấp APK hỗ trợ build trực tiếp từ project Android nguồn và tích hợp module vào APK đích.

## Tính Năng Chính

- 🔄 Hỗ trợ hai nguồn: Project Android hoặc APK đã build sẵn
- 🛠️ Tự động build project Android (với Gradle)
- 🔍 Tự động phân tích cấu trúc project để xác định module cần build
- 📦 Tự động tìm và copy package/module cần tích hợp
- 🔐 Hỗ trợ ký APK với key debug mặc định
- ⚙️ Tạo backup và thư mục làm việc riêng biệt để đảm bảo an toàn

## Các Trường Hợp Sử Dụng

### 1. Build APK Từ Project Android và Tích Hợp Module

Sử dụng khi:

- Bạn có source code của module cần tích hợp (project Android)
- Bạn muốn build module từ source rồi tích hợp vào APK khác
- Bạn đang phát triển module mới cần tích hợp vào APK hiện có

### 2. Tích Hợp APK Đã Build Sẵn

Sử dụng khi:

- Bạn đã có sẵn APK chứa module cần tích hợp
- Bạn không có quyền truy cập vào source code
- APK nguồn đã được test và xác nhận hoạt động tốt

## Quy Trình Làm Việc Đề Xuất

### Build Từ Project Android

1. Chuẩn bị project Android nguồn:

   - Đảm bảo project có thể build được
   - Xác định module và package cần tích hợp

2. Chọn APK đích để tích hợp:

   - Xác định APK đích cần nâng cấp
   - Cân nhắc phiên bản SDK và tính tương thích

3. Sử dụng công cụ tích hợp:

   - Chọn tùy chọn "Project Android để build APK nguồn"
   - Cung cấp đường dẫn đến project và thông tin cần thiết
   - Công cụ sẽ build, tích hợp và ký APK tự động

4. Kiểm tra APK đã tích hợp:
   - Cài đặt và kiểm tra chức năng
   - Xác nhận module đã được tích hợp đúng cách

### Tích Hợp Từ APK Có Sẵn

1. Chuẩn bị APK nguồn:

   - Xác định APK chứa module cần tích hợp
   - Xác định package cụ thể cần tích hợp

2. Tiếp tục với quy trình thông thường:
   - Chọn tùy chọn "APK đã build sẵn"
   - Cung cấp đường dẫn đến APK nguồn và đích
   - Xác định package cần tích hợp

## Xử Lý Các Trường Hợp Đặc Biệt

### 1. Project Android Không Thể Build

Nếu project không thể build tự động, bạn có thể:

- Kiểm tra cấu trúc project và file cấu hình Gradle
- Build thủ công bằng Android Studio, sau đó sử dụng APK đã build
- Khắc phục lỗi trong project và thử lại

### 2. Module Yêu Cầu Resources

Đối với module phụ thuộc vào resources (layout, drawable...):

- Công cụ sẽ tìm và cảnh báo về các resources liên quan
- Bạn có thể chọn tích hợp cả resources vào APK đích
- Cần kiểm tra xung đột ID resource tiềm ẩn

### 3. Các Xung Đột Phiên Bản

Khi tích hợp giữa các APK có phiên bản SDK khác nhau:

- Kiểm tra minSdkVersion và targetSdkVersion của cả hai APK
- Đảm bảo module có thể hoạt động trên phiên bản SDK của APK đích
- Xem xét khả năng tương thích API nếu cần

## Ví Dụ Tương Tác

```
# Tích hợp từ project Android
> Tôi muốn tích hợp module từ project Android vào APK hiện có

- Vui lòng cung cấp đường dẫn đến project Android nguồn:
> /Users/trungkientn/Projects/MyModule

- Đã phân tích project Android. Dự án có các module sau:
  - app
  - library
  Bạn muốn build module nào?
> app

- Vui lòng cung cấp đường dẫn đến APK đích:
> /Users/trungkientn/Downloads/target.apk

- Package bạn muốn tích hợp là gì?
> com/example/feature

- Đang build APK từ project...
- Đang tích hợp package...
- Ký APK với key debug...
- Hoàn tất! APK đã tích hợp: /path/to/integrated.apk
```

## Lưu Ý Quan Trọng

- Công cụ sẽ tạo backup tự động trước khi thay đổi bất kỳ file nào
- Bạn nên kiểm tra tính tương thích của module trước khi tích hợp
- Một số APK có cơ chế bảo vệ có thể khiến decompile/rebuild không thành công
- Không phân phối APK đã sửa đổi mà không có quyền phù hợp

## Yêu Cầu Hệ Thống

- Python 3.6 trở lên
- Android SDK (cho việc build và ký APK)
- Gradle (nếu project không có Gradle wrapper)
- apktool, jarsigner, zipalign có trong PATH

## Giấy Phép

MIT License
