# Tip #4: Xử Lý Lỗi - Chìa Khóa Đánh Giá Code Chất Lượng

> "Code không phải được đánh giá bởi nó hoạt động tốt thế nào, mà bởi nó thất bại 'đẹp' ra sao."

## Tóm Tắt

Xử lý lỗi là một trong những khía cạnh quan trọng nhất nhưng thường bị bỏ qua trong phát triển phần mềm. Một hệ thống xử lý lỗi tốt không chỉ ngăn chặn crash, mà còn cung cấp thông tin chính xác để debug và trải nghiệm người dùng tốt hơn.

## Vấn Đề

Nhiều dự án có các vấn đề phổ biến về xử lý lỗi:

- **Bỏ qua lỗi**: `try/catch` rỗng hoặc chỉ có `console.error`
- **Thông báo lỗi mơ hồ**: "Đã xảy ra lỗi, vui lòng thử lại"
- **Xử lý lỗi không nhất quán**: Mỗi dev một kiểu xử lý
- **Thiếu logging**: Không có thông tin để debug khi lỗi xảy ra
- **Lỗi "im lặng"**: Lỗi xảy ra nhưng không ai biết

## Giải Pháp: Chiến Lược Xử Lý Lỗi Toàn Diện

### 1. Phân Loại Lỗi Theo Mức Độ

**Operational Errors** (Lỗi vận hành)

- Network failures
- Database timeout
- File không tìm thấy
- Input người dùng không hợp lệ

**Programmer Errors** (Lỗi lập trình)

- Null/undefined references
- Type errors
- Logic errors
- Memory leaks

**System Errors** (Lỗi hệ thống)

- Out of memory
- Server overload
- Infrastructure failures

### 2. Hierarchy Xử Lý Lỗi

1. **Cấp Component**: Xử lý lỗi UI cụ thể
2. **Cấp Feature**: Xử lý lỗi business logic
3. **Cấp App**: Xử lý lỗi global, fallback UI
4. **Cấp Server**: Logging, monitoring, alerting

### 3. Pattern Xử Lý Lỗi Hiệu Quả

#### Frontend

```jsx
// Bad practice
const fetchData = async () => {
  try {
    const res = await api.get("/data");
    setData(res.data);
  } catch (err) {
    console.error(err);
    // Người dùng không biết đã xảy ra lỗi!
  }
};

// Good practice
const fetchData = async () => {
  try {
    setLoading(true);
    const res = await api.get("/data");
    setData(res.data);
  } catch (err) {
    const errorMessage = getErrorMessage(err); // Hàm helper để xử lý nhất quán
    setError(errorMessage);
    logError("DATA_FETCH_FAILED", err); // Logging service
  } finally {
    setLoading(false);
  }
};
```

#### Backend

```javascript
// Bad practice
app.post("/api/user", (req, res) => {
  try {
    const user = createUser(req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Good practice
app.post("/api/user", async (req, res) => {
  try {
    const { email, name } = validateUserInput(req.body);
    const user = await createUser({ email, name });
    logger.info("User created", { userId: user.id });
    res.json(user);
  } catch (err) {
    if (err instanceof ValidationError) {
      logger.warn("Validation failed", {
        payload: req.body,
        error: err.message,
      });
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: err.message,
        details: err.details,
      });
    }

    if (err instanceof DuplicateError) {
      return res.status(409).json({
        code: "DUPLICATE_USER",
        message: "User already exists",
      });
    }

    logger.error("Failed to create user", { error: err });
    res.status(500).json({
      code: "SERVER_ERROR",
      message: "Something went wrong",
      requestId: req.id, // ID để tra cứu logs
    });
  }
});
```

### 4. Error Monitoring & Logging

**Thông Tin Cần Log**

- Timestamp
- Error type/code
- Stack trace
- User context (user ID, session ID)
- System context (version, environment)
- Request information (payload, headers)

**Tools**

- Backend: Winston, Pino, Bunyan
- Frontend: Sentry, LogRocket, TrackJS
- Monitoring: Datadog, New Relic, Prometheus

### 5. User-Friendly Error Messages

**Quy Tắc**

- Ngôn ngữ thân thiện, không technical jargon
- Giải thích ngắn gọn vấn đề
- Gợi ý cách khắc phục
- Không đổ lỗi cho người dùng
- Cung cấp reference code để support

```jsx
// Component hiển thị lỗi
const ErrorMessage = ({ error, onRetry }) => {
  return (
    <div className="error-container">
      <h3>Rất tiếc, đã xảy ra sự cố</h3>
      <p>{getReadableErrorMessage(error.code)}</p>
      {error.canRetry && <button onClick={onRetry}>Thử lại</button>}
      <small>Mã tham chiếu: {error.referenceId}</small>
    </div>
  );
};
```

## Chiến Lược Implementation

### 1. Tạo Error Helper Library

```javascript
// errors.js
export class AppError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends AppError {
  constructor(message, details) {
    super("VALIDATION_ERROR", message, details);
  }
}

export class NetworkError extends AppError {
  constructor(message, details) {
    super("NETWORK_ERROR", message, details);
    this.canRetry = true;
  }
}

// Hàm chuyển đổi technical error thành user-friendly message
export const getReadableErrorMessage = (errorCode) => {
  const messages = {
    NETWORK_ERROR:
      "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.",
    VALIDATION_ERROR: "Thông tin bạn nhập không hợp lệ. Vui lòng kiểm tra lại.",
    UNAUTHORIZED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    SERVER_ERROR:
      "Đã xảy ra lỗi trong hệ thống. Chúng tôi đang khắc phục sự cố này.",
    // ...
  };

  return messages[errorCode] || "Đã xảy ra lỗi không xác định.";
};
```

### 2. Global Error Boundary (React example)

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}
```

### 3. API Wrapper

```javascript
// apiClient.js
import axios from "axios";
import { NetworkError, ServerError, ValidationError } from "./errors";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      throw new NetworkError("Network request failed");
    }

    const { status, data } = error.response;

    if (status === 400) {
      throw new ValidationError(data.message, data.details);
    }

    if (status === 401) {
      // Refresh token or redirect to login
    }

    throw new ServerError(
      data.code || "SERVER_ERROR",
      data.message || "Unexpected server error",
      { status, data, requestId: data.requestId }
    );
  }
);

export default api;
```

## Lợi Ích Của Xử Lý Lỗi Tốt

1. **Cải Thiện UX**: Người dùng hiểu vấn đề và biết cách khắc phục
2. **Debug Nhanh Hơn**: Thông tin đầy đủ giúp tìm ra lỗi nhanh chóng
3. **Giảm Downtime**: Phát hiện và sửa lỗi trước khi ảnh hưởng nhiều
4. **Code Ổn Định**: Dự án đối phó tốt với các tình huống không mong muốn
5. **Tái Sử Dụng**: Pattern xử lý lỗi có thể dùng cho nhiều dự án

## Kết Luận

Xử lý lỗi không phải là "tính năng thêm" mà là yếu tố cốt lõi của mọi ứng dụng. Đầu tư thời gian vào việc thiết kế hệ thống xử lý lỗi tốt sẽ tiết kiệm hàng chục giờ debug và hỗ trợ khách hàng sau này.

Nhớ rằng: "Exceptional code handles exceptions exceptionally well!"
