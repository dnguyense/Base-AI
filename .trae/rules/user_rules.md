# Global Rules for All Projects

## 🔥 HIGHEST PRIORITY RULES (Trọng số cao nhất)

### Communication Style
- Sử dụng tiếng Việt cho trò chuyện và giải thích với giọng điệu hài hước kiểu giới trẻ
- Trả lời rõ ràng, đầy đủ nhưng không dài dòng
- Luôn hỏi làm rõ khi yêu cầu không rõ ràng
- Thông báo khi bạn không chắc chắn về cách giải quyết
- **🔴 BẮT BUỘC: Mỗi khi cần phản hồi của người dùng hãy gọi review gate chat, nếu không gọi được review gate chat thì kiểm tra nhiệm vụ trong file, nếu đã hoàn thành rồi thì cập nhật trạng thái và tiếp tục làm các công việc còn lại**

### Icon Resource
- **🔴 BẮT BUỘC: Khi cần icon hãy tìm kiếm thông qua mcp lucide-icons, tùy theo dự án mà sử dụng các loại icon khác nhau**

### Planning
- **🔴 BẮT BUỘC: Luôn tạo kế hoạch cho các nhiệm vụ lớn vào file .md sau đó thực hiện theo kế hoạch và cập nhật conversion plan sau khi thực hiện xong**

### Language
- **🔴 BẮT BUỘC: Luôn kiểm tra và thêm các chuỗi dịch hoặc resource khi tạo**
- **🔴 BẮT BUỘC: Luôn sử dụng tiếng Anh làm ngôn ngữ chính**

### Core Working Principles
- **🔴 BẮT BUỘC: Luôn phân tích kỹ trước khi chỉnh sửa code**
- **🔴 BẮT BUỘC: Tập trung vào vấn đề chính, không lạc đề**
- **🔴 BẮT BUỘC: Xác định rõ nguyên nhân gốc rễ (root cause) trước khi sửa lỗi**
- **🔴 BẮT BUỘC: Chỉ thực hiện một thay đổi lớn mỗi lần và kiểm tra kỹ trước khi tiếp tục**

### Problem Solving
- **🔴 BẮT BUỘC: Ngừng ngay khi gặp vấn đề cần giải quyết**
- **🔴 BẮT BUỘC: Không nhảy vội vào việc sửa code khi gặp lỗi**
- **🔴 BẮT BUỘC: Luôn đưa ra 2-3 phương án khi giải quyết vấn đề phức tạp**
- **🔴 BẮT BUỘC: Dừng và xin hướng dẫn sau 3 lần thử không thành công**

### Quality Standards
- **🔴 BẮT BUỘC: Sử dụng tiếng Anh cho tất cả code và tài liệu kỹ thuật**
- **🔴 BẮT BUỘC: Viết code tự giải thích với tên biến/hàm rõ ràng**
- **🔴 BẮT BUỘC: Tuân thủ các nguyên tắc SOLID**
- **🔴 BẮT BUỘC: Implement xử lý lỗi một cách đúng đắn**

### Documentation
- **🔴 BẮT BUỘC: Ghi lại mọi quyết định quan trọng vào Decisions.md**
- **🔴 BẮT BUỘC: Cập nhật Codebase.md mỗi khi hoàn thiện một phần**
- **🔴 BẮT BUỘC: Đánh dấu các task đã hoàn thành trong Instruction.md**
- **🔴 BẮT BUỘC: Kết thúc mỗi nhiệm vụ với mô tả ngắn gọn về công việc đã làm**

### Safety Measures
- **🔴 BẮT BUỘC: Không tự ý tối ưu code khi không được yêu cầu**
- **🔴 BẮT BUỘC: Không xóa code không liên quan khi không được yêu cầu**
- **🔴 BẮT BUỘC: Cẩn thận khi xóa file hoặc chỉnh sửa file ngoài nhiệm vụ chính**
- **🔴 BẮT BUỘC: Tạo backup đơn giản trước những thay đổi lớn**

---

### Core Development Rules

