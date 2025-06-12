# Project Setup Instructions

## Tổng Quan

Hướng dẫn này dành cho việc setup một dự án mới sử dụng Base-AI-Project framework. Framework đã có sẵn:

- **🚀 Review Gate V2**: Tool tối ưu AI workflow với efficiency 5x
- **🛠️ Appdexer MCP**: Design analysis và project management
- **📋 TDD Integration**: Test-driven development workflow
- **🎯 Project Templates**: Platform-specific setup (Android/iOS/Web)

**⚡ Quick Start**: Sau khi đọc overview, jump tới [Review Gate V2 Setup](#8-review-gate-v2-setup---bắt-buộc-khuyến-nghị) để setup công cụ quan trọng nhất.

## 1. Brainstorm và Phân Tích Yêu Cầu

### 1.1 Thu Thập Thông Tin Dự Án

```bash
# Bắt đầu với brainstorm session
# Hỏi người dùng về:
# - Mục tiêu dự án
# - Platform target (Android/iOS/Web)
# - Tính năng chính
# - Đối tượng người dùng
# - Timeline dự kiến
```

### 1.2 Phân Tích Thiết Kế (Nếu Có)

```bash
# Kiểm tra thư mục design/ có file thiết kế không
ls design/

# Nếu có design files, sử dụng Appdexer để phân tích
# - Trích xuất tính năng từ design
# - Phân tích user flow
# - Xác định technical requirements
```

## 2. Cấu Hình Project Identity

### 2.1 Cập Nhật .project-identity

```json
{
  "projectName": "[Tên dự án thực tế]",
  "projectType": "[android|ios|flutter|react-native|web]",
  "mainLanguages": [
    "Java",
    "Kotlin", // cho Android
    "Swift",
    "Objective-C", // cho iOS
    "Dart", // cho Flutter
    "JavaScript",
    "TypeScript" // cho React Native/Web
  ],
  "mainFrameworks": ["[Framework chính được sử dụng]"],
  "keyTechnologies": ["[Các công nghệ cụ thể]"],
  "keyFeatures": ["[Danh sách tính năng chính]"]
}
```

### 2.2 Khởi Tạo Project Personality

```bash
# Tạo file .project-personality với tính cách ngẫu nhiên
# Hoặc để AI tự động chọn personality phù hợp
```

## 5. Tạo Project Structure

### 5.1 Tạo Instruction Outline

```bash
# Tạo file Instruction.md chính
touch Instruction.md

# Tạo thư mục instructions cho modules
mkdir -p instructions/{auth,ui,core,api}
```

### 5.2 Cấu Hình Workspace

```bash
# Cập nhật .code-workspace với project specifics
# - Đặt tên workspace
# - Chọn màu sắc phù hợp
# - Thêm emoji đại diện
```

## 6. Database Setup (Nếu Cần)

### 6.1 Tạo Database Schema

```bash
# Tạo file db-schema.sql nếu project cần database
touch db-schema.sql

# Định nghĩa cấu trúc database ban đầu
```

### 6.2 Mockup Data Management

```bash
# Tạo MockupData.md nếu sử dụng dữ liệu giả lập
touch MockupData.md

# Ghi lại tất cả mockup data sử dụng trong dự án
```

## 7. Platform-Specific Setup

### 7.1 Android Project Setup với TDD

```bash
# Tạo cấu trúc Android với TDD structure
mkdir -p src/main/{java,res,assets}
mkdir -p src/main/res/{layout,values,drawable}

# TDD Test Structure cho Android
mkdir -p src/test/java/com/yourpackage/{unit,integration}
mkdir -p src/androidTest/java/com/yourpackage/{ui,e2e}

# Tạo AndroidManifest.xml template
# Tạo build.gradle với TDD dependencies
```

**Android TDD build.gradle Template:**

```kotlin
android {
    testOptions {
        unitTests {
            includeAndroidResources = true
            returnDefaultValues = true
        }
    }
}

dependencies {
    // TDD Dependencies
    testImplementation 'junit:junit:4.13.2'
    testImplementation 'io.mockk:mockk:1.13.4'
    testImplementation 'org.jetbrains.kotlinx:kotlinx-coroutines-test:1.6.4'
    testImplementation 'androidx.arch.core:core-testing:2.2.0'
    testImplementation 'app.cash.turbine:turbine:0.12.1'

    androidTestImplementation 'androidx.compose.ui:ui-test-junit4:$compose_version'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}
```

### 7.2 iOS Project Setup

```bash
# Tạo cấu trúc iOS cơ bản
mkdir -p src/{Views,ViewModels,Models,Services}
mkdir -p src/Resources/{Images,Fonts,Localization}

# Tạo Info.plist template
# Tạo project structure cho Xcode
```

### 7.3 Flutter Project Setup

```bash
# Tạo cấu trúc Flutter
mkdir -p lib/{screens,widgets,models,services,utils}
mkdir -p assets/{images,fonts}

# Tạo pubspec.yaml template
```

### 7.4 React Native Setup

```bash
# Tạo cấu trúc React Native
mkdir -p src/{components,screens,navigation,services,utils}
mkdir -p assets/{images,fonts}

# Tạo package.json template cho RN dependencies
```

## 8. Review Gate V2 Setup - **BẮT BUỘC KHUYẾN NGHỊ**

### 8.1 Tổng Quan Review Gate V2

Review Gate V2 là công cụ tối ưu hóa workflow AI tích hợp sâu với Cursor IDE:

- **📈 Hiệu Quả 5x**: Biến 500 monthly requests thành cảm giác như 2500 requests
- **🔄 Interactive Loop**: AI không kết thúc sớm mà chờ feedback liên tục
- **🎤 Multi-modal**: Hỗ trợ text, voice input, và image upload
- **🛠️ Tool Call Optimization**: Sử dụng hết 25 tool calls trong 1 request

### 8.2 Setup Review Gate V2

**⚡ Quick Setup**: Xem [review-gate-quick-setup.md](review-gate-quick-setup.md) cho hướng dẫn 5 phút

#### 8.2.1 Automatic Setup

```bash
# Chạy script setup tự động
cd /path/to/Base-AI-Project
./scripts/setup-review-gate.sh

# Script sẽ:
# - Cài đặt Python dependencies
# - Setup MCP server tại ~/cursor-extensions/
# - Cấu hình MCP trong Cursor
# - Copy extension VSIX và rules
```

#### 8.2.2 Manual Extension Installation

```bash
# Sau khi chạy script, cần cài extension thủ công:
# 1. Mở Cursor IDE
# 2. Nhấn Cmd+Shift+P
# 3. Gõ "Extensions: Install from VSIX"
# 4. Chọn file: tools/Review-Gate/V2/cursor-extension/review-gate-v2-2.6.3.vsix
# 5. Restart Cursor
```

#### 8.2.3 Verification Test

```bash
# Test 1: Manual popup
# Nhấn Cmd+Shift+R trong Cursor

# Test 2: AI integration test
# Chat với AI: "Use the review_gate_chat tool"

# Test 3: Voice test (macOS)
sox --version  # Kiểm tra SoX đã cài chưa
```

### 8.3 Integration Với Project Workflow

#### 8.3.1 Rule Configuration

**File `.cursor/rules/review-gate-v2.mdc` được tự động áp dụng cho:**

- **Mọi request AI** sẽ kết thúc bằng Review Gate popup
- **Tool optimization** để maximize 25 tool calls per request
- **Multi-modal feedback** cho design review và debugging
- **Project-specific personality** integration

#### 8.3.2 Workflow Enhancement

```markdown
## Standard AI Request Flow với Review Gate V2

1. **Initial Request**: "Tạo authentication system cho Android"
2. **AI Primary Phase**: AI code, analyze, create files
3. **Review Gate Popup**: AI tự động mở popup chờ feedback
4. **Interactive Phase**:
   - Text: "Thêm biometric authentication"
   - Voice: Click mic, nói "Add dark mode support"
   - Image: Upload mockup design
   - Complete: Gõ "TASK_COMPLETE"
5. **Loop**: Tiếp tục until completion
```

### 8.4 Project-Specific Configuration

#### 8.4.1 Documentation Setup

```bash
# Tạo project-specific Review Gate docs
mkdir -p instructions/review-gate/

# Copy templates từ base framework
cp tools/Review-Gate/V2/docs/* instructions/review-gate/
```

#### 8.4.2 Team Training

```markdown
## Team Training Checklist

- [ ] Giải thích lợi ích 5x request efficiency
- [ ] Demo voice input và image upload
- [ ] Practice workflow: request → review → iterate
- [ ] Troubleshooting: Cmd+Shift+R, MCP logs, SoX test
```

### 8.5 Platform-Specific Enhancements

#### 8.5.1 Android Projects

```bash
# Review Gate được tối ưu cho Android workflow:
# - Code review với screenshots của app
# - Voice debugging: "Fix the red error on login screen"
# - Upload wireframes cho UI implementation
# - Iterate through device testing với real photos
```

#### 8.5.2 iOS Projects

```bash
# iOS-specific enhancements:
# - Upload Xcode screenshots cho debugging
# - Voice feedback trong khi test trên device
# - Design system refinement với uploaded mockups
# - Accessibility testing với voice descriptions
```

#### 8.5.3 Web Projects

```bash
# Web development optimization:
# - Upload browser console screenshots
# - Voice feedback cho responsive design
# - Interactive debugging với live screenshots
# - Performance optimization với uploaded metrics
```

### 8.6 Advanced Usage

#### 8.6.1 Complex Feature Development

```markdown
## Example: E-commerce Checkout Flow

1. **Initial**: "Build complete checkout system"
2. **Primary**: AI creates basic structure
3. **Sub-prompt 1**: [Upload wireframe] "Match this design"
4. **Sub-prompt 2**: Voice: "Add PayPal integration"
5. **Sub-prompt 3**: [Upload error screenshot] "Fix this validation"
6. **Sub-prompt 4**: "Add loading states and animations"
7. **Complete**: "TASK_COMPLETE"

Result: Comprehensive feature in 1 request vs 7 separate requests
```

#### 8.6.2 Debug Sessions

```markdown
## Multi-Modal Debugging

- **Visual**: Upload screenshots of bugs
- **Audio**: Describe issues while navigating app
- **Text**: Paste error logs and stack traces
- **Interactive**: Real-time feedback as fixes are applied
```

### 8.7 Performance Guidelines

#### 8.7.1 Request Optimization

- **Maximize tool calls**: Aim for ~20-25 per session
- **Multi-task in review**: Combine related requests in sub-prompts
- **Use images effectively**: Upload comprehensive screenshots
- **Voice for speed**: Quick feedback và direction changes

#### 8.7.2 Monthly Limit Management

```markdown
## 500 Request → 2500 Feel Strategy

- Week 1: ~125 requests (như 625 cảm giác)
- Week 2: ~125 requests (như 625 cảm giác)
- Week 3: ~125 requests (như 625 cảm giác)
- Week 4: ~125 requests (như 625 cảm giác)

Avg: 5 sub-prompts per request × 5x efficiency gain
```

## 9. Test Driven Development (TDD) Setup - **BẮT BUỘC**

### 9.1 TDD Workflow Integration

**Red-Green-Refactor Cycle được tích hợp vào mỗi step của development:**

📋 **Chi tiết TDD Guidelines**: Xem [TDD_Guidelines.md](../TDD_Guidelines.md)

**TDD được tích hợp vào WORKFLOW của từng platform:**

- **_BẮT BUỘC_** viết test trước khi viết bất kỳ production code nào
- **_BẮT BUỘC_** chỉ viết đủ code để test pass
- **_BẮT BUỘC_** refactor sau khi test green
- **_BẮT BUỘC_** commit sau mỗi Red-Green-Refactor cycle hoàn chỉnh
- **_BẮT BUỘC_** có ít nhất 80% test coverage cho core business logic
- **_BẮT BUỘC_** tuân thủ quy trình TDD cụ thể cho từng platform (Android/iOS/Web)

### 9.2 TDD với Review Gate V2

**Kết hợp TDD và Review Gate cho hiệu quả tối đa:**

```markdown
## TDD + Review Gate Workflow

1. **Request**: "Implement user login với TDD"
2. **AI**: Tạo failing test
3. **Review Gate**: "Write minimal code to pass"
4. **AI**: Implement basic passing code
5. **Review Gate**: [Upload test results] "Refactor và optimize"
6. **AI**: Clean code và add more tests
7. **Review Gate**: "TASK_COMPLETE" khi coverage đạt 80%
```

### 9.3 Platform-Specific TDD Integration

#### Android TDD Integration với Android Workflow

- **_BẮT BUỘC_** tạo test package structure cùng lúc khi tạo feature package:

  ```
  ui/features/[feature]/
  ├── presentation/     # Activity, Fragment, Composables
  ├── viewmodel/        # ViewModels
  └── test/            # Unit tests cho feature này
      ├── viewmodel/   # ViewModel tests
      ├── usecase/     # UseCase tests
      └── repository/  # Repository tests
  ```

- **_BẮT BUỘC_** tuân theo TDD workflow cho mỗi component:

  1. **Red**: Viết test fail cho ViewModel/UseCase/Repository
  2. **Green**: Implement minimal code để pass test
  3. **Refactor**: Cleanup code, optimize
  4. **Commit**: Git commit với message "feat: [component] TDD cycle complete"

- **Android TDD Commands**:
  ```bash
  ./gradlew test                    # Run unit tests
  ./gradlew testDebugUnitTest      # Run debug unit tests
  ./gradlew connectedAndroidTest   # Run instrumented tests
  ```

#### iOS TDD Integration với Xcode

- **_BẮT BUỘC_** tạo test target cùng lúc khi tạo feature:

  ```
  YourApp/
  ├── Features/[Feature]/
  │   ├── Views/
  │   ├── ViewModels/
  │   └── Models/
  └── YourAppTests/[Feature]/
      ├── ViewModelTests/
      ├── ModelTests/
      └── ServiceTests/
  ```

- **iOS TDD Commands**:
  ```bash
  # Trong Xcode: Cmd+U
  # Hoặc terminal:
  xcodebuild test -scheme YourApp -sdk iphonesimulator
  ```

#### Web/React TDD Integration

- **_BắT BUỘC_** setup Jest + Testing Library:

  ```bash
  npm install --save-dev jest @testing-library/react @testing-library/jest-dom
  ```

- **Web TDD Commands**:
  ```bash
  npm test              # Run tests once
  npm run test:watch    # Watch mode cho live TDD
  npm run test:coverage # Check coverage
  ```

### 8.3 TDD Template Integration với Project Setup

**Khi tạo feature mới, AI sẽ:**

1. **Tạo test file trước** (Red phase)
2. **Viết failing test** cho expected behavior
3. **Implement minimal code** để test pass (Green phase)
4. **Refactor** code và test nếu cần (Blue phase)
5. **Commit** hoàn chỉnh cycle

**Ví dụ Android TDD Flow:**

```kotlin
// 1. RED - Create failing test first
class UserViewModelTest {
    @Test
    fun `loadUser should emit loading then success state`() {
        // Test sẽ fail vì UserViewModel chưa exist
        val viewModel = UserViewModel(mockUseCase)
        // ... test logic
    }
}

// 2. GREEN - Create minimal UserViewModel to pass test
class UserViewModel(private val useCase: GetUserUseCase) : ViewModel() {
    // Minimal implementation
}

// 3. REFACTOR - Improve implementation while keeping tests green
```

## 9. TDD Integration với Development Workflow

### 9.1 TDD Trong Quy Trình Setup Dự Án

**Khi setup dự án mới:**

1. **Setup test framework** cùng lúc với project setup
2. **Tạo test folder structure** theo cấu trúc được định nghĩa
3. **Configure test commands** cho platform cụ thể
4. **Setup CI/CD** để auto-run tests

**Khi phát triển feature mới:**

1. **Tạo test file trước** khi tạo implementation file
2. **Viết failing test** mô tả expected behavior
3. **Implement minimal code** để test pass
4. **Refactor và optimize** khi cần thiết
5. **Commit complete cycle** với message rõ ràng

### 9.2 TDD Best Practices Theo Platform

**Android:**

- Sử dụng MockK cho Kotlin testing
- Separate unit tests và instrumented tests
- Test ViewModels với TestCoroutineDispatcher
- UI testing với Compose Test Rule

**iOS:**

- Sử dụng XCTest framework
- Mock objects với protocols
- Test async code với XCTestExpectation
- UI testing với XCUITest

**Web/React:**

- Jest + Testing Library combination
- Mock API calls với MSW
- Component testing với React Testing Library
- E2E testing với Cypress/Playwright

### 9.3 TDD Quality Metrics

**Coverage Targets:**

- **Unit Tests**: Minimum 80% cho business logic
- **Integration Tests**: Cover critical user flows
- **UI Tests**: Cover happy paths và error scenarios

**Performance Targets:**

- Unit tests should run < 1 second per test
- Integration tests < 5 seconds per test
- Full test suite < 2 minutes for CI/CD
- 🎯 Test naming conventions
- 🚫 Common TDD anti-patterns to avoid

### 9.2 TDD Training Materials

```markdown
# TDD_Guidelines.md template

## Red Phase

- Write smallest possible failing test
- Test only ONE behavior at a time
- Use descriptive test names: `GIVEN_WHEN_THEN` format

## Green Phase

- Write MINIMAL code to pass test
- Avoid over-engineering
- Hard-code values if needed initially

## Refactor Phase

- Eliminate duplication
- Improve naming
- Extract methods/classes
- Optimize performance
```

## 10. Development Workflow Setup

### 10.1 Development Environment Configuration

```bash
# Cấu hình IDE cho TDD
# VS Code/Cursor settings
echo '{
  "testExplorer.autoRefresh": true,
  "testExplorer.showInExplorer": true,
  "coverage.enableCoverageGutters": true
}' > .vscode/settings.json
```

### 10.2 Git Workflow Integration

```bash
# Cấu hình Git hooks cho TDD
cp scripts/git-hooks/* .git/hooks/
chmod +x .git/hooks/*
```

### 11.2 Test Project Structure

```bash
# Verify project structure phù hợp với platform
# Kiểm tra các file config đã được tạo đúng
# Test build process cơ bản nếu có thể
```

## 12. Documentation và Finalization

### 12.1 Cập Nhật Documentation

```bash
# Cập nhật README.md với thông tin project
# Cập nhật Codebase.md với cấu trúc project
# Tạo các instruction modules chi tiết
```

### 12.2 Final Checklist

- [ ] .project-identity đã được cập nhật đúng
- [ ] .project-personality đã được khởi tạo
- [ ] Review Gate MCP server chạy ổn định
- [ ] Tất cả review gate tools hoạt động
- [ ] Project structure phù hợp với platform
- [ ] Database schema đã được định nghĩa (nếu cần)
- [ ] Mockup data đã được ghi lại (nếu có)
- [ ] Git repository đã được khởi tạo
- [ ] Development environment ready
- [ ] Documentation cơ bản đã hoàn thành

## 13. Troubleshooting

### 13.2 Platform-Specific Issues

```bash
# Android: Check Android SDK path
# iOS: Verify Xcode installation
# Flutter: Check Flutter doctor
# React Native: Verify Node.js và npm
```
