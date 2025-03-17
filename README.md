# Base AI Project for Cursor

Đây là base project để sử dụng với Cursor - trợ lý AI IDE mạnh mẽ. Dự án này cung cấp cấu trúc chuẩn và các rule AI được tối ưu hóa để làm việc hiệu quả với mọi loại dự án.

Version 1.0.3

# Hướng dẫn chung

Chuẩn bị instruction, đây là giai đoạn quan trọng cần làm chi tiết, vì đây giống như bản thiết kế

1. brainstorm với AI về ý tưởng
1. tạo khung sườn bằng cách tạo instruction từ README ( ý tưởng ) hoặc brainstorm, tham khảo apk nếu có
1. tạo instructions chung cho toàn bộ dự án
1. từ instruction chung yêu cầu AI tạo instruction chi tiết cho từng module
1. tạo các màn hình từ các instruction đã tạo, nếu cần tham khảo apk thì thêm vào
1. tạo logic xử lý giữa các màn hình
1. tạo instructions về quảng cáo và cách sắp xếp quảng cáo, tỷ lệ
1. instruction về các thư viện sử dụng, các resource ( nếu có )

## Lưu ý quan trọng

- Khi AI không sửa được lỗi sau 5-6 lần, revert về bản hoàn thiện gần nhất
- Sử dụng Claude 3.7 Sonnet với chế độ thinking cho các bước cần suy luận phức tạp
- Đừng tiếc code, revert ngay khi thấy bất thường
- Luôn sử dụng git để theo dõi thay đổi
- Add file cần code/sửa vào context để AI làm việc hiệu quả hơn
- Một hội thoại không nên kéo quá dài, thường là hoàn thành một module rồi tạo hội thoại mới
- Khi cần phát triển module liên quan đến các module khác, yêu cầu AI rà soát và tạo file .md mô tả ý tưởng

## Prompt thường dùng

### Project mới

`Từ kịch bản trong README.md này hãy thiết kế instruction cho từng phần của ứng dụng, bạn có thể tạo instruction cho các module, mỗi phần sẽ có 1 file instruction .md riêng sau đó được liên kết từ Instruction.md chính. Instruction.md sẽ là outline, để 1 AI sẽ thực hiện lần lượt các phần sao cho thành 1 sản phẩm hoàn chỉnh. Theo logic là mỗi lần thực hiện 1 nhiệm vụ nào đó thì AI sẽ đọc file Instruction.md và truy cập vào các instruction con theo từng nhiệm vụ cụ thể. Các instruction cần chia nhỏ ra từng phần và liên kết với nhau thông qua Instruction.md`

### Project cũ

`Tôi cần bạn rà soát từng phần của project và tạo thành các instruction md để 1 AI khác có thể hiểu được, sẽ chia nhiều instruction nhỏ và từ instruction chính ( Instruction.md ) sẽ liên kết đến các instruction của từng module. Ngoài ra cũng có instruction về UI, và 1 instruction liệt kê danh sách các resource và thư viện sẵn có. Bạn cần rà soát từng lớp, trước tiên là cấu trúc thư mục, sau đó bạn xem lại Instruction.md để hiểu được cấu trúc của project và tiếp tục rà soát phần tiếp theo.`

### Demo

`Bây giờ tôi cần cập nhật thêm tính năng và giao diện như hình, với icon sử dụng Material Icons, bạn sẽ mô tả instruction tạm gọi là Upgrade instruction md, sau đó link từ instruction chính, hãy rà soát tính năng đang có và mô tả những thứ cần điều chỉnh, những thứ cần thêm. Ngoài ra tôi có bổ sung AI theo như hướng dẫn trong ApiDocument.md bạn hãy rà soát và dựa trên tư duy của developer cho doanh nghiệp thì cần bổ sung tính năng AI gì, kết hợp với các tính năng sẵn có, để đảm bảo giúp cho người dùng nhiều nhất. Bạn cũng có thể học hỏi trong PointInstruction.md để bổ sung tính năng tính point, vì ứng dụng sẽ kiếm tiền chủ yếu nhờ quảng cáo và inapp vậy nên cần tạo 1 Point instruction mới kết hợp các tính năng hiện tại để tối ưu được doanh thu.`

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

- **API_Docs.md**: Mô tả chi tiết các API endpoints, request/response
- **Changelog.md**: Ghi lại lịch sử thay đổi của dự án
- **Codebase.md**: Cung cấp tóm tắt cấu trúc code để AI hiểu nhanh
- **Decisions.md**: Ghi lại các quyết định quan trọng trong quá trình phát triển
- **Diagram.md**: Sơ đồ kết nối giữa các màn hình/component
- **Instruction.md**: Hướng dẫn chính cho toàn bộ dự án
- **Project.md**: Mô tả tổng quan về dự án, mục tiêu và yêu cầu
  trước

# Tùy chỉnh workspace

1. Chỉnh sửa file `Base-AI-Project.code-workspace`:

   - Đổi tên "Base-AI-Project" thành tên dự án của bạn
   - Tùy chỉnh màu sắc theme để phân biệt giữa các dự án

2. Đổi tên file workspace:

```bash
mv Base-AI-Project.code-workspace MyProject.code-workspace
```
