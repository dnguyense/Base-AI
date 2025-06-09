## 2024-12-30: Mở Rộng Workflow System

### Bối Cảnh

Cần mở rộng hệ thống workflow để hỗ trợ nhiều platform và tạo instruction có thể tái sử dụng.

### Quyết Định

1. **iOS Workflow**: Tạo `ios-workflow.mdc` tương tự `android-workflow.mdc` nhưng phù hợp với iOS development patterns
2. **Universal Code Deduplication**: Đổi `android-code-deduplication.mdc` thành `universal-code-deduplication.mdc` để áp dụng cho mọi ngôn ngữ lập trình
3. **Mobile Utility Workflow Enhancement**: Bổ sung AI-generated reusable instructions feature
4. **Project Identity Template**: Tạo `project-identity-template.mdc` với comprehensive template cho AI auto-generation
5. **Project Identification Priority**: Cập nhật để ưu tiên kiểm tra `.project-identity` trước tiên

### Tác Động

- iOS developers sẽ có quy trình tương tự Android
- Code deduplication rules áp dụng universal cho mọi project
- Instruction files có thể tái sử dụng giữa Android và iOS
- AI có thể auto-generate project identity và áp dụng đúng quy tắc
- Workflow system trở nên scalable và maintainable hơn

### Files Được Tạo/Cập Nhật

- ✅ `.cursor/rules/ios-workflow.mdc` (mới)
- ✅ `.cursor/rules/universal-code-deduplication.mdc` (rename từ android-code-deduplication.mdc)
- ✅ `.cursor/rules/mobile-utility-workflow.mdc` (cập nhật)
- ✅ `.cursor/rules/project-identity-template.mdc` (mới)
- ✅ `.cursor/rules/project-identification-rules.mdc` (cập nhật)
- ✅ `.cursor/rules.json` (cập nhật)

## 2024-12-30: Hoàn Thiện iOS Workflow & Project Templates

### Bối Cảnh

Cần tạo luồng iOS tự động tương tự Android và cập nhật project identity để AI có thể nhận biết workflow cho từng loại dự án.

### Quyết Định

1. **iOS Automated Workflow**: Cập nhật `ios-workflow.mdc` với luồng tạo dự án tự động bao gồm:

   - MVVM + Clean Architecture setup
   - Tech stack chuẩn (SwiftUI, Combine, Alamofire, etc.)
   - Build optimization settings
   - Performance monitoring setup
   - Automated testing templates
   - App size monitoring

2. **iOS Project Template**: Tạo `ios-project-template.mdc` với:

   - Package.swift và Podfile templates
   - Build settings optimization
   - Base classes (BaseViewModel, BaseUseCase, BaseRepository)
   - DI container setup
   - Error handling patterns
   - CI/CD GitHub Actions template
   - Performance monitoring integration

3. **Project Identity Workflow Mapping**: Cập nhật `project-identity-template.mdc` để include:
   - Workflow mapping cho từng platform
   - AI có thể tự động áp dụng đúng workflow rules
   - Code generation strategy per project type

### Tác Động

- iOS development process được standardize tương tự Android
- AI có thể tự động setup project template dựa trên project type
- Workflow rules được map rõ ràng trong .project-identity
- Cross-platform development experience được đồng bộ hóa

### Files Được Tạo/Cập Nhật Bổ Sung

- ✅ `.cursor/rules/ios-workflow.mdc` (cập nhật với automated workflow)
- ✅ `.cursor/rules/ios-project-template.mdc` (mới)
- ✅ `.cursor/rules/project-identity-template.mdc` (cập nhật với workflow mapping)
- ✅ `.cursor/rules.json` (cập nhật với ios-project-template)
