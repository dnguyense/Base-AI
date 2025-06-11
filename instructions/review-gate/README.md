# Review-Gate V2 Integration

## Overview
Review-Gate V2 được tích hợp vào Base-AI-Project để tối ưu hóa việc sử dụng Cursor AI requests.

## Key Benefits
- **5x Request Efficiency**: Biến 500 monthly requests thành cảm giác như 2500
- **Multi-modal Input**: Text, voice, image support
- **Interactive Loop**: AI chờ feedback thay vì kết thúc sớm
- **Tool Call Optimization**: Sử dụng hết budget tool calls trong 1 request

## Usage
1. Làm việc bình thường với Cursor
2. AI sẽ tự động mở Review-Gate popup khi hoàn thành task chính
3. Sử dụng popup để:
   - Đưa feedback bằng text
   - Upload hình ảnh (screenshots, mockups)
   - Sử dụng voice input (macOS)
   - Type "TASK_COMPLETE" khi hài lòng

## Manual Activation
- Press `Cmd+Shift+R` để mở popup thủ công
- Hoặc yêu cầu AI: "Use the review_gate_chat tool to get my feedback"

## Integration với Base-AI-Project
- Tự động backup trước các thay đổi lớn
- Integrate với project personality
- Tuân thủ file protection rules
- Optimize cho instruction workflow

## Troubleshooting
- Check logs: `tail -f /tmp/review_gate_v2.log`
- Test speech: `sox --version`
- Verify MCP: `cat ~/.cursor/mcp.json`
