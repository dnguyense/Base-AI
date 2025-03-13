# API Service
Luôn log các thông tin khi request và response để debug.

## Chat AI
Sử dụng API chat cho tất cả các tương tác AI. API này hỗ trợ tiếp tục cuộc trò chuyện thông qua conversation_id.

```
curl --location 'https://ai.dreamapi.net/v1/chat-messages' \
--header 'Authorization: Bearer app-rFr7B6vcppZeKTCKLjcPDviE' \
--header 'Content-Type: application/json' \
--data '{
    "query": "Xin chào",
    "user": "user-abb739aa-9bdd-4e08-b9c2-77d82226d36d",
    "conversation_id": "33ab8c1e-4beb-4052-96d3-cde3b693d3a6",
    "response_mode": "blocking",
    "inputs": {
        "data": "{\"health_data\":\"json string\", \"character_id\":\"character_01\"}"
    }
}'
```

**Explanation:**
* **query**: Câu hỏi hoặc yêu cầu của người dùng.
* **user**: UUID, một định danh duy nhất cho người dùng.
* **conversation_id**: ID của cuộc trò chuyện, dùng để tiếp tục cuộc trò chuyện trước đó. Để trống để bắt đầu cuộc trò chuyện mới.
* **response_mode**: "blocking" để chờ phản hồi hoàn chỉnh.
* **inputs**: JSON chứa dữ liệu bổ sung để phân tích AI, như dữ liệu sức khỏe cụ thể hoặc ngữ cảnh.

**Response example:**
```json
{
    "event": "message",
    "task_id": "d7b72f7f-510a-4e7f-b364-f80a48951b85",
    "id": "3630e973-d702-465e-8750-38f93e98e97a",
    "message_id": "3630e973-d702-465e-8750-38f93e98e97a",
    "conversation_id": "83bb686f-104a-45c7-9d10-51c9ce9602af",
    "mode": "advanced-chat",
    "answer": "Đây là một bữa ăn sáng truyền thống kiểu Anh, thường bao gồm trứng chiên, xúc xích, thịt xông khói, đậu nấu sốt cà chua, nấm, cà chua nướng và bánh mì nướng. Bữa ăn này thường đi kèm với một tách cà phê hoặc trà. Nó rất phong phú và đầy đủ dinh dưỡng! 🍳🥓🍅",
    "metadata": {
        "usage": {
            "prompt_tokens": 26865,
            "prompt_unit_price": "0.15",
            "prompt_price_unit": "0.000001",
            "prompt_price": "0.0040298",
            "completion_tokens": 92,
            "completion_unit_price": "0.60",
            "completion_price_unit": "0.000001",
            "completion_price": "0.0000552",
            "total_tokens": 26957,
            "total_price": "0.0040850",
            "currency": "USD",
            "latency": 4.071079017594457
        }
    },
    "created_at": 1735287876
}
```

### Chat với file
```
curl --location 'https://ai.dreamapi.net/v1/chat-messages' \
--header 'Authorization: Bearer app-rFr7B6vcppZeKTCKLjcPDviE' \
--header 'Content-Type: application/json' \
--data '{
    "inputs": {},
    "query": "đây là gì",
    "response_mode": "blocking",
    "conversation_id": "",
    "user": "abc-123",
    "files": [{
            "type": "image",
            "transfer_method": "remote_url",
            "url": "https://c.files.bbci.co.uk/3FE8/production/_104706361_1df2aee2-0fb6-4571-ab4a-8caf3505b856.jpg"
        }]
}'
```

### Upload tệp tạm thời
Method: POST
Params: file=/path/to/test.jpg
URL: https://tmpfiles.org/api/v1/upload
