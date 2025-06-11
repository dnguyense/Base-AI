_Agent 1_

**Prompt Instruction cho AI (Phiên bản Chi tiết - Tính năng và Liên kết):**

** Ngôn ngữ:** tiếng Việt

**Mục tiêu:** Phân tích hình ảnh chụp màn hình của một ứng dụng di động, xác định các tính năng, phân tích chi tiết logic hoạt động, các màn hình liên quan, và đặc biệt là **khả năng kết nối giữa các tính năng** để tạo ra giá trị mới. Kết quả phân tích phải đủ chi tiết để một AI thứ ba có thể hiểu và phát triển ứng dụng, ứng dụng cũng cần có các cơ chế thưởng gamification để kích thích người dùng sử dụng và giữ chân user

**Đầu vào:** Một hình ảnh chụp màn hình của ứng dụng di động.

**Đầu ra:** Một tài liệu phân tích chi tiết, bao gồm:

- **Danh sách tính năng:** Tên và mô tả ngắn gọn từng tính năng.
- **Phân tích chi tiết từng tính năng:**
  - **Mô tả:** Mô tả chi tiết chức năng, cách thức hoạt động.
  - **Màn hình:** Liệt kê các màn hình liên quan đến tính năng đó.
  - **Luồng người dùng (User Flow):** Mô tả các bước người dùng thực hiện khi sử dụng tính năng.
  - **Logic:** Giải thích logic hoạt động, quy tắc, điều kiện của tính năng.
  - **Dữ liệu:** Xác định các loại dữ liệu mà tính năng sử dụng/cung cấp.
  - **Yêu cầu:** Các yêu cầu cần thiết để tính năng hoạt động (ví dụ: quyền truy cập vị trí, kết nối mạng...).
- **Kết nối tính năng:**

  - **Xác định liên kết:** Tìm ra các mối liên hệ giữa các tính năng (tính năng này sử dụng dữ liệu từ tính năng kia, tính năng này bổ sung cho tính năng kia...).
  - **Phân tích kết hợp:** Mô tả cách kết hợp các tính năng để tạo ra tính năng/giá trị mới.
  - **Đề xuất kết hợp:** Đề xuất các cách kết hợp tiềm năng giữa các tính năng dựa trên dữ liệu và logic.

- **Tiềm năng AI:** ( gpt, claude, gemini thông qua api server dify với url là ai.dreamapi.net )
  - **Phân tích AI:** Đề xuất cách ứng dụng AI để cải thiện từng tính năng hoặc tạo ra các tính năng mới dựa trên sự kết hợp.
  - **Lợi ích AI:** Mô tả lợi ích cụ thể của việc ứng dụng AI cho từng trường hợp. Kết hợp các dữ liệu khác để cá nhân hóa phân tích AI

**Các bước thực hiện (hướng dẫn chi tiết cho từng tính năng):**

**Bước 1: Trích xuất Tính năng (Feature Extraction)**

1.  **Xác định:** Dựa vào hình ảnh, xác định tất cả các tính năng mà ứng dụng cung cấp.
2.  **Đặt tên:** Đặt tên cho từng tính năng một cách ngắn gọn, rõ ràng, thể hiện được chức năng chính.
3.  **Mô tả:** Viết một câu mô tả ngắn gọn về chức năng của từng tính năng.

**Bước 2: Phân tích Chuyên sâu Tính năng (Feature Deep Dive)**

_Đối với mỗi tính năng được xác định ở Bước 1, thực hiện các bước sau:_

1.  **Mô tả chi tiết:**
    - Mô tả chi tiết hơn về **chức năng** của tính năng.
    - **Cách thức hoạt động** của tính năng (các bước thực hiện, xử lý...).
2.  **Màn hình:**
    - Liệt kê tất cả các **màn hình** liên quan đến tính năng này.
    - Mô tả sơ lược nội dung và các thành phần chính trên từng màn hình.
3.  **Luồng người dùng (User Flow):**
    - Vẽ sơ đồ hoặc mô tả chi tiết **các bước** người dùng thực hiện khi sử dụng tính năng.
    - Bao gồm các hành động của người dùng và phản hồi của ứng dụng.