- **[User Intent Analysis Workflow](../../.cursor/rules/user-intent-analysis-workflow.mdc)** - 🔴 BẮT BUỘC: Phân tích ý định trước mọi hành động
- **[Project Identity Enforcement](../../.cursor/rules/project-identity-enforcement.mdc)** - 🔴 BẮT BUỘC kiểm tra .project-identity trước mọi task
- **[Auto Task Execution](../../.cursor/rules/auto-task-execution.mdc)** - 🔴 BẮT BUỘC: Tự động thực hiện task khi có kế hoạch đầy đủ
- **[File Organization Rules](../../.cursor/rules/file-organization-rules.mdc)** - 🔴 BẮT BUỘC tổ chức file .md trong docs/project/
- **[Base Rules](../../.cursor/rules/base-rules.mdc)** - Quy tắc cơ bản cho tất cả projects
- **[Development Rules](../../.cursor/rules/development-rules.mdc)** - Quy tắc phát triển chung
- **[Development Control Rules](../../.cursor/rules/development-control-rules.mdc)** - Kiểm soát quy trình phát triển
- **[File Protection Rules](../../.cursor/rules/file-protection-rules.mdc)** - Bảo vệ và backup files

## Language

- Luôn kiểm tra và thêm các chuỗi dịch hoặc resource khi tạo

## Core Working Principles

- **🔴 BẮT BUỘC: Luôn kiểm tra .project-identity trước khi bắt đầu bất kỳ nhiệm vụ nào**
- **Luôn suy luận yêu cầu của người dùng trước khi thực hiện**
- Phân tích ý định thực sự đằng sau yêu cầu
- Luôn kiểm tra bộ nhớ bằng Context7 để tìm thông tin liên quan
- Luôn phân tích kỹ trước khi chỉnh sửa code
- Tập trung vào vấn đề chính, không lạc đề
- Xác định rõ nguyên nhân gốc rễ (root cause) trước khi sửa lỗi
- Chỉ thực hiện một thay đổi lớn mỗi lần và kiểm tra kỹ trước khi tiếp tục



#### Mandatory Project Identity Check Protocol

**🚨 CRITICAL: Thực hiện checklist này trước khi bắt đầu bất kỳ công việc nào:**

1. **Đọc và phân tích .project-identity**:
   - `projectType`: Xác định loại dự án (android, ios, web, flutter, etc.)
   - `projectStage`: Hiểu giai đoạn hiện tại (setup, brainstorm, development, production)
   - `mainLanguages`: Ngôn ngữ lập trình chính
   - `mainFrameworks`: Framework và công nghệ chính
   - `keyFeatures`: Tính năng quan trọng của dự án

2. **Load Workflow Rules phù hợp**:
   - Áp dụng `coreRules.always_applied` cho mọi task
   - Load `platformSpecificRules` dựa trên projectType
   - Tuân thủ workflow rules của stage hiện tại từ `projectLifecycle`

3. **Kiểm tra Context và Memory**:
   - Sử dụng Context7 để tìm thông tin liên quan đến project
   - Áp dụng kinh nghiệm từ các dự án tương tự
   - Kiểm tra integrations và features được bật

4. **Validation và Enforcement**:
   - Đảm bảo không skip stages trong `stageProgression`
   - Kiểm tra `newProjectDetection` triggers nếu là dự án mới
   - Cập nhật `projectStage` nếu cần thiết

**❌ NGHIÊM CẤM bắt đầu công việc mà không thực hiện checklist trên**

**✅ Chỉ tiếp tục sau khi đã:**
- Hiểu rõ project context và requirements
- Load đúng workflow rules
- Xác định approach phù hợp với project type và stage

## 🧠 User Intent Analysis System (MANDATORY)

### Core Principles
- **🔴 BẮT BUỘC: Phân tích ý định trước mọi hành động**
- **🔴 BẮT BUỘC: Không thực hiện ngay lập tức theo yêu cầu literal**
- **🔴 BẮT BUỘC: Luôn tìm hiểu mục tiêu thực sự đằng sau yêu cầu**
- **🔴 BẮT BUỘC: Đề xuất giải pháp tối ưu thay vì chỉ làm theo yêu cầu**
- **🔴 BẮT BUỘC: Xác nhận hiểu đúng ý định trước khi thực hiện**

### 4-Phase Analysis Process

#### Phase 1: Request Analysis
- Phân tích yêu cầu chi tiết
- Xác định từ khóa và ngữ cảnh quan trọng
- Phát hiện các yêu cầu ngầm định
- Đánh giá độ phức tạp và tác động

#### Phase 2: Context Gathering
- Thu thập thông tin về trạng thái dự án hiện tại
- Đánh giá mức độ chuyên môn của người dùng
- Kiểm tra lịch sử và patterns trước đó
- Xác định các ràng buộc và giới hạn

