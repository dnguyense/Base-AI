# Base AI Project for Cursor

Đây là base project để sử dụng với Cursor - trợ lý AI IDE mạnh mẽ. Dự án này cung cấp cấu trúc chuẩn và các rule AI được tối ưu hóa để làm việc hiệu quả với mọi loại dự án.

## Cấu trúc dự án

```
Base-AI-Project/
├── .cursor/
│   └── rules/
│       ├── base-rules.mdc      # Rule cơ bản cho tất cả dự án
│       ├── javascript-rules.mdc # Rule cho JS/TS/React/Vue/Angular...
│       ├── python-rules.mdc    # Rule cho Python/Django/Flask/ML...
│       ├── mobile-rules.mdc    # Rule cho React Native/Flutter/Swift/Kotlin
│       └── backend-rules.mdc   # Rule cho phát triển backend
├── API_Documentation.md        # Tài liệu API của dự án
├── Changelog.md                # Ghi lại các thay đổi của dự án
├── Codebase.md                 # Tóm tắt cấu trúc code cho AI hiểu
├── Decisions.md                # Ghi lại các quyết định quan trọng
├── Diagram.md                  # Sơ đồ kết nối giữa các màn hình
├── Help.md                     # Hướng dẫn trợ giúp
├── Instruction.md              # Hướng dẫn chính cho dự án
├── Project.md                  # Mô tả tổng quan về dự án
├── README.md                   # File này
└── Base-AI-Project.code-workspace # Cấu hình VS Code workspace
```

## Cách sử dụng

### 1. Cài đặt Cursor

