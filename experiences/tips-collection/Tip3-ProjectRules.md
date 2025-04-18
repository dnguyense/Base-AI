# Tip #3: Project Rules Là Game-Changer

> "Không có gì bảo đảm chất lượng dự án tốt hơn một bộ quy tắc được thiết lập từ đầu."

## Tóm Tắt

Project rules không chỉ là danh sách quy tắc khô khan - chúng là nền tảng để team (dù 1 hay nhiều người) làm việc hiệu quả. Rules giúp code nhất quán, giảm conflict, và tăng tốc quá trình phát triển.

## Vấn Đề

Khi bắt đầu dự án, nhiều dev thường nghĩ:

- "Tôi sẽ quyết định sau"
- "Code trước, cleanup sau"
- "Mỗi người một kiểu code cũng không sao"

**Hệ quả**:

- Code không nhất quán
- Conflict khi merge
- Thời gian debug dài hơn
- AI tools khó giúp đỡ vì không có pattern rõ ràng

## Giải Pháp: Thiết Lập Rules Ngay Từ Đầu

### Các Loại Rules Cần Thiết

**1. Styling Rules**

- Chọn một framework CSS (Tailwind, MUI, Chakra...)
- Quy ước đặt tên class/component
- Color scheme và design system
- Responsive breakpoints

**2. API Integration Rules**

- Cấu trúc API calls (Axios, fetch, SWR...)
- Error handling nhất quán
- Caching strategy
- Authentication flow

**3. Code Structure Rules**

- Phân chia folder (feature-based vs type-based)
- Quy tắc đặt tên file và component
- State management approach
- Comment/documentation style

**4. Git Workflow Rules**

- Branch naming convention
- Commit message format
- PR/review process
- Merge strategy

### Quy Trình Thiết Lập Rules

1. **Tạo File Rules Chính**

   - Lưu trong `.cursor/rules/` (cho AI tools)
   - Lưu trong `/docs/` (cho team members)

2. **Đảm Bảo Rules Được Thực Thi**

   - Setup linting tools
   - Pre-commit hooks
   - Code reviews
   - Template files

3. **Cập Nhật Rules Khi Cần**
   - Mỗi khi phát hiện vấn đề mới
   - Sau mỗi sprint review
   - Khi onboard tech mới

## Ví Dụ Thực Tế

**Trước khi có rules** (dự án cá nhân của tôi):

```jsx
// Component A
function Button({ onClick, label }) {
  return (
    <button className="px-4 py-2 bg-blue-500" onClick={onClick}>
      {label}
    </button>
  );
}

// Component B (do tôi code 2 tuần sau)
function SubmitButton({ submitHandler, buttonText }) {
  return (
    <button
      style={{ padding: "8px 16px", backgroundColor: "#3b82f6" }}
      onClick={submitHandler}
    >
      {buttonText}
    </button>
  );
}
```

Kết quả? UI không nhất quán, AI tools gợi ý mâu thuẫn, và tôi tốn thời gian refactor.

**Sau khi có rules**:

```jsx
// Component A
function Button({ onClick, children, variant = "primary" }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

// Component B
function SubmitButton({ onSubmit }) {
  return (
    <Button onClick={onSubmit} variant="submit">
      Submit
    </Button>
  );
}
```

## Tips Áp Dụng

1. **Bắt Đầu Nhỏ, Mở Rộng Sau**

   - 5-7 rules cốt lõi là đủ cho khởi đầu
   - Thêm rules khi có vấn đề mới

2. **Tích Hợp Với AI Tools**

   - Lưu rules trong thư mục `.cursor/rules/`
   - Kích hoạt rules trong conversation với AI

3. **Cân Bằng Giữa Flexibility và Consistency**

   - Rules nên hỗ trợ, không nên cản trở
   - Có cơ chế để override rules khi cần

4. **Tập Trung Rules Vào 20% Case Xuất Hiện 80% Thời Gian**
   - Styling cho core components
   - Error handling cho API calls
   - State management patterns

## Rules Quan Trọng Nhất

1. **Styling**: Sử dụng duy nhất một cách (Tailwind, CSS-in-JS, utility classes...)
2. **API Calls**: Sử dụng wrapper function, xử lý lỗi nhất quán
3. **Component Structure**: Props naming convention, children vs prop pattern
4. **State Management**: Khi nào dùng local vs global state
5. **Error Handling**: Try/catch vs ErrorBoundary

## Lưu Ý Cuối

Rules không phải là giáo điều bất di bất dịch. Chúng cần phát triển cùng dự án. Tuy nhiên, **không có rules** là tệ hơn nhiều so với **rules không hoàn hảo**.

Dành 1 giờ đầu để set up rules = tiết kiệm 20 giờ debug và refactor sau này!
