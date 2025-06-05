# **JOURNAL QUYẾT ĐỊNH DỰ ÁN VINTAGEVIBE iOS**

## **2024-12-19: Chuyển đổi Platform sang iOS và Rebranding**

### **Quyết định:** Chuyển đổi từ Android/NodeJS sang iOS Native

- **Lý do:**
  - iOS có ecosystem mạnh mẽ hơn cho computer vision và CoreML
  - Target user (Maya - Content Creator) chủ yếu sử dụng iPhone cho content creation
  - iOS có performance tốt hơn cho real-time image processing
  - App Store có monetization potential cao hơn cho premium features

### **Quyết định:** Rebranding từ "RetroLens AI" thành "VintageVibe"

- **Lý do:**
  - Tên ngắn gọn, dễ nhớ hơn
  - "Vibe" phù hợp với target audience Gen Z/Millennials
  - Tránh confusion với các app có tên "Lens"
  - Domain và trademark availability tốt hơn

### **Tech Stack Đã Chọn:**

- **Frontend:** SwiftUI (thay vì UIKit) cho modern, declarative UI
- **Backend:** Supabase iOS SDK (thay vì Node.js backend)
- **AI/ML:** CoreML + Vision Framework (thay vì cloud APIs)
- **Camera:** AVFoundation (native iOS camera framework)
- **Image Processing:** CoreImage + Metal Performance Shaders
- **Package Management:** Swift Package Manager primary, CocoaPods secondary

### **Architecture Decisions:**

- **MVVM Pattern** với SwiftUI để separation of concerns rõ ràng
- **On-device AI Processing** ưu tiên thay vì cloud để reduce latency
- **Modular Architecture** với từng feature là separate module
- **Repository Pattern** cho data layer abstraction

### **Deployment Target:** iOS 17.0+

- **Lý do:**
  - Tận dụng latest CoreML và Vision improvements
  - Target audience sử dụng iPhone đời mới
  - SwiftUI features mới nhất
  - Giảm complexity support older iOS versions

## **2024-12-19: Cấu Trúc Project Setup**

### **Folder Structure:**

```
VintageVibe/
├── Sources/           # Core business logic
├── Views/            # SwiftUI views
├── ViewModels/       # MVVM view models
├── Services/         # API và data services
├── ML Models/        # CoreML models
├── Resources/        # Assets, fonts, etc
└── Assets.xcassets/  # App icons, images
```

### **Development Workflow:**

- **Xcode 15.0+** primary IDE
- **Cursor IDE** for documentation và instruction editing
- **Git workflow** với feature branches
- **TestFlight** cho beta testing

### **Dependencies Strategy:**

- **Minimal external dependencies** để reduce app size
- **Prefer iOS native frameworks** over third-party
- **CocoaPods for legacy** dependencies if needed
- **Swift Package Manager** as primary package manager

## **Previous Decisions Archive**

# Quyết định thiết kế

Tài liệu này ghi lại các quyết định thiết kế quan trọng trong dự án. Mỗi quyết định bao gồm ngày, vấn đề, các phương án được xem xét, phương án được chọn và lý do.

## 1. Quản lý Database Trong Dự Án - 2024-05-15

### Vấn đề

Dự án cần một cách thức quản lý database hiệu quả, tránh tình trạng tạo nhiều database trùng lặp hoặc thừa thãi, đồng thời đảm bảo việc theo dõi cấu trúc database được nhất quán.

### Phương án được xem xét

1. **Phương án A: Quản lý riêng lẻ**:

   - Ưu điểm: Linh hoạt, mỗi team có thể tự tạo và quản lý database riêng
   - Nhược điểm: Dễ dẫn đến trùng lặp, khó kiểm soát, thiếu nhất quán

2. **Phương án B: Sử dụng ORM tự động migrations**:

   - Ưu điểm: Tự động hóa cao, dễ theo dõi thay đổi
   - Nhược điểm: Phức tạp khi cần tích hợp với hệ thống hiện có, yêu cầu cài đặt framework

