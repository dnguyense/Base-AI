# 📚 Hướng dẫn sử dụng Icon Library API

## Thông tin chung

**Base URL:** `https://icon-library.leejungkiin.workers.dev`

Icon Library API cung cấp một bộ sưu tập phong phú các icon cho các ứng dụng và trang web của bạn. API này cho phép bạn tìm kiếm, lấy thông tin, và sử dụng hàng nghìn icon từ nhiều bộ sưu tập khác nhau.

## 🔑 Các endpoint chính

### 1️⃣ Thông tin API

```bash
GET /
```

Trả về thông tin cơ bản về API, bao gồm danh sách các endpoint có sẵn.

**Ví dụ:**
```bash
curl https://icon-library.leejungkiin.workers.dev
```

**Kết quả:**
```json
{
  "name": "Icon Library API",
  "version": "1.0.0",
  "description": "API phục vụ thư viện icon cho Cursor AI",
  "endpoints": [
    {"path": "/", "method": "GET", "description": "API information"},
    {"path": "/icon-sets", "method": "GET", "description": "Get all icon sets"},
    {"path": "/icon-sets/:id", "method": "GET", "description": "Get details about an icon set"},
    {"path": "/icon-sets/:id/icons", "method": "GET", "description": "Get all icons in a set"},
    {"path": "/icon-sets/:id/icons/:iconId", "method": "GET", "description": "Get details about a specific icon"},
    {"path": "/search", "method": "GET", "description": "Search for icons"},
    {"path": "/suggest", "method": "GET", "description": "Get icon suggestions based on context"}
  ]
}
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

**Kết quả:**
```json
{
  "iconSets": [
    {
      "id": "weather-icons",
      "name": "Weather Icons",
      "description": "Bộ icon thời tiết với hiệu ứng kính mờ",
      "count": 144,
      "categories": ["Frosted Glass Weather 1", "Frosted Glass Weather"],
      "thumbnail": "https://imagedelivery.net/meCI2KDHmnUhVs_SxNm-Og/images/v1"
    },
    // ... các bộ icon khác
  ]
}
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

**Kết quả:**
```json
{
  "query": "cloud",
  "category": "",
  "style": "",
  "total": 42,
  "displayed": 42,
  "results": [
    {
      "id": "cloud-connection",
      "name": "cloud-connection.svg",
      "description": "",
      "category": "Icon Line SVG",
      "url": "https://imagedelivery.net/meCI2KDHmnUhVs_SxNm-Og/f7662d60-fcff-49f8-6be5-f9d753392700/public",
      "width": 24,
      "height": 24,
      "setId": "line-icons",
      "setName": "Line Icons"
    },
    // ... các icon khác
  ]
}
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

## 💡 Mẹo sử dụng hiệu quả

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

## 🛠 Tích hợp vào ứng dụng

### Ví dụ tích hợp với JavaScript

```javascript
async function searchIcons(query) {
  const response = await fetch(`https://icon-library.leejungkiin.workers.dev/search?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  return data.results;
}

// Sử dụng trong ứng dụng
searchIcons('cloud')
  .then(icons => {
    icons.forEach(icon => {
      console.log(`${icon.name}: ${icon.url}`);
      // Tiếp tục xử lý hiển thị icon...
    });
  })
  .catch(error => console.error('Error fetching icons:', error));
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

## ⚠️ Lưu ý quan trọng

1. Tất cả URL trong kết quả đã sẵn sàng để sử dụng và không cần xử lý thêm
2. Các endpoint hỗ trợ CORS, cho phép gọi trực tiếp từ trình duyệt
3. API có giới hạn tỷ lệ (rate limit) để đảm bảo hiệu suất, vui lòng tránh gửi quá nhiều yêu cầu trong thời gian ngắn
4. URL có thể được sử dụng trực tiếp trong thẻ `<img>` hoặc CSS background-image 

## 📋 Cursor Rules API

API này cũng hỗ trợ quản lý các rules cho Cursor AI thông qua các endpoint sau:

### 1️⃣ Lấy danh sách Rules

```bash
GET /rules
```

Trả về danh sách tất cả các rules có sẵn.

**Tham số:**
- `projectType` (không bắt buộc): Lọc rules theo loại dự án (Ví dụ: "nodejs", "flutter", "android")

**Ví dụ:**
```bash
curl https://icon-library.leejungkiin.workers.dev/rules
```

**Kết quả:**
```json
{
  "success": true,
  "rules": [
    {
      "id": "nodejs-rules",
      "name": "nodejs-rules",
      "project_type": "nodejs",
      "updated_at": "2023-10-15T14:32:45.000Z",
      "version": "1.0"
    },
    {
      "id": "flutter-rules",
      "name": "flutter-rules",
      "project_type": "flutter",
      "updated_at": "2023-10-20T09:18:22.000Z",
      "version": "1.0"
    },
    // ... các rules khác
  ]
}
```

### 2️⃣ Lấy nội dung của một rule

```bash
GET /rules/:id
```

Trả về thông tin chi tiết và nội dung của một rule cụ thể.

**Tham số:**
- `id`: ID của rule (Ví dụ: "nodejs-rules", "flutter-rules")

**Ví dụ:**
```bash
curl https://icon-library.leejungkiin.workers.dev/rules/nodejs-rules
```

**Kết quả:**
```json
{
  "id": "nodejs-rules",
  "name": "nodejs-rules",
  "project_type": "nodejs",
  "content": "# Node.js Rules\n\n## Coding Style\n...",
  "updated_at": "2023-10-15T14:32:45.000Z",
  "version": "1.0"
}
```

### 3️⃣ Cập nhật nội dung của một rule

```bash
PUT /rules/:id
```

Cập nhật nội dung của một rule cụ thể.

**Tham số:**
- `id`: ID của rule cần cập nhật
- `content`: Nội dung mới cho rule (trong body của request)

**Ví dụ:**
```bash
curl -X PUT https://icon-library.leejungkiin.workers.dev/rules/nodejs-rules \
  -H "Content-Type: application/json" \
  -d '{"content": "# Node.js Rules\n\n## Updated Coding Style\n..."}'
```

## 🔄 Đồng bộ hóa Rules

API cung cấp chức năng đồng bộ rules giữa local và server:

### Đồng bộ từ local lên server

Rules được lưu trong thư mục `.cursor/rules` trên máy local có thể được đồng bộ lên Supabase database sử dụng công cụ đồng bộ.

**Cấu trúc thư mục:**
```
.cursor/
  rules/
    nodejs-rules.mdc
    flutter-rules.mdc
    android-rules.mdc
    ...
```

**Các lệnh đồng bộ:**
```bash
# Tải rules từ local lên server
npm run rules:upload

# Tải rules từ server về local
npm run rules:download

# Đồng bộ hai chiều (kết hợp cả hai)
npm run rules:sync
```

### Tích hợp Rules vào ứng dụng

```javascript
async function getAllRules() {
  const response = await fetch('https://icon-library.leejungkiin.workers.dev/rules');
  const data = await response.json();
  return data.rules;
}

async function getRuleContent(ruleId) {
  const response = await fetch(`https://icon-library.leejungkiin.workers.dev/rules/${ruleId}`);
  const data = await response.json();
  return data.content;
}
```

## 📁 Cấu hình Rules

API sử dụng các biến môi trường để cấu hình vị trí lưu trữ rules:

- `RULES_DIR`: Đường dẫn đến thư mục chứa rules (mặc định: `$HOME/.cursor/rules`)
- `SUPABASE_URL` và `SUPABASE_KEY`: Thông tin kết nối đến Supabase database (nếu muốn lưu trữ rules trên cloud) 