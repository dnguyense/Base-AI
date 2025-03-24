# Thư Viện Icon

Thư mục này chứa tất cả các icon được sử dụng trong dự án. Tất cả các icon được tải từ Icon Library API.

## Thông tin chung

**Base URL:** `https://icon-library.leejungkiin.workers.dev`

Icon Library API cung cấp một bộ sưu tập phong phú các icon cho các ứng dụng và trang web của bạn. API này cho phép bạn tìm kiếm, lấy thông tin, và sử dụng hàng nghìn icon từ nhiều bộ sưu tập khác nhau.

## Cấu Trúc Thư Mục

```
assets/icons/
├── ui/                  # Icon giao diện người dùng (buttons, menu, etc.)
├── weather/             # Icon thời tiết
├── social/              # Icon mạng xã hội
└── misc/                # Icon khác
```

## Quy Ước Đặt Tên

- Tất cả file icon đặt tên theo format: `[tên-icon]_[kích-thước].[định-dạng]`
- Ví dụ: `cloud-rain_24.svg`, `arrow-right_16.png`

## Nguồn Gốc & License

Tất cả icon trong thư mục này được tải từ Icon Library API (https://icon-library.leejungkiin.workers.dev).
Chi tiết về license của từng icon được liệt kê dưới đây:

| Icon Set                | License   | Nguồn            | Ngày tải   |
| ----------------------- | --------- | ---------------- | ---------- |
| Weather Icons           | MIT       | Icon Library API | YYYY-MM-DD |
| Line Icons              | CC BY 4.0 | Icon Library API | YYYY-MM-DD |
| (Thêm các bộ icon khác) |           |                  |            |

## Sử Dụng Icon Library API

### 1️⃣ Thông tin API

```bash
GET /
```

Trả về thông tin cơ bản về API, bao gồm danh sách các endpoint có sẵn.

**Ví dụ:**

```bash
curl https://icon-library.leejungkiin.workers.dev
```

### 2️⃣ Danh sách bộ icon

```bash
GET /icon-sets
```

Trả về danh sách tất cả các bộ icon có sẵn trong thư viện.

**Ví dụ:**

```bash
curl https://icon-library.leejungkiin.workers.dev/icon-sets
```

### 3️⃣ Thông tin chi tiết về một bộ icon

```bash
GET /icon-sets/:id
```

Lấy thông tin chi tiết về một bộ icon cụ thể.

**Tham số:**

- `id`: ID của bộ icon (Ví dụ: "weather-icons", "line-icons")

**Ví dụ:**

```bash
curl https://icon-library.leejungkiin.workers.dev/icon-sets/weather-icons
```

### 4️⃣ Danh sách icon trong một bộ

```bash
GET /icon-sets/:id/icons
```

Lấy tất cả các icon trong một bộ icon cụ thể.

**Tham số:**

- `id`: ID của bộ icon (Ví dụ: "weather-icons")
- `limit` (không bắt buộc): Số lượng icon tối đa để trả về (mặc định: 100)
- `offset` (không bắt buộc): Số lượng icon để bỏ qua (để phân trang, mặc định: 0)
- `category` (không bắt buộc): Lọc theo danh mục

**Ví dụ:**

```bash
curl https://icon-library.leejungkiin.workers.dev/icon-sets/weather-icons/icons?limit=20&offset=0
```

### 5️⃣ Thông tin chi tiết về một icon cụ thể

```bash
GET /icon-sets/:id/icons/:iconId
```

Lấy thông tin chi tiết về một icon cụ thể trong một bộ icon.

**Tham số:**

- `id`: ID của bộ icon (Ví dụ: "weather-icons")
- `iconId`: ID của icon

**Ví dụ:**

```bash
curl https://icon-library.leejungkiin.workers.dev/icon-sets/weather-icons/icons/cloudy-day
```

### 6️⃣ Tìm kiếm icon

```bash
GET /search
```

Tìm kiếm các icon dựa trên từ khóa.

**Tham số:**

- `q`: Từ khóa tìm kiếm
- `category` (không bắt buộc): Lọc theo danh mục
- `style` (không bắt buộc): Lọc theo phong cách
- `limit` (không bắt buộc): Số lượng kết quả tối đa để trả về (mặc định: 100)
- `offset` (không bắt buộc): Số lượng kết quả để bỏ qua (để phân trang, mặc định: 0)

**Ví dụ:**

```bash
curl -G --data-urlencode "q=cloud" https://icon-library.leejungkiin.workers.dev/search
```

### 7️⃣ Đề xuất icon theo ngữ cảnh

```bash
GET /suggest
```

Nhận đề xuất icon dựa trên ngữ cảnh được cung cấp.

**Tham số:**

- `context`: Đoạn văn bản mô tả ngữ cảnh sử dụng
- `limit` (không bắt buộc): Số lượng đề xuất tối đa (mặc định: 10)

**Ví dụ:**

```bash
curl -G --data-urlencode "context=weather forecast app" https://icon-library.leejungkiin.workers.dev/suggest
```

## Mẹo sử dụng hiệu quả

1. **Tối ưu hóa tìm kiếm**: Sử dụng các từ khóa cụ thể cho kết quả tốt nhất

   ```bash
   curl -G --data-urlencode "q=sun cloud" https://icon-library.leejungkiin.workers.dev/search
   ```

2. **Phân trang kết quả**: Sử dụng `limit` và `offset` để phân trang khi có nhiều kết quả

   ```bash
   curl https://icon-library.leejungkiin.workers.dev/icon-sets/line-icons/icons?limit=50&offset=100
   ```

3. **Lọc theo danh mục**: Giới hạn kết quả tìm kiếm theo danh mục cụ thể
   ```bash
   curl -G --data-urlencode "q=cloud" --data-urlencode "category=Icon Line SVG" https://icon-library.leejungkiin.workers.dev/search
   ```

## Tích hợp vào ứng dụng

### Ví dụ tích hợp với JavaScript

```javascript
async function searchIcons(query) {
  const response = await fetch(
    `https://icon-library.leejungkiin.workers.dev/search?q=${encodeURIComponent(
      query
    )}`
  );
  const data = await response.json();
  return data.results;
}

// Sử dụng trong ứng dụng
searchIcons("cloud")
  .then((icons) => {
    icons.forEach((icon) => {
      console.log(`${icon.name}: ${icon.url}`);
      // Tiếp tục xử lý hiển thị icon...
    });
  })
  .catch((error) => console.error("Error fetching icons:", error));
```

