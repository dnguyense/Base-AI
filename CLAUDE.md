# Base AI Project - Claude Memory Configuration

> **🔗 MANDATORY RULES SYNCHRONIZATION**  
> **BẮT BUỘC** sử dụng các rules từ `.cursor/rules/` làm nguồn chính thức cho tất cả workflows.  
> File này định hướng Claude về cách làm việc với dự án Base-AI-Project.

## 📋 Project Overview

Base-AI-Project là framework template AI-powered được thiết kế cho Cursor IDE với hỗ trợ MCP (Model Context Protocol). Cung cấp workflows, rules và tools toàn diện để phát triển ứng dụng hiệu quả với sự hỗ trợ của AI.

## 🎯 Primary Rules Sources (MANDATORY)

### Core Development Rules

@.cursor/rules/base-rules.mdc
@.cursor/rules/development-rules.mdc
@.cursor/rules/development-control-rules.mdc
@.cursor/rules/file-protection-rules.mdc

### Mobile Development Workflows

@.cursor/rules/mobile-utility-workflow.mdc
@.cursor/rules/android-workflow.mdc
@.cursor/rules/ios-workflow.mdc
@.cursor/rules/tdd-mobile-workflow.mdc

### Project Management

@.cursor/rules/planning-workflow.mdc
@.cursor/rules/planning-enforcement.mdc
@.cursor/rules/planning-validation-rules.mdc
@.cursor/rules/brainstorm-overview.mdc
@.cursor/rules/brainstorm-detailed-workflow.mdc
@.cursor/rules/expert-brainstorm-workflow.mdc
@.cursor/rules/brainstorm-expert-integration.mdc
@.cursor/rules/expert-brainstorm-guide.mdc

### Code Quality & Architecture

@.cursor/rules/android-code-deduplication.mdc
@.cursor/rules/universal-code-deduplication.mdc
@.cursor/rules/android-project-template.mdc
@.cursor/rules/ios-project-template.mdc

### Integration & API

@.cursor/rules/api-integration-rules.mdc
@.cursor/rules/backend-rules-optimized.mdc
@.cursor/rules/frontend-rules.mdc

### Specialized Workflows

@.cursor/rules/git-workflow.mdc
@.cursor/rules/i18n-rules.mdc
@.cursor/rules/resource-management.mdc
@.cursor/rules/terminal-rules.mdc
@.cursor/rules/design-to-prompt.mdc

### Project Setup & Identity

@.cursor/rules/project-creation-workflow.mdc
@.cursor/rules/project-identity-template.mdc
@.cursor/rules/project-identification-rules.mdc
@.cursor/rules/tech-stack-selection.mdc

### Advanced Features

@.cursor/rules/memory-bank-workflow.mdc
@.cursor/rules/experience-system-workflow.mdc
@.cursor/rules/context7-auto-workflow.mdc
@.cursor/rules/ReviewGateV2.mdc
@.cursor/rules/four-role-development.mdc

## ⚠️ CRITICAL ENFORCEMENT RULES

### Mandatory Compliance

1. **BẮT BUỘC** tuân thủ 100% các rules trong `.cursor/rules/`
2. **NGHIÊM CẤM** tạo rules mới mà không sync với `.cursor/rules/`
3. **BẮT BUỘC** cập nhật memory khi có thay đổi trong `.cursor/rules/`
4. **BẮT BUỘC** sử dụng relative paths để đảm bảo tính di động

### Project Structure Understanding

- **Template Framework**: Đây là framework template, không phải ứng dụng cụ thể
- **Workflow-First**: Luôn áp dụng workflow phù hợp từ `.cursor/rules/`
- **Platform Agnostic**: Hỗ trợ Android, iOS, Flutter, Web development
- **AI-Powered**: Tích hợp sâu với AI tools và MCP protocols

## 🚀 Essential Workflows (MANDATORY SEQUENCE)

### 1. Project Analysis Phase

```bash
# ALWAYS start by checking project identity
cat .project-identity
cat .project-personality
```

### 2. Brainstorm Phase (MANDATORY for new projects)

- **NEVER skip brainstorming** for new projects
- Use: "Tôi muốn brainstorm ý tưởng [your app idea]"
- Creates structured plan and updates .project-identity

### 3. 4-Role Development Process

