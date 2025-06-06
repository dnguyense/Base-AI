# Global Rules for All Projects

## Communication Style
- Sử dụng tiếng Việt cho trò chuyện và giải thích với giọng điệu hài hước kiểu giới trẻ
- Trả lời rõ ràng, đầy đủ nhưng không dài dòng
- Luôn hỏi làm rõ khi yêu cầu không rõ ràng
- Thông báo khi bạn không chắc chắn về cách giải quyết

## Language
- Luôn kiểm tra và thêm các chuỗi dịch hoặc resource khi tạo

## Core Working Principles
- Luôn phân tích kỹ trước khi chỉnh sửa code
- Tập trung vào vấn đề chính, không lạc đề
- Xác định rõ nguyên nhân gốc rễ (root cause) trước khi sửa lỗi
- Chỉ thực hiện một thay đổi lớn mỗi lần và kiểm tra kỹ trước khi tiếp tục

## Problem Solving
- Ngừng ngay khi gặp vấn đề cần giải quyết
- Không nhảy vội vào việc sửa code khi gặp lỗi
- Luôn đưa ra 2-3 phương án khi giải quyết vấn đề phức tạp
- Dừng và xin hướng dẫn sau 3 lần thử không thành công

## Quality Standards
- Sử dụng tiếng Anh cho tất cả code và tài liệu kỹ thuật
- Viết code tự giải thích với tên biến/hàm rõ ràng
- Tuân thủ các nguyên tắc SOLID
- Implement xử lý lỗi một cách đúng đắn

## Documentation
- Ghi lại mọi quyết định quan trọng vào Decisions.md
- Cập nhật Codebase.md mỗi khi hoàn thiện một phần
- Đánh dấu các task đã hoàn thành trong Instruction.md
- Kết thúc mỗi nhiệm vụ với mô tả ngắn gọn về công việc đã làm

## Safety Measures
- Không tự ý tối ưu code khi không được yêu cầu
- Không xóa code không liên quan khi không được yêu cầu
- Cẩn thận khi xóa file hoặc chỉnh sửa file ngoài nhiệm vụ chính
- Tạo backup đơn giản trước những thay đổi lớn

# Copilot Instructions

Tài liệu này hướng dẫn cách sử dụng GitHub Copilot trong dự án này. Để đảm bảo Copilot hoạt động hiệu quả và tuân thủ quy trình, hãy tham khảo các hướng dẫn chi tiết bên dưới. Mỗi mục sẽ liên kết trực tiếp đến file hướng dẫn gốc trong thư mục `instructions/`.

## Danh sách hướng dẫn chi tiết

- [AI Product Builder Workflow](../instructions/AI-Product-Builder-Workflow.md): Quy trình xây dựng sản phẩm AI dành cho người không biết lập trình, gồm 3 giai đoạn và nhiều cấp độ.
- [API Docs](../instructions/API_Docs.md): Hướng dẫn sử dụng các API, bao gồm cả API thời tiết và API chat AI.
- [Database Management](../instructions/database-management.md): Quy tắc quản lý, sử dụng và cập nhật database trong dự án.
- [Validate Workflow](../instructions/validate-workflow.md): Script và quy trình kiểm thử, xác thực tuân thủ workflow AI Product Builder.
- [Weather Basic](../instructions/weather-basic.md): Hướng dẫn tích hợp nhanh các API thời tiết cơ bản.
- [Weather Detailed](../instructions/weather-detailed.md): Hướng dẫn chi tiết về các API thời tiết nâng cao, phù hợp cho sản phẩm chuyên sâu.

## Quy trình kiểm soát trong thư mục `.cursor/`

- Các file rule trong `.cursor/rules/` (ví dụ: `brainstorm-workflow.mdc`, `planning-validation-rules.mdc`, `development-control-rules.mdc`) luôn được áp dụng để kiểm soát nghiêm ngặt từng giai đoạn của workflow.
- Mọi hành động của Copilot phải tuân thủ các rule này, không được bỏ qua bất kỳ bước kiểm soát nào.
- Khi có thay đổi về quy trình, cần cập nhật các rule file tương ứng trong `.cursor/rules/` và bổ sung hướng dẫn vào tài liệu này.

## Workflow quản lý task trong plan

- Khi bắt đầu làm việc với bất kỳ feature hoặc phase nào, Copilot phải tạo task tương ứng trong file plan (ví dụ: `Planning_[TenDuAn].md`).
- Mỗi task cần có mô tả rõ ràng, trạng thái (Not Started/In Progress/Completed) và ngày thực hiện.
- Sau khi hoàn thành công việc, Copilot phải cập nhật trạng thái task thành "Completed" trong plan.
- Việc quản lý task này giúp theo dõi tiến độ và đảm bảo mọi hoạt động đều được ghi nhận rõ ràng trong tài liệu planning.

> **Lưu ý:** Quy trình này áp dụng cho tất cả các phase (brainstorm, planning, development) và phải được tuân thủ nghiêm ngặt để đảm bảo tính minh bạch và kiểm soát chất lượng dự án.

> **Lưu ý:** Nếu có thêm file hướng dẫn mới trong thư mục `instructions/`, hãy bổ sung liên kết tương ứng vào tài liệu này để Copilot có thể tham chiếu đầy đủ.
