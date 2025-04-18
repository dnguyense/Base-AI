# Tips Collection

Thư mục này chứa các tips và best practices để phát triển dự án hiệu quả hơn với AI. Các tips được tổ chức theo chủ đề và nguồn gốc.

## Cấu Trúc Thư Mục

```
tips-collection/
├── ai-models/                  # Tips về việc sử dụng AI models khác nhau
├── debugging/                  # Tips về debugging và troubleshooting
├── git-workflows/              # Tips về git và version control
├── mvp-development/            # Tips về phát triển MVP
├── project-rules/              # Tips về thiết lập và áp dụng project rules
└── images/                     # Hình ảnh gốc của các tips
```

## Cách Sử Dụng Tips

1. **Đọc Trước Khi Bắt Đầu**: Trước khi bắt đầu một phần của dự án, xem qua các tips liên quan để có cái nhìn tổng quan
2. **Tham Khảo Khi Gặp Vấn Đề**: Sử dụng tips như nguồn tham khảo khi gặp khó khăn
3. **Đóng Góp Thêm**: Thêm tips mới dựa trên kinh nghiệm

## Các Tips Hiện Có

### Tech Stack Selection (Tip #1)

- Sử dụng Next.js/React cho frontend để dễ scale
- Sử dụng Supabase làm backend đơn giản với auth và database
- Sử dụng Vercel cho deployment nhanh chóng
- Tránh các tech stack hiếm gặp để AI không "tự biên tự diễn"

### Four Role Development (Tip #2)

- Tuân thủ quy trình 4 vai trò: Planner > Architect > Builder > Tester
- Sử dụng ChatGPT để viết PRD và vẽ user flows
- Phá feature thành các task nhỏ, định rõ logic từng screen
- Không bỏ qua bước Architect để tránh việc phải sửa lại nhiều

### Project Rules (Tip #3)

- Thiết lập rules cho dự án trong Cursor qua .mdc files
- Quy định rõ về styling, API calls, và code structure
- Đảm bảo AI sinh code đúng như mong muốn
- Không để AI trộn lẫn nhiều style khác nhau

### AI Model Selection (Tip #4)

- Claude 3.5 Sonnet: Fix bug và xử lý logic phức tạp
- GPT-4o: Planning và UI design
- Gemini 2.5 Pro: Đọc và review codebase lớn
- Dùng đúng model cho đúng task để tiết kiệm thời gian

### Git Workflow (Tip #5)

- Khởi tạo git ngay từ đầu dự án
- Commit thường xuyên, không đợi "xong hết rồi commit"
- Biết cách sử dụng git reset khi cần
- Dùng git như lưới an toàn để tránh mất code

### Debugging With Browser MCP (Tip #6)

- Sử dụng Browser MCP thay vì copy-paste log
- Chụp screenshot bao gồm cả UI và console log
- AI thấy được toàn cảnh để fix lỗi nhanh hơn
- Tạo feedback loop nhanh để tăng tốc phát triển

### MVP Development (Tip #7)

- Chuẩn bị docs rõ ràng (PRD, user flows)
- Set rules cho AI để tránh "tự tưởng tượng"
- Dùng đúng model cho đúng task
- Commit code thường xuyên
- Keep it structured để ship faster

## Cách Đóng Góp Tip Mới

1. Tạo file markdown mới trong thư mục chủ đề phù hợp
2. Sử dụng định dạng:

   ```
   # [Tên Tip]

   ## Tóm Tắt
   [Mô tả ngắn gọn về tip]

   ## Chi Tiết
   [Mô tả chi tiết và cách áp dụng]

   ## Trường Hợp Thực Tế
   [Ví dụ từ kinh nghiệm thực tế]

   ## Liên Kết Với Rules
   [Liên kết đến các rules liên quan]
   ```

3. Cập nhật README.md để thêm tip mới vào danh sách

## Liên Kết Với Các Rules

Phần lớn các tips đã được tích hợp vào các rules trong thư mục `.cursor/rules/`:

- Tech Stack Selection: `tech-stack-selection.mdc`
- Four Role Development: `four-role-development.mdc`
- Project Rules: `project-rules-importance.mdc`
- AI Model Selection: (được tích hợp vào `four-role-development.mdc`)
- Git Workflow: `git-workflow.mdc`
- Debugging with Browser MCP: `debug-with-browser-mcp.mdc`
- MVP Development: (được tích hợp vào các rules khác)