- **Planner**: Analyzes requirements and creates plan
- **Architect**: Designs technical architecture
- **Builder**: Implements the solution
- **Tester**: Validates and tests implementation

### Communication Style

- Sử dụng tiếng Việt cho trò chuyện và giải thích với giọng điệu hài hước kiểu giới trẻ gen-z
- Trả lời rõ ràng, đầy đủ nhưng không dài dòng
- Luôn hỏi làm rõ khi yêu cầu không rõ ràng
- Thông báo khi bạn không chắc chắn về cách giải quyết

### Core Working Principles

- **Luôn suy luận yêu cầu của người dùng trước khi thực hiện**
- Phân tích ý định thực sự đằng sau yêu cầu
- Luôn phân tích kỹ trước khi chỉnh sửa code
- Tập trung vào vấn đề chính, không lạc đề
- Xác định rõ nguyên nhân gốc rễ (root cause) trước khi sửa lỗi
- Chỉ thực hiện một thay đổi lớn mỗi lần và kiểm tra kỹ trước khi tiếp tục

### User Intent Analysis

- **Phân tích ngữ cảnh**: Hiểu rõ bối cảnh và mục tiêu của người dùng
- **Xác định mức độ ưu tiên**: Phân biệt yêu cầu cấp thiết và không cấp thiết
- **Đề xuất giải pháp tối ưu**: Không chỉ làm theo yêu cầu mà còn đề xuất cách tốt hơn nếu có
- **Xác nhận hiểu đúng**: Hỏi lại khi không chắc chắn về ý định của người dùng

### Problem Solving

- Ngừng ngay khi gặp vấn đề cần giải quyết
- Không nhảy vội vào việc sửa code khi gặp lỗi
- Luôn đưa ra 2-3 phương án khi giải quyết vấn đề phức tạp
- Dừng và xin hướng dẫn sau 3 lần thử không thành công

### Quality Standards

- Sử dụng tiếng Anh cho tất cả code và tài liệu kỹ thuật
- Viết code tự giải thích với tên biến/hàm rõ ràng
- Tuân thủ các nguyên tắc SOLID
- Implement xử lý lỗi một cách đúng đắn

### Documentation

- Ghi lại mọi quyết định quan trọng vào Decisions.md
- Cập nhật Codebase.md mỗi khi hoàn thiện một phần
- Đánh dấu các task đã hoàn thành trong Instruction.md
- Kết thúc mỗi nhiệm vụ với mô tả ngắn gọn về công việc đã làm

### Safety Measures

- Không tự ý tối ưu code khi không được yêu cầu
- Không xóa code không liên quan khi không được yêu cầu
- Cẩn thận khi xóa file hoặc chỉnh sửa file ngoài nhiệm vụ chính
- Tạo backup đơn giản trước những thay đổi lớn

### Context & Memory Management

- Tìm kiếm thông tin liên quan trong bộ nhớ dự án
- Sử dụng kinh nghiệm từ các dự án tương tự
- Cập nhật bộ nhớ với thông tin mới sau khi hoàn thành task

### Workflow Optimization

- Ưu tiên hiệu quả và tốc độ thực hiện
- Tránh lặp lại công việc đã làm
- Sử dụng templates và patterns có sẵn
- Tự động hóa các tác vụ lặp đi lặp lại

### Error Prevention

- Kiểm tra kỹ trước khi thực hiện thay đổi lớn
- Validate input và output
- Test các thay đổi trước khi commit
- Có kế hoạch rollback khi cần thiết

## 🔄 Rules Hierarchy Priority

1. `.cursor/rules/` - **PRIMARY SOURCE** (Highest Priority)

## 📁 Critical File Locations

### Documentation Rules

- **ALL .md files** MUST be placed in `docs/project/`
- Update `docs/project/Codebase.md` with implementation summaries
- Mark completed tasks in `docs/project/Instruction.md`
- Document decisions in `docs/project/Decisions.md`

### Backup Protocol

- **NEVER delete files directly** - move to `_backups/`
- Maintain directory structure in backups
- Create timestamped backup folders: `_backups/YYYY-MM-DD/`

### Project Organization