Tải và cài đặt [Cursor](https://cursor.sh/) từ trang chủ.

### 2. Sử dụng base project

1. Clone repo này vào máy của bạn:
```bash
git clone https://github.com/yourusername/Base-AI-Project.git my-new-project
cd my-new-project
```

2. Xóa thư mục .git và khởi tạo repository mới:
```bash
rm -rf .git
git init
```

3. Mở dự án với Cursor:
```bash
cursor .
```

### 3. Tùy chỉnh workspace

1. Chỉnh sửa file `Base-AI-Project.code-workspace`:
   - Đổi tên "Base-AI-Project" thành tên dự án của bạn
   - Tùy chỉnh màu sắc theme để phân biệt giữa các dự án

2. Đổi tên file workspace:
```bash
mv Base-AI-Project.code-workspace MyProject.code-workspace
```

## Quy trình làm việc được đề xuất

### Bước 1: Xác định ý tưởng dự án
Mô tả ý tưởng dự án, cấu trúc, giao diện và thư viện mong muốn vào `Project.md`.

### Bước 2: Brainstorming và tạo hướng dẫn
- **Dự án mới**: 
  1. Add `Project.md` vào context và brainstorm để mở rộng ý tưởng
  2. Từ kết quả brainstorm, tạo instruction tổng quan vào `Instruction.md`
  3. Thiết kế instruction chi tiết cho từng phần, mỗi phần có file riêng và liên kết từ `Instruction.md`

- **Dự án hiện có**:
  Rà soát từng phần của dự án và tạo các instruction để AI khác có thể hiểu được cấu trúc dự án.

### Bước 3: Phát triển dự án
Tạo chat mới với Claude 3.7 và add file `Instruction.md` để bắt đầu code theo hướng dẫn.

## Các rules Cursor

Project sử dụng hệ thống rule mới của Cursor, lưu trong thư mục `.cursor/rules`:

1. **base-rules.mdc**: Các rule chung cho mọi dự án
2. **javascript-rules.mdc**: Rule cho các dự án JavaScript/TypeScript
3. **python-rules.mdc**: Rule cho các dự án Python
4. **mobile-rules.mdc**: Rule cho phát triển ứng dụng di động
5. **backend-rules.mdc**: Rule cho phát triển backend

## Giải thích file key

- **API_Documentation.md**: Mô tả chi tiết các API endpoints, request/response
- **Changelog.md**: Ghi lại lịch sử thay đổi của dự án
- **Codebase.md**: Cung cấp tóm tắt cấu trúc code để AI hiểu nhanh
- **Decisions.md**: Ghi lại các quyết định quan trọng trong quá trình phát triển
- **Diagram.md**: Sơ đồ kết nối giữa các màn hình/component
- **Instruction.md**: Hướng dẫn chính cho toàn bộ dự án
- **Project.md**: Mô tả tổng quan về dự án, mục tiêu và yêu cầu

## Lưu ý quan trọng

- Khi AI không sửa được lỗi sau 5-6 lần, revert về bản hoàn thiện gần nhất
- Sử dụng Claude 3.7 Sonnet với chế độ thinking cho các bước cần suy luận phức tạp
- Đừng tiếc code, revert ngay khi thấy bất thường
- Luôn sử dụng git để theo dõi thay đổi
- Add file cần code/sửa vào context để AI làm việc hiệu quả hơn
- Một hội thoại không nên kéo quá dài, thường là hoàn thành một module rồi tạo hội thoại mới
- Khi cần phát triển module liên quan đến các module khác, yêu cầu AI rà soát và tạo file .md mô tả ý tưởng trước

## Các quy tắc dành cho AI

- Sử dụng tiếng Việt cho giao tiếp và giải thích
- Sử dụng tiếng Anh cho code và tài liệu kỹ thuật
- Tóm tắt các class đã hoàn thiện vào `Codebase.md`
- Không tự ý tối ưu hoặc xóa code khi không được yêu cầu
- Dừng ngay nếu không sửa được lỗi sau 3 lần cố gắng

## Prompt
### Project mới
```Từ kịch bản trong README.md này hãy thiết kế instruction cho từng phần của ứng dụng, bạn có thể tạo instruction cho các module, mỗi phần sẽ có 1 file instruction .md riêng sau đó được liên kết từ Instruction.md chính. Instruction.md sẽ là outline, để 1 AI sẽ thực hiện lần lượt các phần sao cho thành 1 sản phẩm hoàn chỉnh. Theo logic là mỗi lần thực hiện 1 nhiệm vụ nào đó thì AI sẽ đọc file Instruction.md và truy cập vào các instruction con theo từng nhiệm vụ cụ thể. Các instruction cần chia nhỏ ra từng phần và liên kết với nhau thông qua Instruction.md```

### Project cũ
```Tôi cần bạn rà soát từng phần của project và tạo thành các instruction md để 1 AI khác có thể hiểu được, sẽ chia nhiều instruction nhỏ và từ instruction chính ( Instruction.md ) sẽ liên kết đến các instruction của từng module. Ngoài ra cũng có instruction về UI, và 1 instruction liệt kê danh sách các resource và thư viện sẵn có. Bạn cần rà soát từng lớp, trước tiên là cấu trúc thư mục, sau đó bạn xem lại Instruction.md để hiểu được cấu trúc của project và tiếp tục rà soát phần tiếp theo.```

### Demo
```Bây giờ tôi cần cập nhật thêm tính năng và giao diện như hình, với icon sử dụng Material Icons, bạn sẽ mô tả instruction tạm gọi là Upgrade instruction md, sau đó link từ instruction chính, hãy rà soát tính năng đang có và mô tả những thứ cần điều chỉnh, những thứ cần thêm. Ngoài ra tôi có bổ sung AI theo như hướng dẫn trong ApiDocument.md bạn hãy rà soát và dựa trên tư duy của developer cho doanh nghiệp thì cần bổ sung tính năng AI gì, kết hợp với các tính năng sẵn có, để đảm bảo giúp cho người dùng nhiều nhất. Bạn cũng có thể học hỏi trong PointInstruction.md để bổ sung tính năng tính point, vì ứng dụng sẽ kiếm tiền chủ yếu nhờ quảng cáo và inapp vậy nên cần tạo 1 Point instruction mới kết hợp các tính năng hiện tại để tối ưu được doanh thu.```