3. **Phương án C: Tập trung tất cả schema vào file db-schema.sql**:
   - Ưu điểm: Dễ theo dõi, kiểm soát tập trung, rõ ràng
   - Nhược điểm: Có thể trở nên lớn theo thời gian, cần quy trình để đảm bảo cập nhật

### Quyết định

**Phương án được chọn**: Phương án C - Tập trung tất cả schema vào file db-schema.sql

### Lý do

Phương án C được chọn vì:

- Tạo ra một nguồn thông tin duy nhất về cấu trúc database trong dự án
- Giúp các thành viên team dễ dàng xem xét và hiểu cấu trúc hiện tại
- Đơn giản, không yêu cầu framework hay công cụ phức tạp
- Dễ dàng tích hợp vào quy trình làm việc hiện tại
- Giúp tránh tình trạng tạo database trùng lặp

### Tác động

- Mọi developer phải tuân thủ quy trình kiểm tra db-schema.sql trước khi tạo database mới
- Cần cập nhật file db-schema.sql sau mỗi thay đổi cấu trúc database
- Giảm thiểu được số lượng database thừa thãi
- Tạo ra tài liệu rõ ràng về cấu trúc database cho toàn dự án

## 2. Áp Dụng Cấu Trúc Tài Liệu "6 Docs" - 2024-05-24

### Vấn đề

Dự án cần một cách tiếp cận có cấu trúc hơn để tạo tài liệu hiệu quả, đặc biệt khi làm việc với AI như Cursor, nhằm giảm thiểu AI hallucination và tăng cường hiệu quả phát triển.

### Phương án được xem xét

1. **Phương án A: Tiếp tục sử dụng cấu trúc tài liệu hiện tại**:

   - Ưu điểm: Quen thuộc, không cần thay đổi quy trình hiện tại
   - Nhược điểm: Tài liệu phân tán, thiếu cấu trúc rõ ràng, không tối ưu cho AI

2. **Phương án B: Sử dụng cấu trúc DDD (Domain-Driven Design) cho tài liệu**:

   - Ưu điểm: Tập trung vào domain, phù hợp với các dự án phức tạp
   - Nhược điểm: Có thể quá phức tạp cho các dự án nhỏ, khó triển khai nhất quán

3. **Phương án C: Áp dụng cấu trúc "6 Docs"**:
   - Ưu điểm: Được thiết kế đặc biệt để làm việc với AI, giảm hallucination, cấu trúc rõ ràng từ tổng quan đến chi tiết
   - Nhược điểm: Yêu cầu thời gian ban đầu để tạo đủ 6 tài liệu, cần đào tạo team về cấu trúc mới

### Quyết định

**Phương án được chọn**: Phương án C - Áp dụng cấu trúc "6 Docs"

### Lý do

Phương án C được chọn vì:

- Cấu trúc "6 Docs" được thiết kế đặc biệt để giảm thiểu AI hallucination
- Cung cấp framework rõ ràng cho việc tạo tài liệu: từ PRD → App Flow → Tech Stack → Frontend/Backend → Implementation
- Phù hợp với quy trình phát triển dự án từ ý tưởng đến triển khai
- Tối ưu cho việc làm việc với Cursor và các AI coding assistants khác
- Dễ dàng theo dõi tiến độ và trạng thái dự án

### Tác động

- Tạo thư mục docs/ để lưu trữ các tài liệu theo cấu trúc mới
- Phát triển templates cho 6 tài liệu chính
- Cập nhật quy trình làm việc để bao gồm việc tạo và duy trì các tài liệu này
- Tạo hướng dẫn chuyển đổi cho các dự án hiện có
- Nâng cấp phiên bản lên 2.0.0 để phản ánh thay đổi quan trọng này

## 3. Áp Dụng Tính Cách Ngẫu Nhiên Cho Dự Án - 2024-05-25

### Vấn đề