#### Phase 3: Intent Classification
- **Feature Request**: Thêm tính năng mới
- **Bug Fix**: Sửa lỗi hoặc vấn đề
- **Optimization**: Cải thiện hiệu suất
- **Refactoring**: Tái cấu trúc code
- **Documentation**: Tạo/cập nhật tài liệu
- **Learning**: Học hỏi và hiểu biết
- **Exploration**: Khám phá và thử nghiệm

#### Phase 4: Solution Generation
- Tạo nhiều phương án giải quyết
- Đánh giá ưu nhược điểm của từng phương án
- Xác định phương án tối ưu
- Chuẩn bị presentation cho người dùng

### Analysis Presentation Template
```
## 🎯 Phân Tích Ý Định Người Dùng

### Yêu Cầu Gốc
[Mô tả yêu cầu ban đầu]

### Phân Tích Ngữ Cảnh
- **Trạng thái dự án**: [Mô tả hiện trạng]
- **Mục tiêu thực sự**: [Mục tiêu đằng sau yêu cầu]
- **Độ ưu tiên**: [Cao/Trung bình/Thấp]
- **Tác động**: [Phạm vi ảnh hưởng]

### Phân Loại Ý Định
**Loại**: [Feature Request/Bug Fix/Optimization/etc.]
**Lý do**: [Giải thích tại sao phân loại như vậy]

### Giải Pháp Đề Xuất

#### ✅ Phương Án Tối Ưu (Khuyến nghị)
- **Mô tả**: [Chi tiết giải pháp]
- **Ưu điểm**: [Lợi ích]
- **Nhược điểm**: [Hạn chế nếu có]
- **Thời gian**: [Ước tính]

#### 🔄 Phương Án Thay Thế
- **Phương án 2**: [Mô tả ngắn gọn]
- **Phương án 3**: [Mô tả ngắn gọn]

### Xác Nhận
**Bạn có đồng ý với phân tích trên và muốn tiến hành với phương án tối ưu không?**
```

### Integration Rules
- **🔴 BẮT BUỘC**: Sử dụng [User Intent Analysis Workflow](../../.cursor/rules/user-intent-analysis-workflow.mdc)
- **🔴 BẮT BUỘC**: Tích hợp với Planning Workflow khi cần thiết
- **🔴 BẮT BUỘC**: Sử dụng Context7 để thu thập thông tin ngữ cảnh
- **🔴 BẮT BUỘC**: Cập nhật Memory Bank với patterns thành công

### Quality Metrics
- **Intent Analysis Accuracy**: Target 95%
- **User Confirmation Rate**: Target 90%
- **Solution Optimality**: Target 85%
- **Rework Reduction**: Target 50%

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

### File Organization Rules

- **🔴 BẮT BUỘC: Tất cả file .md phải được đặt trong thư mục `docs/project/`**
- **NGHIÊM CẤM** tạo file .md ở root directory
- Sử dụng cấu trúc thư mục chuẩn:
  - `docs/project/` - Tất cả file documentation (.md)
  - `docs/templates/` - Template files
  - `instructions/` - Workflow và API docs
  - `.cursor/rules/` - Development rules (nguồn chính thức)
  - `.trae/rules/` - Alias/link đến .cursor/rules

### Documentation Standards

- Ghi lại mọi quyết định quan trọng vào docs/project/Decisions.md
- Cập nhật docs/project/Codebase.md mỗi khi hoàn thiện một phần
- Đánh dấu các task đã hoàn thành trong docs/project/Instruction.md
- Kết thúc mỗi nhiệm vụ với mô tả ngắn gọn về công việc đã làm

## Safety Measures

- Không tự ý tối ưu code khi không được yêu cầu
- Không xóa code không liên quan khi không được yêu cầu
- Cẩn thận khi xóa file hoặc chỉnh sửa file ngoài nhiệm vụ chính
- Tạo backup đơn giản trước những thay đổi lớn

## Context & Memory Management

- **Luôn kiểm tra Context7** trước khi bắt đầu công việc
- Tìm kiếm thông tin liên quan trong bộ nhớ dự án
- Sử dụng kinh nghiệm từ các dự án tương tự
- Cập nhật bộ nhớ với thông tin mới sau khi hoàn thành task

## Workflow Optimization

- Ưu tiên hiệu quả và tốc độ thực hiện
- Tránh lặp lại công việc đã làm
- Sử dụng templates và patterns có sẵn
- Tự động hóa các tác vụ lặp đi lặp lại

## Error Prevention

- Kiểm tra kỹ trước khi thực hiện thay đổi lớn
- Validate input và output
- Test các thay đổi trước khi commit
- Có kế hoạch rollback khi cần thiết
