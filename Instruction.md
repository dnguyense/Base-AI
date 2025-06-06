# VintageVibe iOS - Hướng dẫn phát triển chính

## Tổng quan dự án

VintageVibe là ứng dụng camera iOS thông minh sử dụng AI để giúp người dùng tạo ra những bức ảnh retro chất lượng chuyên nghiệp. Ứng dụng kết hợp Computer Vision, CoreML và SwiftUI để mang lại trải nghiệm chụp ảnh vintage hoàn hảo trên iOS.

**Slogan**: "Capture Yesterday's Soul with Tomorrow's Intelligence"

## Cài đặt môi trường phát triển

1. **iOS Development Environment**:

   - Xcode 15.0+ với iOS 17.0+ SDK
   - Swift 5.9+
   - SwiftUI framework
   - macOS Sonoma 14.0+ (recommended)

2. **AI/ML Dependencies**:

   - CoreML framework cho on-device AI processing
   - Vision framework cho computer vision
   - AVFoundation cho camera functionality
   - CoreImage cho real-time image processing
   - Metal Performance Shaders cho GPU acceleration

3. **Backend & Cloud Services**:

   - Supabase iOS SDK cho authentication và database
   - CloudKit cho iCloud sync (optional)
   - Core Data cho local storage

4. **Package Management**:

   - Swift Package Manager (preferred)
   - CocoaPods support cho legacy dependencies

5. **Khởi động dự án**:
   ```bash
   git clone [repository]
   cd VintageVibe-iOS
   open VintageVibe.xcodeproj
   # Hoặc nếu dùng SPM:
   swift package resolve
   ```

## Architecture Overview

Dự án được chia thành các module chính:

- **Core AI Features**: Computer Vision và CoreML processing
- **Camera Module**: AVFoundation-based camera với real-time preview
- **Filter Engine**: CoreImage và Metal shaders cho effects
- **UI Components**: SwiftUI views và custom camera controls
- **Data Layer**: Core Data + Supabase integration
- **Social Features**: ShareSheet và social platform integrations

## Modules phát triển (theo thứ tự ưu tiên)

### Phase 1: Core AI Camera Features ✅

- [1.1 - AI Scene Intelligence](instructions/ai-scene-intelligence.md) ✅
- [1.2 - Real-time Composition Guide](instructions/composition-guide.md) ✅
- [1.3 - Smart Exposure Assistant](instructions/exposure-assistant.md) ✅
- [1.4 - Decade-Specific Style Profiles](instructions/style-profiles.md) ✅
- [1.5 - One-Tap Perfect Shot](instructions/perfect-shot.md) ✅

### Phase 2: Advanced Features ✅

- [2.1 - Advanced Photo Editor](instructions/advanced-editor.md) ✅
- [2.2 - Social Sharing Hub](instructions/social-sharing.md) ✅

### Phase 3: UI/UX Design & System Architecture ⏳

- [3.1 - UI Design System](instructions/ui-design-system.md) ✅
- [3.2 - Database Architecture](instructions/database-architecture.md) ❌
- [3.3 - API Architecture](instructions/api-architecture.md) ❌

### Phase 4: Premium & Analytics ❌

- [4.1 - Premium Subscription System](instructions/premium-subscription.md) ❌
- [4.2 - Advanced Analytics & Insights](instructions/analytics-insights.md) ❌

### Phase 5: Settings & Support ❌

- [5.1 - Settings & Preferences](instructions/settings-preferences.md) ❌
- [5.2 - Help & Support System](instructions/help-support.md) ❌

## Tình trạng dự án hiện tại

### ✅ Hoàn thành: Instruction System Design

Đã thiết kế chi tiết instruction cho 7 modules chính:

**Phase 1 - Core AI Camera (5 modules):**

- AI Scene Intelligence: Computer vision và ML recommendations
- Real-time Composition Guide: Visual overlays và scoring system
- Smart Exposure Assistant: Auto-exposure với HDR và face priority
- Decade-Specific Style Profiles: 60s-Y2K styles với real-time preview
- One-Tap Perfect Shot: AI orchestration cho perfect photos

**Phase 2 - Advanced Features (2 modules):**

- Advanced Photo Editor: Professional editing với vintage focus
- Social Sharing Hub: Multi-platform sharing với optimization

**Phase 3 - UI/UX Design (1 module):**

- UI Design System: Complete interface design với retro aesthetic và component system

Mỗi instruction module bao gồm:

- ✅ User stories và technical requirements
- ✅ Detailed component architecture
- ✅ Code examples và implementation guides
- ✅ Performance criteria và testing strategies
- ✅ Integration dependencies

### 🎯 Sẵn sàng cho Implementation Phase

Toàn bộ instruction system đã hoàn thiện và ready cho development team!

## Quy trình làm việc

1. **Chọn module** từ danh sách theo thứ tự ưu tiên
2. **Đọc instruction chi tiết** của module đó
3. **Đánh dấu ⏳** khi bắt đầu triển khai
4. **Tuân thủ acceptance criteria** trong instruction
5. **Kiểm tra integration** với các modules khác
6. **Đánh dấu ✅** khi hoàn thành
7. **Cập nhật** Changelog.md và Codebase.md

## Tài liệu tham khảo

- [Project.md](Project.md): Tổng quan kiến trúc và tech stack
- [Decisions.md](Decisions.md): Các quyết định thiết kế quan trọng
- [Codebase.md](Codebase.md): Cấu trúc code và components
- [MockupData.md](MockupData.md): Dữ liệu giả lập cho development
- [README.md](README.md): Product Blueprint chi tiết

## Success Metrics

- **Photo Success Rate**: >75% ảnh được giữ lại sau lần chụp đầu
- **Daily Active Sessions**: 2.5 sessions/user/day
- **Feature Adoption Rate**: >60% sử dụng AI guidance
- **Time to Great Shot**: <3 phút từ mở app đến ảnh hài lòng
- **User Retention (Week 4)**: >45%
- **Premium Conversion**: >12%

## Legend

- ✅ Completed
- ⏳ In Progress
- ❌ Not Started
