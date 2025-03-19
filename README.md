# Base AI Project for Cursor

Đây là base project để sử dụng với Cursor - trợ lý AI IDE mạnh mẽ. Dự án này cung cấp cấu trúc chuẩn và các rule AI được tối ưu hóa để làm việc hiệu quả với mọi loại dự án.

Version 1.0.3

# Hướng dẫn chung

Chuẩn bị instruction, đây là giai đoạn quan trọng cần làm chi tiết, vì đây giống như bản thiết kế

1. tạo khung sườn bằng cách tạo instruction từ README hoặc brainstorm, tham khảo apk nếu có
2. tạo instruction giao diện chung, tiếp tục tham khảo apk nếu là clone
3. tạo các màn hình từ các instruction đã tạo
4. tạo logic giữa các màn hình
5. bổ sung quảng cáo
6. instruction về các thư viện sử dụng, các resource

# Tùy chỉnh workspace

1. Chỉnh sửa file `Base-AI-Project.code-workspace`:

   - Đổi tên "Base-AI-Project" thành tên dự án của bạn
   - Tùy chỉnh màu sắc theme để phân biệt giữa các dự án

2. Đổi tên file workspace:

```bash
mv Base-AI-Project.code-workspace MyProject.code-workspace
```

## Quy trình làm việc được đề xuất

### Bước 1: Xác định ý tưởng dự án

Mô tả ý tưởng dự án, cấu trúc, giao diện và thư viện mong muốn vào `Project.md`.

### Bước 2: Brainstorming và tạo hướng dẫn

- **Dự án mới**:

  1. Add `Project.md` vào context và brainstorm để mở rộng ý tưởng
  2. Từ kết quả brainstorm, tạo instruction tổng quan vào `Instruction.md`
  3. Thiết kế instruction chi tiết cho từng phần, mỗi phần có file riêng và liên kết từ `Instruction.md`

- **Dự án hiện có**:
  Rà soát từng phần của dự án và tạo các instruction để AI khác có thể hiểu được cấu trúc dự án.

### Bước 3: Phát triển dự án

Tạo chat mới với Claude 3.7 và add file `Instruction.md` để bắt đầu code theo hướng dẫn.

## Các rules Cursor

Project sử dụng hệ thống rule mới của Cursor, lưu trong thư mục `.cursor/rules`:

1. **base-rules.mdc**: Các rule chung cho mọi dự án
2. **javascript-rules.mdc**: Rule cho các dự án JavaScript/TypeScript
3. **python-rules.mdc**: Rule cho các dự án Python
4. **mobile-rules.mdc**: Rule cho phát triển ứng dụng di động
5. **backend-rules.mdc**: Rule cho phát triển backend

## Giải thích file key

- **API_Docs.md**: Mô tả chi tiết các API endpoints, request/response
- **Changelog.md**: Ghi lại lịch sử thay đổi của dự án
- **Codebase.md**: Cung cấp tóm tắt cấu trúc code để AI hiểu nhanh
- **Decisions.md**: Ghi lại các quyết định quan trọng trong quá trình phát triển
- **Diagram.md**: Sơ đồ kết nối giữa các màn hình/component
- **Instruction.md**: Hướng dẫn chính cho toàn bộ dự án
- **Project.md**: Mô tả tổng quan về dự án, mục tiêu và yêu cầu
  trước

# Tùy chỉnh workspace

1. Chỉnh sửa file `Base-AI-Project.code-workspace`:

   - Đổi tên "Base-AI-Project" thành tên dự án của bạn
   - Tùy chỉnh màu sắc theme để phân biệt giữa các dự án

2. Đổi tên file workspace:

```bash
mv Base-AI-Project.code-workspace MyProject.code-workspace
```
