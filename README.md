File để chứa tài liệu hướng dẫn api
#API_Documentation.md 

Cấu hình Cursor Rule ( add trong IDE ) theo nội dung trong file Cursor_rule.md

## Bước 1: 
Mô tả về ý tưởng project vào Project.md, về cấu trúc mong muốn, giao diện mong muốn, thư viện mong muốn

## Bước 2: 
=======
### Project mới: 
#### Bước 2.1:
Add Project.md vào context và brainstorm về Project.md để mở rộng ý tưởng
- hãy brainstorm với tôi về ý tưởng này, sao cho mở rộng nhất có thể về tính năng, cung cấp danh sách các gợi ý hoặc câu hỏi động não liên quan để kích thích tư duy sáng tạo và tạo ra nhiều ý tưởng đa dạng. Bao gồm các câu hỏi mở khuyến khích các giải pháp khám phá và đổi mới. Hãy cân nhắc hỏi về những thách thức, cơ hội tiềm ẩn và những cách tiếp cận độc đáo đối với chủ đề này. Nhằm mục đích truyền cảm hứng cho người tham gia để suy nghĩ sáng tạo và đóng góp những hiểu biết sâu sắc độc đáo. Đưa ra nhiều gợi ý khác nhau để phục vụ cho các phong cách và quan điểm tư duy khác nhau.

Sau khi brainstorm xong thì yêu cầu viết vào Instruction.md:
- Từ kịch bản này hãy thiết kế instruction cho ứng dụng vào Instruction.md ở đây sẽ là instruction tổng quan ( outline ) cho ứng dụng, instruction không tạo quá chi tiết, không bao gồm code, sao cho tiết kiệm tối đa token mà một AI khác vẫn có thể hiểu được

#### Bước 2.2:
- Từ Instruction.md này hãy thiết kế instruction cho từng phần của ứng dụng, bạn có thể tạo instruction cho các module, mỗi phần sẽ có 1 file instruction .md riêng sau đó được liên kết từ Instruction.md chính. Instruction.md sẽ là outline, để 1 AI sẽ thực hiện lần lượt các phần sao cho thành 1 sản phẩm hoàn chỉnh. Theo logic là mỗi lần thực hiện 1 nhiệm vụ nào đó thì AI sẽ đọc file Instruction.md và truy cập vào các instruction con theo từng nhiệm vụ cụ thể. Các instruction cần chia nhỏ ra từng phần và liên kết với nhau thông qua Instruction.md

=======
### Đối với project cũ:
- Tôi cần bạn rà soát từng phần của project và tạo thành các instruction md để 1 AI khác có thể hiểu được, sẽ chia nhiều instruction nhỏ và từ instruction chính ( Instruction.md ) sẽ liên kết đến các instruction của từng module. Ngoài ra cũng có instruction về UI, và 1 instruction liệt kê danh sách các resource và thư viện sẵn có. Bạn cần rà soát từng lớp, trước tiên là cấu trúc thư mục, sau đó bạn xem lại Instruction.md để hiểu được cấu trúc của project và tiếp tục rà soát phần tiếp theo.

## Bước 3:
Tạo 1 chat mới với Claude 3.7 và add file Instruction.md 
- Code theo hướng dẫn trong instruction này

** Lưu ý **: Cần mô tả về code cho ngôn ngữ gì hay nền tảng gì vào Instruction.md

## Lưu ý:
- Khi code mà thấy AI sửa lỗi nhiều lần không được ( khoảng 5-6 lần fix mà vẫn lỗi, thì revert về bước trước đó hoặc bản hoàn thiện gần nhất )
- Dùng 3.7 sonnet thinking đối với các bước cần suy luận, còn bình thường không cần thiết vì nó làm chậm quá trình code.
- Đừng tiếc code, nếu thấy bất thường là revert luôn về bước trước đó.
- Luôn sử dụng git
- Nếu biết cần code hoặc sửa file nào hãy add vào context để AI không phải chạy lòng vòng kiếm file
- Khi revert bằng IDE có thể bị ảnh hưởng đến file đã chỉnh sửa khác nếu chạy cùng lúc 2 nhiệm vụ