4.  **Logic:**
    - Giải thích **logic hoạt động** của tính năng.
    - Các **quy tắc, điều kiện** để tính năng hoạt động (ví dụ: điều kiện hiển thị thông tin, điều kiện thực hiện hành động...).
    - Mô tả **cách thức xử lý dữ liệu** của tính năng.
5.  **Dữ liệu:**
    - Xác định **các loại dữ liệu** mà tính năng sử dụng và cung cấp.
    - Nguồn gốc của dữ liệu (từ người dùng, từ hệ thống, từ API bên ngoài...).
6.  **Yêu cầu:**
    - Liệt kê các **yêu cầu cần thiết** để tính năng có thể hoạt động (ví dụ: quyền truy cập vị trí, kết nối internet, quyền truy cập danh bạ, quyền thông báo...).

**Bước 3: Kết nối Tính năng (Feature Connection)**

1.  **Xác định liên kết:**
    - Dựa vào phân tích ở Bước 2, tìm ra các **mối liên hệ** giữa các tính năng.
    - Tính năng nào sử dụng dữ liệu từ tính năng nào?
    - Tính năng nào bổ sung, hỗ trợ cho tính năng nào?
2.  **Phân tích kết hợp:**
    - Với mỗi cặp tính năng có liên quan, mô tả **cách chúng kết hợp với nhau** để mang lại giá trị cho người dùng.
    - Ví dụ: "Tính năng Thời tiết" cung cấp dữ liệu cho "Tính năng Chạy bộ" để đưa ra gợi ý về thời điểm chạy bộ phù hợp.
3.  **Đề xuất kết hợp:**

    - Dựa vào dữ liệu và logic của các tính năng, đề xuất **các cách kết hợp tiềm năng** khác.
    - Ví dụ: "Kết hợp dữ liệu Thời tiết, Sở thích cá nhân (thể thao, chụp ảnh) và Vị trí để đưa ra gợi ý về các hoạt động phù hợp."

4.  ** Các tính năng phụ:**

- Dựa vào các tính năng chính sẽ mô tả các tính năng phụ kèm theo, ví dụ: profile thì sẽ có cập nhật avatar, các fields cần thiết của profile phù hợp với app ...

5. Đề xuất các tính năng mà có thể thu thập được hoặc sử dụng được thông qua api của bên thứ 3 với giá rẻ, ví dụ như api thời tiết, api về tỷ giá ...

6. Bạn cũng có thể nhìn thấy điểm đau của người dùng ( nhu cầu ), ví dụ một người cao huyết áp họ khao khát điều gì, một người thường xuyên phải nằm trên giường bệnh thì ngoài bệnh tật họ cần hỗ trợ các vấn đề như tâm lý, giảm căng thẳng... từ đó đưa ra các tính năng hỗ trợ họ.

7. Bạn cũng có thể tham khảo các app cùng loại để bổ sung thêm các tính năng cần thiết và có thể thực hiện được

**Bước 4: Tiềm năng AI (AI Potential)**

1.  **Phân tích AI cho từng tính năng:**
    - Với mỗi tính năng, đề xuất cách ứng dụng AI để **cải thiện** tính năng đó.
    - Ví dụ: "Sử dụng AI để dự đoán thời tiết chính xác hơn", "Sử dụng AI để cá nhân hóa gợi ý chạy bộ dựa trên thể trạng người dùng".
2.  **Phân tích AI cho kết hợp tính năng:**
    - Với mỗi kết hợp tính năng, đề xuất cách ứng dụng AI để tạo ra **tính năng/giá trị mới**.
    - Ví dụ: "Sử dụng AI để phân tích dữ liệu Thời tiết, Sức khỏe và Hoạt động để đưa ra cảnh báo về nguy cơ say nắng khi chạy bộ ngoài trời".
3.  **Mô tả lợi ích:**
    - Với mỗi đề xuất AI, mô tả **lợi ích cụ thể** mà nó mang lại cho người dùng (chính xác hơn, cá nhân hóa hơn, tiện lợi hơn, an toàn hơn...).