Khi làm việc với nhiều dự án, người dùng cần một cách nhanh chóng để phân biệt và nhận diện các dự án khi lướt qua lịch sử hội thoại. Ngoài ra, việc làm việc với AI có thể trở nên đơn điệu theo thời gian.

### Phương án được xem xét

1. **Phương án A: Sử dụng màu sắc hoặc icon khác nhau**:

   - Ưu điểm: Nhận diện trực quan, dễ triển khai
   - Nhược điểm: Chỉ tác động đến giao diện, không tạo trải nghiệm tương tác khác biệt

2. **Phương án B: Tạo theme riêng cho mỗi dự án**:

   - Ưu điểm: Nhận diện mạnh mẽ thông qua giao diện
   - Nhược điểm: Phức tạp để triển khai, tập trung vào thay đổi giao diện không phải trải nghiệm

3. **Phương án C: Gán tính cách ngẫu nhiên cho AI trong mỗi dự án**:
   - Ưu điểm: Tạo trải nghiệm thú vị, giúp nhận diện dự án qua giọng điệu, không ảnh hưởng đến chất lượng code
   - Nhược điểm: Có thể gây phân tâm nếu tính cách quá mạnh, cần cân bằng giữa tính chuyên nghiệp và thú vị

### Quyết định

**Phương án được chọn**: Phương án C - Gán tính cách ngẫu nhiên cho AI trong mỗi dự án

### Lý do

Phương án C được chọn vì:

- Tạo trải nghiệm làm việc thú vị và giảm sự đơn điệu khi tương tác với AI
- Giúp dễ dàng nhận diện dự án khi lướt qua các cuộc hội thoại
- Không ảnh hưởng đến chất lượng code hoặc tài liệu, chỉ ảnh hưởng đến giọng điệu trong hội thoại
- Cho phép người dùng thay đổi tính cách nếu không phù hợp
- Trọng số cao cho tính cách "Tuổi Teen" đáp ứng yêu cầu của người dùng

### Tác động

- Tạo file project-personality-generator.mdc để quản lý các tính cách
- Cập nhật quy trình tạo dự án và nâng cấp dự án để bao gồm bước chọn tính cách
- Lưu trữ tính cách được chọn trong file `.project-personality` để duy trì nhất quán
- Điều chỉnh cách AI tương tác trong các cuộc hội thoại dựa trên tính cách được chọn
- Người dùng có thể yêu cầu thay đổi tính cách nếu muốn

## 4. Tích Hợp DALL-E Để Tạo Ảnh Vector - 2024-05-30

### Vấn đề

Dự án cần một cách tiếp cận thống nhất để tạo ra và quản lý tài nguyên hình ảnh, đặc biệt là icon và vector art, nhằm đảm bảo tính nhất quán và hiệu quả trong quy trình thiết kế.

### Phương án được xem xét

1. **Phương án A: Sử dụng thư viện icon có sẵn**:

   - Ưu điểm: Nhanh chóng, không cần phát triển, nhiều lựa chọn có sẵn
   - Nhược điểm: Thiếu tính cá nhân hóa, chi phí licenses, phụ thuộc vào nhà cung cấp

2. **Phương án B: Thuê designer tạo từng icon/illustration**:

   - Ưu điểm: Chất lượng cao, kiểm soát hoàn toàn về phong cách
   - Nhược điểm: Chi phí cao, thời gian chờ đợi lâu, khó điều chỉnh nhanh

3. **Phương án C: Tích hợp DALL-E để tạo ảnh và chuyển đổi sang vector**:
   - Ưu điểm: Tạo nhanh chóng, chi phí hợp lý, linh hoạt trong điều chỉnh, tính nhất quán cao
   - Nhược điểm: Cần tinh chỉnh prompt, kết quả có thể không hoàn hảo, cần xử lý sau khi tạo

### Quyết định

**Phương án được chọn**: Phương án C - Tích hợp DALL-E để tạo ảnh và chuyển đổi sang vector

