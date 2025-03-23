# One-Click APK Integration Script

Script này giúp bạn tích hợp nhanh chóng một package từ APK nguồn vào APK đích chỉ với một lệnh duy nhất.

## Tổng Quan

Script `one-click-integrate.sh` tự động hóa quy trình:

- Decompile APK nguồn và APK đích
- Copy package được chỉ định từ APK nguồn sang APK đích
- Build lại APK đích với package mới

## Cài Đặt

### Yêu Cầu

- apktool (>= 2.6.0)
- Java JDK (>= 8)
- bash shell

### Kiểm Tra Cài Đặt

```bash
apktool --version
java -version
```

## Sử Dụng

### Cú Pháp Cơ Bản

```bash
./scripts/one-click-integrate.sh <source.apk> <target.apk> <package_path> [options]
```

Trong đó:

- `<source.apk>`: APK chứa package cần tích hợp
- `<target.apk>`: APK đích cần tích hợp package vào
- `<package_path>`: Đường dẫn package trong APK nguồn (ví dụ: com/miui)

### Các Tùy Chọn

- `-h, --help`: Hiển thị hướng dẫn sử dụng
- `-b, --backup`: Tạo backup APK đích trước khi tích hợp

### Ví Dụ

```bash
# Tích hợp package com/miui từ miuiapp.apk vào myapp.apk
./scripts/one-click-integrate.sh miuiapp.apk myapp.apk com/miui

# Tích hợp và tạo backup
./scripts/one-click-integrate.sh miuiapp.apk myapp.apk com/miui --backup
```

## Quy Trình Tích Hợp

1. **Chuẩn Bị**: Script tạo thư mục làm việc và sao chép APK vào đó
2. **Decompile**: Decompile cả APK nguồn và APK đích
3. **Phân Tích**: Phân tích cấu trúc APK đích để xác định thư mục smali phù hợp
4. **Tích Hợp**: Copy package từ APK nguồn sang APK đích
5. **Build**: Build lại APK đích với package mới
6. **Kết Quả**: Báo cáo đường dẫn đến APK đã tích hợp

## Xử Lý Lỗi

### APK Không Tồn Tại

```
❌ ERROR: Source APK 'miuiapp.apk' does not exist
```

➡️ Kiểm tra lại đường dẫn đến file APK nguồn

### Package Không Tồn Tại

```
❌ ERROR: Package 'com/miui' not found in source APK
```

➡️ Kiểm tra lại tên package, sử dụng đúng định dạng (com/miui thay vì com.miui)

### Lỗi Khi Build

```
❌ ERROR: Failed to build target APK
```

➡️ Kiểm tra log để tìm lỗi cụ thể, có thể liên quan đến tính tương thích

## Sau Khi Tích Hợp

Sau khi tích hợp thành công, bạn cần:

1. **Sign APK**: Ký APK đã được tích hợp

```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore your-keystore.jks output.apk alias_name
```

2. **Tối Ưu Hóa APK**:

```bash
zipalign -v 4 input.apk output.apk
```

3. **Kiểm Tra Module**: Cài đặt APK và kiểm tra chức năng của module đã tích hợp

## Các Lưu Ý

- Script này chỉ copy code Smali, không copy resources
- Nếu module yêu cầu resources, bạn cần tích hợp thêm thủ công
- Kiểm tra tính tương thích trước khi tích hợp package
- Một số module có thể yêu cầu cập nhật AndroidManifest.xml

## Hỗ Trợ

Để được hỗ trợ thêm, hãy tìm hiểu các quy tắc tích hợp APK chi tiết hơn trong:

- `.cursor/rules/apk-one-click-integration.mdc`
- `.cursor/rules/smali-module-integration.mdc`
