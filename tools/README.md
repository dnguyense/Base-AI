# Bộ Công Cụ Phát Triển

Thư mục này chứa các công cụ hỗ trợ phát triển và quản lý dự án, bao gồm cả các công cụ tự động hóa các tác vụ lặp đi lặp lại.

## Danh sách công cụ

### APK Module Integrator

- **Mô tả**: Công cụ đơn giản để tích hợp module từ APK đã decompile vào project hiện tại
- **File chính**: [`apk-module-integrator.py`](apk-module-integrator.py)
- **Giao diện**: [`apk-integrator-ui.py`](apk-integrator-ui.py)
- **Hướng dẫn**: [`README-apk-integrator.md`](README-apk-integrator.md)
- **Chức năng chính**:
  - Tự động phân tích cấu trúc smali trong project APK
  - Tự động xác định thư mục smali_classes tiếp theo để tích hợp module
  - Tạo backup tự động trước khi thực hiện thay đổi
  - Copy module từ APK nguồn sang project đích

### Công cụ khác

- **Database Tools**: Các công cụ liên quan đến cơ sở dữ liệu
  - Vị trí: [`database/`](database/)

## Sử dụng APK Module Integrator

### Command Line

```bash
# Cú pháp cơ bản
python apk-module-integrator.py --module-path /đường/dẫn/đến/module/đã/decompile --module-folder tên_thư_mục_module

# Ví dụ
python apk-module-integrator.py --module-path /Users/trungkientn/Dev2/HuyDev/NewSdk2111/app/release/DemoSdk --module-folder miui
```

### Giao diện đồ họa

```bash
# Khởi động giao diện
python apk-integrator-ui.py
```

Quy trình làm việc với giao diện đồ họa:

1. Chọn thư mục dự án APK đích
2. Chọn thư mục module nguồn
3. Nhập tên thư mục module (sẽ được gợi ý tự động)
4. Phân tích cấu trúc smali trong dự án
5. Chọn thư mục đích (mặc định là thư mục tiếp theo)
6. Tích hợp module

## Yêu cầu

- Python 3.6 trở lên
- Tkinter (cho phiên bản giao diện đồ họa)
- APK đã được decompile bằng apktool
- Module đã được biên dịch và decompile

## Quy tắc phát triển công cụ

- Mỗi công cụ cần có file README riêng
- Tạo backup trước khi thực hiện thay đổi
- Cung cấp cả phiên bản command line và giao diện đồ họa nếu có thể
- Cập nhật README chính này khi thêm công cụ mới