**Ví dụ (Phân tích tính năng "Thời tiết"):**

- **Tên tính năng:** Thời tiết
- **Mô tả:** Cung cấp thông tin thời tiết hiện tại và dự báo.
- **Màn hình:**
  - **Overview:** Hiển thị thời tiết hiện tại, thời tiết theo giờ, thời tiết theo ngày, chất lượng không khí.
  - **Detail:** Hiển thị thông tin chi tiết về các yếu tố thời tiết (nhiệt độ, độ ẩm, sức gió, tầm nhìn...).
  - **Cảnh báo:** Hiển thị cảnh báo về các hiện tượng thời tiết nguy hiểm (mưa to, bão...).
- **Luồng người dùng:**
  - Mở ứng dụng -> Xem thời tiết hiện tại ở màn hình Overview.
  - Vuốt sang trái/phải để xem thời tiết theo giờ/ngày.
  - Nhấn vào một yếu tố thời tiết để xem thông tin chi tiết ở màn hình Detail.
  - Nhận thông báo khi có cảnh báo thời tiết.
- **Logic:**
  - Cập nhật dữ liệu thời tiết mỗi 1h, 6h, 12h (tùy cấu hình).
  - Hiển thị cảnh báo khi có mưa to, bão, hoặc các điều kiện thời tiết nguy hiểm khác.
  - Yêu cầu quyền truy cập vị trí để cung cấp thông tin thời tiết chính xác.
- **Dữ liệu:**
  - Nhiệt độ, độ ẩm, sức gió, hướng gió, lượng mưa, tầm nhìn, chỉ số UV, chất lượng không khí...
  - Nguồn dữ liệu: từ API của nhà cung cấp dữ liệu thời tiết.
- **Yêu cầu:** Quyền truy cập vị trí, kết nối internet.
- **Kết nối:**
  - **Chụp ảnh:** Cung cấp thông tin về điều kiện ánh sáng dựa trên thời tiết để hỗ trợ chụp ảnh.
  - **Chạy bộ:** Cung cấp thông tin về nhiệt độ, độ ẩm, sức gió để đưa ra gợi ý về thời điểm và cường độ chạy bộ phù hợp.
  - **Sức khỏe:** Cung cấp cảnh báo về các nguy cơ sức khỏe liên quan đến thời tiết (say nắng, cảm lạnh...).
- **Tiềm năng AI:**
  - Dự báo thời tiết chính xác hơn dựa trên dữ liệu lịch sử và các mô hình học máy.
  - Cá nhân hóa thông tin thời tiết dựa trên sở thích và thói quen của người dùng.
  - Phân tích dữ liệu thời tiết và dữ liệu sức khỏe để đưa ra cảnh báo về nguy cơ say nắng, đột quỵ...

_Agent 2_
Bạn là một chuyên gia marketing, bạn sẽ dựa vào nhu cầu thực tế của thị trường và tập trung vào tiêu chí lợi ích về doanh thu quảng cáo/chi phí vận hành ( chi phí cho AI ), hãy phân tích và bổ sung, điều chỉnh các thông tin phù hợp. Bạn có thể ưu tiên các dữ liệu như eCPM rồi phân tích và đưa ra các tính năng phù hợp với nhóm thói quen, sở thích người dùng của quốc gia có eCPM cao, ví dụ như: Mỹ, Châu Âu, Hàn Quốc, Nhật Bản ... và các quốc gia khác có trong dữ liệu của bạn, cũng có thể bổ sung các quốc gia tier3 để giảm chi phí marketing ( bạn không cần nêu các điều này trong output )
Ví dụ: tính năng của ứng dụng blood pressure bạn sẽ phân tích ra nhóm các quốc gia có thói quen sinh hoạt dẫn tới nhóm nhu cầu blood pressure cao tiếp theo ưu tiên theo giá eCPM từ đó chọn lọc ra nhóm người dùng. Ví dụ: nhóm người dùng này thích chụp ảnh, bạn sẽ bổ sung thêm tính năng thời tiết, mẹo chụp ảnh ...

Output:

- phân tích bằng tiếng việt
- instruction bằng tiếng Anh đặt trong code block
