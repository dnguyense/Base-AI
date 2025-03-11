# Project Management:
- Reference Instruction.md for all feature implementations
- Reference API.md for all API endpoints and their request/response formats
- Reference Point.md for API service
- Reference Diagram.md để biết các màn nào đã liên kết với nhau
- Ensure new code aligns with defined milestones
- Follow the established database schema
- Consider cost optimizations defined in metrics
- Maintain consistency with existing components
- Ngôn ngữ tiếng Việt cho các phần trò chuyện và giải thích một cách hài hước của giới trẻ, ngôn ngữ ứng dụng mặc định là tiếng Anh

# Help
Sau khi hoàn thiện 1 tính năng hãy mô tả vào file Help.md để sau này tôi có thể hiểu được tính năng và cách hoạt động

## Code Style & Standards
- Use English for all code and documentation.
- Avoid raw types; use generics where appropriate.
- Keep methods concise and focused on a single task.
- Chạy thử mỗi khi hoàn thiện 1 tính năng

## Language 
- Language of communication and instructions in Vietnamese
- Luôn tạo ứng dụng theo cấu trúc đa ngôn ngữ ( mặc định tiếng Anh ) và có thể có các ngôn ngữ khác theo hướng dẫn trong Instruction.md


## CODEBASE STRUCTURE
- Tạo tóm tắt các class mỗi khi hoàn thiện code để 1 AI khác có thể hiểu được vào [Codebase.md]

###Ví dụ:
- Module/Package: [Tên]
- [TênClass] (Chức năng chính)
function_a, function_b, function_c

## Quy tắc sửa lỗi
- Nếu không sửa được lỗi sau 3 lần cố gắng, dừng lại ngay
- Đề xuất 2-3 hướng tiếp cận thay thế với giải thích ngắn gọn
- Thông báo rõ ràng: "Tôi đã thử 3 cách nhưng chưa thành công"
- Không được tiếp tục sửa mà không có chỉ dẫn mới

## Tracking thay đổi
- Lưu trữ ngắn gọn trạng thái code trước mỗi thay đổi lớn
- Cung cấp lệnh revert đơn giản nếu được yêu cầu
- Đánh dấu các checkpoint ổn định trong quá trình phát triển
- Không thực hiện nhiều thay đổi lớn cùng lúc

## Debug hiệu quả
- Phân tích nguyên nhân root trước khi sửa
- Xác định rõ "symptom vs cause"
- Khi gặp lỗi, liệt kê tất cả các giả thuyết có thể
- Xác nhận giả thuyết bằng cách kiểm tra có hệ thống
- Khi liên tục thất bại, thay đổi hoàn toàn hướng tiếp cận

## Workflow tối ưu 
- Tóm tắt đầu/cuối phiên làm việc trong 2-3 dòng
- Dùng file Decisions.md ghi lại các quyết định quan trọng
- Xác định rõ độ ưu tiên khi có nhiều vấn đề cần giải quyết
- Dự đoán các vấn đề có thể phát sinh từ mỗi thay đổi

## Cơ chế an toàn
- Báo động khi thay đổi có rủi ro cao
- Tạo phiên bản backup đơn giản trước thay đổi lớn
- Không thay đổi đồng thời nhiều file/module quan trọng
- Đánh giá mức độ ảnh hưởng trước mỗi thay đổi

## Changelog ( Changelog.md )
Luôn cập nhật Changelog.md, mô tả cụ thể yêu cầu và cách bạn xử lý. Ví dụ: Yêu cầu: bổ sung tính năng User. Tôi đã xây dựng cấu trúc database và .... hãy mô tả ngắn gọn tránh changelog quá dài

## General Rules:
Newest changes always go at the top of the file
Each version should be in descending order (newest to oldest)
Group related changes under the same category
Use bullet points for each entry
Sau mỗi lần xong 1 chức năng bạn đánh dấu vào trong Instruction.md là đã hoàn thành theo nguyên tắc Legend tasklist để sau đó có thể tiếp tục từ các phần tiếp theo

## Legend tasklist:
- ✅ Completed
- ⏳ In Progress
- ❌ Not Started

## Git
Always commit using git every time it runs successfully without errors with a clear description of what you did. You should run tests and only commit when you see a success message.

### Commit Message Guidelines
- Follow conventional commits format: <type>[optional scope]: <description>
- Use only lowercase letters in commit messages
- Keep commit message titles under 60 characters
- Valid types: feat, fix, docs, style, refactor, test, chore, perf
- Add detailed body for complex changes using multiple -m flags
- Reference related issues when applicable

## Code Architecture
- Follow SOLID principles
- Implement proper error handling and logging
- Use dependency injection where appropriate
- Write unit tests for core functionality
- Document public APIs and complex logic
- Maintain clean package structure
- Use design patterns appropriately

## Communication Style
- Provide clear explanations when requested
- Ask for clarification when requirements are unclear
- Give step-by-step guidance for complex tasks
- Hướng dẫn và giải thích tiếng Việt

## Debugging
- DO NOT immediately jump to editing the code to fix the issue.
- explain the issue in simple terms.
- present solutions and options.
- ALWAYS ask for approval before proceeding and making code changes.

## Important Note
Whenever you see some problem that needs fixing, stop working.
Always think and analyze before editing code. Use reasoning. Don't assume that changes you could make are the changes needed to achieve the desired results. Be smart, prudent and thorough.
Always re-read your notes before taking action and update them after making changes.
Maintain and always check a document with the system architecture to ensure you don't code redundant functionality in different modules.
Anytime you find yourself saying "tôi thấy vấn đề" or something like that, stop and literally ask yourself the question "Is this really THE issue I'm loking for or jus AN issue that I noticed?" If it's not THE issue, make note of it in the debugging backlog and keep looking for THE issue you're trying to find and fix. You MUST literally state: "Let me make sure this is really the issue" and then conduct an analysis before writing code.
ALWAYS conduct a differential diagnosis before attempting bug fixes.
Only make one major change at a time and conduct tests before moving forward

## Best Practices
- Write self-documenting code with clear naming
- Include proper exception handling
- Optimize performance where critical
- Consider memory management
- Follow security best practices
- Write maintainable and extensible code

## Safety Guaranteed
- Always be careful before you delete a file.
- Always be careful when you have to edit a file outside of the task at hand.
- Bạn không tự ý tối ưu code một cách tự động, chỉ tối ưu khi tôi yêu cầu
- Bạn không tự ý xóa các code không liên quan khi không được yêu cầu