### Lý do

Phương án C được chọn vì:

- Cho phép tạo nhanh chóng các tài nguyên hình ảnh mà không cần chờ đợi designer
- Chi phí hợp lý hơn so với thuê designer cho từng asset
- Quy trình có thể tự động hóa bằng scripts, giúp quản lý tập trung
- Dễ dàng tạo biến thể và điều chỉnh dựa trên feedback
- Đảm bảo tính nhất quán về phong cách giữa các tài nguyên
- Tận dụng công nghệ AI hiện đại để tăng hiệu quả làm việc

### Tác động

- Phát triển bộ scripts để tạo và xử lý ảnh với DALL-E API
- Thiết lập cấu trúc thư mục chuẩn để lưu trữ và quản lý tài nguyên
- Tạo quy định và hướng dẫn sử dụng DALL-E trong dự án
- Bổ sung quy trình "Tạo ảnh" và "Sửa ảnh" vào các workflow
- Tạo thư viện icon và illustration nhất quán cho dự án
- Tiết kiệm thời gian và chi phí trong quá trình phát triển UI

## Memory Bank System - 2024-05-XX

### Tổng Quan

Quyết định triển khai Memory Bank System để theo dõi tiến độ công việc giữa các tin nhắn trong cùng một cuộc trò chuyện. Hệ thống này được thiết kế để bổ sung cho Experience System hiện có.

### Lý Do

- AI thường gặp khó khăn trong việc theo dõi tiến độ công việc giữa nhiều lần tương tác trong một cuộc trò chuyện
- Người dùng muốn biết chính xác những gì đã hoàn thành và còn phải làm
- Experience System tập trung vào lưu trữ kinh nghiệm dài hạn, không phải theo dõi tiến độ ngắn hạn
- Cần một cơ chế để đảm bảo không bỏ sót nhiệm vụ nào trong quá trình làm việc

### Giải Pháp

- Tạo thư mục `memory_bank/` để lưu trữ trạng thái công việc theo từng workflow
- AI tự động tạo, đọc và cập nhật file memory bank trong cả quá trình trò chuyện
- Sử dụng định dạng markdown có cấu trúc rõ ràng với các phần: Nhiệm vụ hiện tại, Kế hoạch, Các bước thực hiện, Việc đã hoàn thành, Việc chưa hoàn thành
- Tích hợp với Experience System để lưu trữ những kinh nghiệm có giá trị sau khi hoàn thành workflow

## 5. Áp Dụng AI Product Builder Workflow - 2024-01-XX

### Vấn đề

Cần một quy trình chặt chẽ để xây dựng sản phẩm phần mềm từ ý tưởng ban đầu, đặc biệt dành cho những người không biết lập trình. Quy trình hiện tại thiếu cấu trúc và AI có thể bỏ qua các bước quan trọng như brainstorm và planning.

### Phương án được xem xét

1. **Phương án A: Quy trình linh hoạt với AI tự quyết định**:

   - Ưu điểm: Nhanh chóng, linh hoạt, không ràng buộc strict
   - Nhược điểm: Có thể bỏ qua các bước quan trọng, chất lượng không ổn định, khó kiểm soát

2. **Phương án B: Quy trình có cấu trúc nhưng không bắt buộc**:

   - Ưu điểm: Cân bằng giữa cấu trúc và linh hoạt
   - Nhược điểm: Vẫn có thể bỏ qua các bước, không đảm bảo chất lượng đầu ra

3. **Phương án C: Quy trình bắt buộc 3 giai đoạn với validation nghiêm ngặt**:
   - Ưu điểm: Đảm bảo chất lượng, không bỏ qua bước nào, phù hợp cho non-technical users
   - Nhược điểm: Có thể chậm hơn, yêu cầu discipline cao

### Quyết định

**Phương án được chọn**: Phương án C - Quy trình bắt buộc 3 giai đoạn với validation nghiêm ngặt

### Lý do

