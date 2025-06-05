# Instructions - Development Modules Guide

## Tổng quan

Thư mục này chứa các instruction modules chi tiết cho từng phần của RetroLens AI project. Mỗi file instruction cung cấp đầy đủ thông tin để một AI developer có thể implement module đó một cách độc lập.

## Cấu trúc Instructions

### Phase 1: Core AI Camera Features ✅

Các tính năng AI core cho camera experience:

| Module  | File                                                   | Mô tả                                                       | Status |
| ------- | ------------------------------------------------------ | ----------------------------------------------------------- | ------ |
| **1.1** | [`ai-scene-intelligence.md`](ai-scene-intelligence.md) | Computer vision cho scene analysis và style recommendations | ✅     |
| **1.2** | [`composition-guide.md`](composition-guide.md)         | Real-time visual overlays và composition scoring            | ✅     |
| **1.3** | [`exposure-assistant.md`](exposure-assistant.md)       | Smart exposure adjustment với HDR và face priority          | ✅     |
| **1.4** | [`style-profiles.md`](style-profiles.md)               | Decade-specific retro styles (60s-Y2K)                      | ✅     |
| **1.5** | [`perfect-shot.md`](perfect-shot.md)                   | AI orchestration cho one-tap perfect photography            | ✅     |

### Phase 2: Advanced Features ✅

Enhanced functionality cho power users:

| Module  | File                                       | Mô tả                                                | Status |
| ------- | ------------------------------------------ | ---------------------------------------------------- | ------ |
| **2.1** | [`advanced-editor.md`](advanced-editor.md) | Professional photo editor với vintage focus          | ✅     |
| **2.2** | [`social-sharing.md`](social-sharing.md)   | Multi-platform sharing với optimization và analytics | ✅     |

### Phase 3: UI/UX Design & System Architecture ⏳

Design system và technical architecture:

| Module  | File                                                   | Mô tả                                                   | Status |
| ------- | ------------------------------------------------------ | ------------------------------------------------------- | ------ |
| **3.1** | [`ui-design-system.md`](ui-design-system.md)           | Complete UI/UX design với retro aesthetic và components | ✅     |
| **3.2** | [`database-architecture.md`](database-architecture.md) | Database schema và data models                          | ❌     |
| **3.3** | [`api-architecture.md`](api-architecture.md)           | API design và backend services                          | ❌     |

### Phase 4: Premium & Analytics ❌

Monetization và advanced insights:

| Module  | File                                                 | Mô tả                                   | Status |
| ------- | ---------------------------------------------------- | --------------------------------------- | ------ |
| **4.1** | [`premium-subscription.md`](premium-subscription.md) | Subscription system và premium features | ❌     |
| **4.2** | [`analytics-insights.md`](analytics-insights.md)     | Advanced analytics và user insights     | ❌     |

### Phase 5: Settings & Support ❌

Application settings và user support:

| Module  | File                                                 | Mô tả                            | Status |
| ------- | ---------------------------------------------------- | -------------------------------- | ------ |
| **5.1** | [`settings-preferences.md`](settings-preferences.md) | User settings và app preferences | ❌     |
| **5.2** | [`help-support.md`](help-support.md)                 | Help system và customer support  | ❌     |

## Cấu trúc của mỗi Instruction Module

Mỗi file instruction tuân theo template consistent:

### 1. **User Story**

- Mô tả ngắn gọn từ góc nhìn người dùng
- Định nghĩa value proposition của feature

### 2. **Tổng quan tính năng**

- High-level description của module
- Core functionality và objectives

### 3. **Yêu cầu kỹ thuật**

- **Tech Stack**: Platforms, frameworks, APIs
- **Dependencies**: Required libraries và packages
- **Performance Requirements**: Benchmarks và constraints

### 4. **Yêu cầu chức năng chi tiết**

- Detailed breakdown của features
- Specific capabilities và behaviors
- Edge cases và error handling

### 5. **Components cần triển khai**