```
Base-AI-Project/
├── .cursor/rules/          # 60+ workflow rules (source of truth)
├── instructions/           # Project-specific instructions
├── docs/                   # Documentation
│   ├── project/           # All .md files MUST go here
│   └── templates/         # Project templates
├── brainstorms/           # Brainstorm session files
├── experiences/           # Knowledge base from past projects
├── scripts/               # Automation scripts
├── design/               # Design files for AI analysis
└── _backups/             # File backups (git-ignored)
```

### Platform-Specific Patterns

#### Android Development

- Architecture: MVVM + Clean Architecture
- Package: `com.base.app/{base,core,data,domain,ui}`
- **ALWAYS check module registry** before creating features
- Base classes in base/ package
- Feature modules in ui/features/

#### iOS Development

- Architecture: MVVM + SwiftUI
- Use Combine for reactive programming
- Follow Apple's Human Interface Guidelines
- Implement proper state management

#### Flutter Development

- Architecture: Clean Architecture + BLoC
- Separation of concerns with layers
- Widget composition patterns
- Platform-specific implementations

#### Web Development

- Frontend: Component-based architecture
- Backend: RESTful API design
- State management with context/stores
- Responsive design principles

## 🔧 Common Development Commands

### Project Initialization

```bash
# Check project identity before any task
cat .project-identity

# For new projects - MANDATORY brainstorm first
# Start with: "Tôi muốn brainstorm ý tưởng [your app idea]"

# Backup files before major changes
./scripts/backup_file.sh <file_path>

# Send Telegram notifications
./scripts/notify.sh "Task completed: [description]"
```

### Testing & Quality

```bash
# Run tests (check project-specific test commands)
# Android: ./gradlew test
# iOS: xcodebuild test
# Flutter: flutter test
# Web: npm test

# Check code quality
# Android: ./gradlew lint
# iOS: swiftlint
# Flutter: flutter analyze
# Web: npm run lint
```

### Project Analysis

```bash
grep -r "pattern" . --include="*.ext"
find . -name "*.md" -type f
```

## 🎯 Key Success Factors

1. **Always analyze user intent** before implementation
2. **Check .project-identity** before any task
3. **Use appropriate workflow** from `.cursor/rules/`
4. **Follow platform-specific conventions**
5. **Create modular, reusable components**
6. **Update documentation** alongside code changes
7. **Test thoroughly** before marking complete

## ⚠️ Common Pitfalls to Avoid

- Starting coding without brainstorming
- Skipping the planning phase
- Creating duplicate functionality
- Ignoring project identity settings
- Not backing up before major changes
- Implementing without understanding requirements
- Not following the 4-role development process

## 🔄 Integration Features

- **Telegram Notifications**: Task completion alerts
- **MCP Tools**: Browser debugging, database management
- **Memory Bank**: Persistent knowledge storage
- **Experience System**: Learning from past projects

## Project Information

### Project Identity

- Luôn kiểm tra .project-identity để biết cấu trúc và ngôn ngữ dự án
- Nếu chưa có file .project-identity hãy tạo và yêu cầu người dùng bổ sung thêm thông tin

### Task Status Legend

- ✅ Completed
- ⏳ In Progress
- ❌ Not Started

## Git Workflow

### Commit Convention

- Tuân thủ quy ước commit (feat, fix, docs, style, refactor...)
- Sử dụng tiếng Anh cho commit messages
- Format: `type(scope): description`
- Examples:
  - `feat(camera): add new filter effects`
  - `fix(ui): resolve layout issue in preview`
  - `docs(readme): update installation guide`

### Branch Management

- Sử dụng feature branches cho mỗi tính năng mới
- Merge vào main branch sau khi review
- Xóa feature branches sau khi merge thành công

## Internationalization (i18n)

### String Resources

- Luôn kiểm tra và thêm các chuỗi dịch hoặc resource khi tạo
- Sử dụng tiếng Anh làm ngôn ngữ mặc định
- Hỗ trợ đa ngôn ngữ với tiếng Anh làm fallback
- Tạo string keys có ý nghĩa và dễ hiểu

### Resource Management

- Tổ chức strings theo feature hoặc screen
- Sử dụng plurals cho các string có số lượng
- Implement proper formatting cho dates, numbers, currencies

---

**Remember**: This is a template framework, not a specific application. Always adapt workflows to match your actual project needs while maintaining core principles from `.cursor/rules/`.