### Ví dụ tích hợp với cURL/Bash

```bash
#!/bin/bash

API_URL="https://icon-library.leejungkiin.workers.dev"

# Tìm kiếm icon
search_icons() {
  curl -s -G --data-urlencode "q=$1" "$API_URL/search" | jq
}

# Xem danh sách bộ icon
list_icon_sets() {
  curl -s "$API_URL/icon-sets" | jq
}

# Gọi hàm với tham số
search_icons "cloud"
```

## Quy trình tải và sử dụng icon

1. Xác định nhu cầu icon từ instruction/yêu cầu dự án
2. Tìm kiếm icon phù hợp qua Icon Library API:
   ```bash
   curl -G --data-urlencode "q=your_search_term" https://icon-library.leejungkiin.workers.dev/search
   ```
3. Tải icon về thư mục phù hợp trong `assets/icons/`
4. Ghi lại thông tin về icon trong bảng trong file README.md này
5. Sử dụng icon trong code với đường dẫn tương đối

## Sử dụng API Cursor Rules

Icon Library API cũng hỗ trợ quản lý Cursor Rules thông qua:

### 1️⃣ Lấy danh sách Rules

```bash
GET /rules
```

**Tham số:**

- `projectType` (không bắt buộc): Lọc rules theo loại dự án (Ví dụ: "nodejs", "flutter", "android")

**Ví dụ:**

```bash
curl https://icon-library.leejungkiin.workers.dev/rules
```

### 2️⃣ Lấy nội dung của một rule

```bash
GET /rules/:id
```

**Tham số:**

- `id`: ID của rule (Ví dụ: "nodejs-rules", "flutter-rules")

**Ví dụ:**

```bash
curl https://icon-library.leejungkiin.workers.dev/rules/nodejs-rules
```

### 3️⃣ Cập nhật nội dung của một rule

```bash
PUT /rules/:id
```

**Tham số:**

- `id`: ID của rule cần cập nhật
- `content`: Nội dung mới cho rule (trong body của request)

**Ví dụ:**

```bash
curl -X PUT https://icon-library.leejungkiin.workers.dev/rules/nodejs-rules \
  -H "Content-Type: application/json" \
  -d '{"content": "# Node.js Rules\n\n## Updated Coding Style\n..."}'
```

## Đồng bộ hóa Rules

Để đồng bộ rules giữa local và server:

```bash
# Tải rules từ local lên server
npm run rules:upload

# Tải rules từ server về local
npm run rules:download

# Đồng bộ hai chiều (kết hợp cả hai)
npm run rules:sync
```

## Khi cần thay thế icon

1. Backup icon cũ vào thư mục `_backups/icons/`
2. Tải icon mới với tên giống icon cũ
3. Cập nhật bảng nguồn gốc & license

## Lưu ý quan trọng

1. Tất cả URL trong kết quả đã sẵn sàng để sử dụng và không cần xử lý thêm
2. Các endpoint hỗ trợ CORS, cho phép gọi trực tiếp từ trình duyệt
3. API có giới hạn tỷ lệ (rate limit) để đảm bảo hiệu suất, vui lòng tránh gửi quá nhiều yêu cầu trong thời gian ngắn
4. URL có thể được sử dụng trực tiếp trong thẻ `<img>` hoặc CSS background-image

## Liên Hệ

Nếu có vấn đề về việc sử dụng icon, vui lòng liên hệ:

- Email: example@example.com
- Người phụ trách: [Tên người phụ trách]