- **Classes/Interfaces**: Code structure với method signatures
- **Data Models**: Entity definitions và relationships
- **Algorithms**: Implementation logic và flows

### 6. **UI/UX Implementation**

- User interface specifications
- Interaction patterns và animations
- Visual design guidelines

### 7. **Performance Optimization**

- Memory management strategies
- Processing optimizations
- Caching mechanisms

### 8. **Testing Strategy**

- Unit test specifications
- Integration test scenarios
- Performance benchmarks

### 9. **Acceptance Criteria**

- Clear success metrics
- Functional requirements checklist
- Quality standards

### 10. **Integration Dependencies**

- Required modules và data flows
- API contracts và interfaces
- Coordination requirements

## Cách sử dụng Instructions

### Cho AI Developers

1. **Chọn module** theo roadmap priority
2. **Đọc toàn bộ instruction** để hiểu scope
3. **Follow implementation guide** step-by-step
4. **Validate acceptance criteria** khi hoàn thành
5. **Update module status** trong main Instruction.md

### Cho Project Managers

1. **Review dependencies** giữa modules
2. **Track progress** theo acceptance criteria
3. **Coordinate integration** giữa development teams
4. **Validate deliverables** theo specifications

### Cho QA Teams

1. **Use testing strategies** trong mỗi module
2. **Verify acceptance criteria** compliance
3. **Test integration points** giữa modules
4. **Validate performance benchmarks**

## Module Dependencies

### Dependency Map

```
Phase 1: Core AI Camera
├── AI Scene Intelligence (1.1) → Style Profiles (1.4)
├── Composition Guide (1.2) → Perfect Shot (1.5)
├── Exposure Assistant (1.3) → Perfect Shot (1.5)
├── Style Profiles (1.4) → Perfect Shot (1.5)
└── Perfect Shot (1.5) → Advanced Editor (2.1)

Phase 2: Advanced Features
├── Advanced Editor (2.1) → Social Sharing (2.2)
└── Social Sharing (2.2) → Analytics (3.2)

Phase 3: Premium & Analytics
├── Premium Subscription (3.1) → All modules
└── Analytics & Insights (3.2) → All modules
```

### Critical Integration Points

- **Camera Manager**: Shared across modules 1.1-1.5
- **Style Engine**: Used by modules 1.4, 1.5, 2.1
- **ML Kit Integration**: Required for modules 1.1, 1.2, 1.3
- **Image Processing**: Core for modules 1.5, 2.1
- **Social APIs**: Essential for module 2.2

## Development Guidelines

### Implementation Order

1. **Start với Phase 1** modules (foundational AI features)
2. **Implement dependencies first** (Camera Manager, ML Kit setup)
3. **Build incrementally** và test integration continuously
4. **Validate user experience** trước khi moving to next phase

### Quality Standards

- **Code Coverage**: Minimum 80% test coverage
- **Performance**: Meet all benchmarks trong acceptance criteria
- **Documentation**: Update codebase documentation sau mỗi module
- **Integration**: Verify seamless integration với existing modules

### Best Practices

- **Follow SOLID principles** trong code architecture
- **Implement error handling** theo specifications
- **Optimize for Android performance** (memory, battery, processing)
- **Maintain consistent UI/UX** across all modules
- **Security first** approach cho user data và content

## Support và Resources

### Additional Documentation

- **[../Project.md](../Project.md)**: Overall project architecture
- **[../README.md](../README.md)**: Product blueprint và vision
- **[../Decisions.md](../Decisions.md)**: Important design decisions
- **[../Codebase.md](../Codebase.md)**: Code structure documentation

### Getting Help

- **Technical Issues**: Reference integration dependencies
- **Design Questions**: Check UI/UX implementation sections
- **Performance Problems**: Review optimization guidelines
- **Testing Issues**: Follow testing strategy specifications

---

**Note**: Instruction system được thiết kế để enable independent development của modules với clear integration points. Mỗi module có thể được developed song song với proper coordination.

**Legend**: ✅ Complete | ⏳ In Progress | ❌ Not Started
