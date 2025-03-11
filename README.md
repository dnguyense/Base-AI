File để chứa tài liệu hướng dẫn api
#Documentation.md 

Cấu hình Cursor Rule ( add trong IDE ) theo nội dung trong file Cursor_rule.md

## Bước 1: 
Mô tả về ý tưởng project vào Project.md, về cấu trúc mong muốn, giao diện mong muốn, thư viện mong muốn

## Bước 2: 
Yêu cầu AI brainstorm với mình về Project.md để mở rộng ý tưởng

## Bước 3:

- Đối với project mới: Từ kịch bản trong Project.md này hãy thiết kế instruction cho từng phần của ứng dụng, bạn có thể tạo instruction cho các module, mỗi phần sẽ có 1 file instruction .md riêng sau đó được liên kết từ Instruction.md chính. Instruction.md sẽ là outline, để 1 AI sẽ thực hiện lần lượt các phần sao cho thành 1 sản phẩm hoàn chỉnh. Theo logic là mỗi lần thực hiện 1 nhiệm vụ nào đó thì AI sẽ đọc file Instruction.md và truy cập vào các instruction con theo từng nhiệm vụ cụ thể. Các instruction cần chia nhỏ ra từng phần và liên kết với nhau thông qua Instruction.md

- Project cũ: Tôi cần bạn rà soát từng phần của project và tạo thành các instruction md để 1 AI khác có thể hiểu được, sẽ chia nhiều instruction nhỏ và từ instruction chính ( Instruction.md ) sẽ liên kết đến các instruction của từng module. Ngoài ra cũng có instruction về UI, và 1 instruction liệt kê danh sách các resource và thư viện sẵn có. Bạn cần rà soát từng lớp, trước tiên là cấu trúc thư mục, sau đó bạn xem lại Instruction.md để hiểu được cấu trúc của project và tiếp tục rà soát phần tiếp theo.

** Lưu ý **: Cần mô tả về code cho ngôn ngữ gì hay nền tảng gì vào Instruction.md

## Bước 4:

Add file Instruction.md vào và prompt: Hãy code theo hướng dẫn này

## Lưu ý:
- Khi code mà thấy AI sửa lỗi nhiều lần không được ( khoảng 5-6 lần fix mà vẫn lỗi, thì revert về bước trước đó hoặc bản hoàn thiện gần nhất )
- Dùng 3.7 sonnet thinking đối với các bước cần suy luận, còn bình thường không cần thiết vì nó làm chậm quá trình code.
