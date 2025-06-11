# Appdexer Integration

## Overview
Appdexer được tích hợp vào Base-AI-Project để tối ưu hóa việc sử dụng Cursor AI requests và phân tích dự án.

## Key Benefits
- **5x Request Efficiency**: Biến 500 monthly requests thành cảm giá như 2500
- **Multi-modal Input**: Text, voice, image support
- **Interactive Loop**: AI chờ feedback thay vì kết thúc sớm
- **Design Analysis**: Tự động phân tích file design và tạo prompt
- **Tool Call Optimization**: Sử dụng hết budget tool calls trong 1 request

## Usage
1. Làm việc bình thường với Cursor
2. AI sẽ tự động mở Appdexer popup khi hoàn thành task chính
3. Sử dụng popup để:
   - Đưa feedback bằng text
   - Upload hình ảnh (screenshots, mockups)
   - Sử dụng voice input (macOS)
   - Type "TASK_COMPLETE" khi hài lòng

## Manual Activation
- Press `Cmd+Shift+A` để mở popup thủ công
- Hoặc yêu cầu AI: "Use the appdexer_chat tool to get my feedback"

## Design-to-Prompt Workflow
- Tự động detect file design trong thư mục design/
- 2-agent analysis: Technical + Marketing
- Modular instruction với status tracking
- Enhanced voice và AI integration

## Integration với Base-AI-Project
- Tự động backup trước các thay đổi lớn
- Integrate với project personality
- Tuân thủ file protection rules
- Optimize cho instruction workflow

## Troubleshooting
- Check logs: `tail -f /tmp/appdexer.log`
- Test speech: `sox --version`
- Verify MCP: `cat ~/.cursor/mcp.json`
