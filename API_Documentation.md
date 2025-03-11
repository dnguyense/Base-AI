
## API Service
luôn log các thông tin khi request và response để debug, api key của generate và chat khác nhau,
Lưu ý: user ở đây sẽ cố định theo user đăng ký hoặc lưu trữ khi lần đầu cài app, nghĩa là 1 user sẽ có 1 user khác nhau.

#### 1 Generate AI:
```
curl --location 'https://ai.dreamapi.net/v1/workflows/run' \
--header 'accept: application/json, text/plain, */*' \
--header 'accept-language: vi,en-US;q=0.9,en;q=0.8' \
--header 'authorization: Bearer app-KXgXIc3FMFJZzN46kukP7Avs' \
--header 'content-type: application/json' \
--header 'dnt: 1' \
--header 'priority: u=1, i' \
--header 'sec-ch-ua: "Not;A=Brand";v="24", "Chromium";v="128"' \
--header 'sec-ch-ua-mobile: ?0' \
--header 'sec-ch-ua-platform: "macOS"' \
--header 'sec-fetch-dest: empty' \
--header 'sec-fetch-mode: cors' \
--header 'sec-fetch-site: cross-site' \
--header 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36' \
--data '{
    "inputs": {
        "prompt": "Analyze the user'\''s health data and provide a comprehensive health assessment with recommendations",
        "data": "{\"bloodPressure\":[{\"systolic\":143,\"diastolic\":89,\"heart_rate\":89}],\"bloodSugar\":[{\"type\":\"fasting\",\"value\":155}],\"heartRate\":[{\"value\":78}],\"weather\":{\"temp\":21.16,\"humidity\":82,\"description\":\"broken clouds\",\"wind_speed\":2.49,\"main\":\"Clouds\"},\"user\":{\"gender\":\"male\",\"name\":\"Kien\",\"weight\":56,\"location\":\"Đà Lạt, Lâm Đồng\",\"language\":\"English\",\"id\":\"test-user-id\",\"age\":37,\"height\":164},\"bmi\":[{\"weight\":56,\"height\":164,\"bmi\":22.89}]}",
        "base_info": "{\"gender\":\"male\",\"name\":\"Joe\",\"weight\":56,\"location\":\"Đà Lạt, Lâm Đồng\",\"language\":\"English\",\"id\":\"test-user-id\",\"age\":37,\"height\":164}",
        "template": "{\"statusMessage\":\"A short status message about the user'\''s health\",\"assessmentLevel\":\"A brief assessment level\",\"assessmentScore\":\"A numerical score from 1 to 10\",\"healthAnalysis\":\"A detailed paragraph analyzing the user'\''s health\",\"recommendations\":[{\"title\":\"Recommendation title\",\"content\":\"Detailed explanation\"}],\"nutritionalAdvice\":\"Nutritional advice\",\"workoutTips\":\"Exercise advice\"}"
    },
    "response_mode": "blocking",
    "user": "kien-test"
}'
```
**Explanation:**
*   **user**: UUID, a unique identifier for the user.
*   **data**: JSON string containing supplementary data for AI analysis, like specific health metrics or context.
*   **base_info**:  JSON string with the user's personal information.
*   **template**:  JSON string defining the structure of the expected output, allowing flexible and customizable data structures.
**Response example:**
Response generate
```json
{
    "task_id": "356aa4d7-6abc-4739-99c7-741c4ea157a1",
    "workflow_run_id": "b96eaeca-1dc7-43cc-ab26-55d2c2f8f9fd",
    "data": {
        "id": "b96eaeca-1dc7-43cc-ab26-55d2c2f8f9fd",
        "workflow_id": "07fd6afb-2a39-438c-8217-4f80a3592b98",
        "status": "succeeded",
        "outputs": {
            "text": "Món ăn trong hình là một bữa sáng kiểu Anh truyền thống, bao gồm trứng chiên, xúc xích, thịt xông khói, đậu nướng, nấm, cà chua nướng, bánh mì nướng và cà phê. Món ăn này cung cấp nhiều protein và năng lượng, nhưng cũng có thể chứa nhiều chất béo và muối. Để có một chế độ ăn uống cân bằng, bạn nên kết hợp với trái cây và rau quả trong các bữa ăn khác."
        },
        "error": null,
        "elapsed_time": 3.543002313002944,
        "total_tokens": 3292,
        "total_steps": 4,
        "created_at": 1735287486,
        "finished_at": 1735287490
    }
}
```
Response chat:
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
}```

#### 2 Chat AI
```
curl --location 'https://ai.dreamapi.net/v1/chat-messages' \
--header 'Authorization: Bearer app-mrEpeQsGxaEXzpTaUFJOhi4Q' \
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

### 3 generate with file
```
curl --location 'https://ai.dreamapi.net/v1/workflows/run' \
--header 'Authorization: Bearer app-KXgXIc3FMFJZzN46kukP7Avs' \
--header 'Content-Type: application/json' \
--data '{
    "inputs": {
        "prompt":"đây là gì?",
        "data": "{\"health_data\":\"json string\"}",
        "template": "{\"template\":\"json string\"}"
    },
    "files": [{
            "type": "image",
            "transfer_method": "remote_url",
            "url": "https://c.files.bbci.co.uk/3FE8/production/_104706361_1df2aee2-0fb6-4571-ab4a-8caf3505b856.jpg"
        }],
    "response_mode": "blocking",
    "conversation_id": "",
    "user": "abc-123"
}'
```

### 4 chat with file
curl --location 'https://ai.dreamapi.net/v1/chat-messages' \
--header 'Authorization: Bearer app-mrEpeQsGxaEXzpTaUFJOhi4Q' \
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

### 5 upload tmp file
Method: POST
Params: file=/path/to/test.jpg
URL: https://tmpfiles.org/api/v1/upload
