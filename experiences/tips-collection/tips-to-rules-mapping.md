# Mapping Giữa Tips và Rules

File này giúp bạn dễ dàng tìm kiếm mối liên hệ giữa các tips trong thư mục `/tips/` và các rules đã được tích hợp vào `.cursor/rules/`.

## Tổng Quan

| Tip # | Tiêu Đề                                    | Rules Tích Hợp                      | Trạng Thái     |
| ----- | ------------------------------------------ | ----------------------------------- | -------------- |
| 1     | Sai stack = phá hỏng MVP                   | tech-stack-selection.mdc            | ✅ Đã tích hợp |
| 2     | Một mình cần hết, miễn có hệ thống         | four-role-development.mdc           | ✅ Đã tích hợp |
| 3     | Project Rules là game-changer              | project-rules-importance.mdc        | ✅ Đã tích hợp |
| 4     | Mỗi AI model có chuyên môn riêng           | four-role-development.mdc           | ✅ Đã tích hợp |
| 5     | Save liên tay, không là khóc rồng          | git-workflow.mdc                    | ✅ Đã tích hợp |
| 6     | Debug với AI? Đừng copy-paste log như noob | debug-with-browser-mcp.mdc          | ✅ Đã tích hợp |
| 7     | Vấn đề không phải là tool, mà là cách dùng | planning-workflow.mdc (đã cập nhật) | ✅ Đã tích hợp |

## Chi Tiết Tích Hợp

### Tip #1: Sai stack = phá hỏng MVP

- **Rule**: tech-stack-selection.mdc
- **Nội dung chính đã tích hợp**:
  - Tech stack đề xuất: Next.js/React, Supabase, Vercel
  - Cảnh báo về việc AI "nhái" pattern đã thấy
  - Tránh các tech stack hiếm gặp
  - Quy trình setup dự án chuẩn

### Tip #2: Một mình cần hết, miễn có hệ thống

- **Rule**: four-role-development.mdc
- **Nội dung chính đã tích hợp**:
  - Quy trình 4 vai trò: Planner > Architect > Builder > Tester
  - Mô tả công việc và thời gian cho từng vai trò
  - Tools phù hợp cho từng vai trò
  - Cảnh báo về hệ quả khi bỏ qua các bước

### Tip #3: Project Rules là game-changer

- **Rule**: project-rules-importance.mdc
- **Nội dung chính đã tích hợp**:
  - Tầm quan trọng của việc thiết lập rules
  - Các loại rules cần thiết: styling, API calls, code structure
  - Quy trình thiết lập và áp dụng rules
  - Ví dụ thực tế về việc không có rules

### Tip #4: Mỗi AI model có chuyên môn riêng

- **Rule**: four-role-development.mdc (phần Tools)
- **Nội dung chính đã tích hợp**:
  - Claude 3.5 Sonnet cho backend logic và debugging
  - GPT-4o cho planning và UI design
  - Gemini 2.5 Pro cho code review
  - Matching từng model với công việc phù hợp

### Tip #5: Save liên tay, không là khóc rồng

- **Rule**: git-workflow.mdc
- **Nội dung chính đã tích hợp**:
  - Khởi tạo git ngay từ đầu dự án
  - Commit thường xuyên sau mỗi feature nhỏ
  - Sử dụng git reset khi cần
  - Ví dụ thực tế về việc mất code

### Tip #6: Debug với AI? Đừng copy-paste log như noob

- **Rule**: debug-with-browser-mcp.mdc
- **Nội dung chính đã tích hợp**:
  - Sử dụng Browser MCP thay vì copy-paste log
  - Cung cấp context đầy đủ bao gồm UI và console log
  - Quy trình debug hiệu quả
  - Lợi ích so với debug truyền thống

### Tip #7: Vấn đề không phải là tool, mà là cách dùng

- **Rule**: Đã cập nhật planning-workflow.mdc
- **Nội dung chính đã tích hợp**:
  - Chuẩn bị docs rõ ràng (PRD, user flows)
  - Set rules cho AI để tránh "tự tưởng tượng"
  - Dùng đúng model cho đúng task
  - Commit code thường xuyên

## Hướng Dẫn Sử Dụng Mapping

1. **Tìm tip bạn quan tâm** trong bảng tổng quan
2. **Xem rules tương ứng** đã tích hợp
3. **Đọc chi tiết tích hợp** để hiểu những điểm chính đã được áp dụng
4. **Tham khảo file rule đầy đủ** trong thư mục `.cursor/rules/`

## Cập Nhật Mapping

Khi thêm tip mới hoặc cập nhật rules:

1. Thêm tip mới vào bảng tổng quan
2. Mô tả chi tiết tích hợp trong phần tương ứng
3. Cập nhật trạng thái tích hợp
4. Liên kết với rules mới nếu có