Phương án C được chọn vì:

- **Target audience là non-technical users**: Cần guidance mạnh mẽ và cấu trúc rõ ràng
- **Chất lượng sản phẩm cuối**: Quy trình nghiêm ngặt đảm bảo sản phẩm hoàn chỉnh và có thể sử dụng được
- **Giảm thiểu rủi ro**: Validation ở mỗi bước giảm nguy cơ phải làm lại từ đầu
- **AI chủ động hỏi**: Đảm bảo thu thập đầy đủ thông tin cần thiết
- **Scalability**: Quy trình có thể áp dụng cho các loại sản phẩm khác nhau

### Cấu Trúc Quy Trình

#### Giai Đoạn 1: BRAINSTORM (3 cấp độ)

1. **Foundation**: AI hỏi 5 câu hỏi cốt lõi về ý tưởng
2. **Structure**: AI hỏi 6 câu hỏi về features và cấu trúc
3. **Advanced Analysis**: AI tự động research competitors + 5 câu hỏi business

#### Giai Đoạn 2: PLANNING

- **Prerequisites**: Brainstorm hoàn chỉnh ✅
- **Output**: Planning\_[TenDuAn].md với 3 development phases
- **Validation**: Architecture, timeline, budget approval

#### Giai Đoạn 3: DEVELOPMENT

- **Prerequisites**: Planning approved ✅
- **Phases**: MVP → Enhanced → Advanced
- **Control**: Chỉ cho phép development theo phase hiện tại

### Tác động

#### Technical Implementation

- Tạo 3 rules files mới:
  - `brainstorm-workflow.mdc` - Controls brainstorm process
  - `planning-validation-rules.mdc` - Validates planning prerequisites
  - `development-control-rules.mdc` - Controls development phases
- Tất cả rules đều set `alwaysApply: true` để enforcement nghiêm ngặt

#### File Dependencies

- `Brainstorm_[TenDuAn].md` → Required trước khi planning
- `Planning_[TenDuAn].md` → Required trước khi development
- Progressive validation ở mỗi bước

#### AI Behavior Changes

- AI **_BẮT BUỘC_** kiểm tra file dependencies trước mỗi action
- AI **_BẮT BUỘC_** hỏi từng câu một trong brainstorm, không hỏi hàng loạt
- AI **_BẮT BUỘC_** thực hiện competitor research tự động
- AI **_NGHIÊM CẤM_** bỏ qua validation steps

#### Error Handling

- Clear error messages khi thiếu prerequisites
- Guidance cụ thể về bước tiếp theo cần thực hiện
- Status tracking rõ ràng cho từng phase

### Kết Quả Mong Đợi

#### For Non-Technical Users

- Có thể tạo sản phẩm phần mềm professional mà không cần biết code
- Hiểu rõ quy trình và requirements của sản phẩm
- Có documentation đầy đủ và planning chi tiết

#### For Product Quality

- Sản phẩm match với market needs thông qua competitor research
- Architecture được thiết kế cẩn thận trước khi implement
- Risk assessment và mitigation strategies được xác định từ đầu

#### For Development Process

- Code follows best practices và architectural decisions
- Progress tracking chính xác và transparent
- Phased development đảm bảo working product ở mỗi milestone

### Tác Động

- Cải thiện khả năng theo dõi tiến độ công việc của AI
- Giảm thiểu việc bỏ sót nhiệm vụ
- Tăng tính minh bạch trong quá trình làm việc
- Tạo cầu nối giữa quá trình làm việc ngắn hạn và lưu trữ kinh nghiệm dài hạn

### Phương Án Khác Đã Xem Xét

- **Mở rộng Experience System**: Quá phức tạp và không phù hợp với mục đích theo dõi tiến độ ngắn hạn
- **Lưu trữ trạng thái trong biến conversation**: Không bền vững và dễ mất thông tin
- **Sử dụng hệ thống bên ngoài**: Tăng độ phức tạp và phụ thuộc
