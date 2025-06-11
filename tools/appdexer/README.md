# Appdexer

**Advanced Project Indexing and Design Analysis System with MCP Integration for Cursor IDE**

Appdexer là hệ thống phân tích và đánh chỉ mục dự án tiên tiến, được thiết kế đặc biệt để tích hợp với Cursor IDE thông qua Model Context Protocol (MCP).

## Tính Năng Chính

### 🎨 Design-to-Prompt Workflow

- Phát hiện tự động các file thiết kế (PNG, JPG, PDF, Figma)
- Phân tích thiết kế bằng quy trình 2-agent (Technical + Marketing)
- Tạo instruction module modular từ design files
- Hỗ trợ Design_Analysis.md tự động

### 🧩 Modular Instruction Architecture

- Instruction.md như file outline chính
- Instruction modules chi tiết cho từng tính năng
- Tracking status và progress cho từng module
- Cross-reference system giữa các modules

### 🎤 Voice & AI Integration

- Speech-to-text với Faster-Whisper
- Voice command parsing và processing
- AI context analysis cho project hiện tại
- Voice search và navigation

### 🔧 MCP Tools

- `appdexer_chat` - Chat popup trong Cursor
- `appdexer_design_analysis` - Phân tích design files
- `appdexer_instruction_status` - Tracking workflow status
- `appdexer_voice_search` - Tìm kiếm bằng giọng nói
- `appdexer_ai_analyze_context` - Phân tích AI context

## Cài Đặt

### Prerequisites

```bash
pip install -r requirements.txt
```

### MCP Configuration

Thêm vào MCP settings của Cursor:

```json
{
  "mcpServers": {
    "appdexer": {
      "command": "/path/to/your/venv/bin/python",
      "args": ["/path/to/appdexer/appdexer_mcp.py"],
      "env": {
        "PYTHONPATH": "/path/to/appdexer",
        "PYTHONUNBUFFERED": "1",
        "APPDEXER_MODE": "cursor_integration"
      }
    }
  }
}
```

### Cursor Extension

1. Install extension từ thư mục `cursor-extension/`
2. Reload Cursor IDE
3. Sử dụng `Cmd+Shift+A` để mở Appdexer

## Sử Dụng

### Design-to-Prompt Workflow

1. Đặt file design vào thư mục `design/`
2. Gọi `appdexer_design_analysis` với mode `detailed_analysis`
3. Review Design_Analysis.md được tạo
4. Tạo instruction modules dựa trên analysis

### Instruction Modules

1. Tạo `Instruction.md` làm outline chính
2. Tạo các instruction modules chi tiết
3. Track progress với `appdexer_instruction_status`
4. Cập nhật status khi hoàn thành

### Voice Commands

1. Sử dụng `appdexer_voice_search` để tìm kiếm bằng voice
2. Parse voice commands với `appdexer_parse_voice_command`
3. Analyze context với `appdexer_ai_analyze_context`

## Cấu Trúc Dự Án

```
appdexer/
├── appdexer_mcp.py          # MCP server chính
├── icon_library_integration.py  # Icon library integration
├── Appdexer.mdc             # Cursor rules
├── requirements.txt         # Python dependencies
├── mcp.json                 # MCP configuration
├── cursor-extension/        # Cursor IDE extension
├── ai/                      # AI analysis modules
├── voice/                   # Voice processing modules
├── core/                    # Core functionality
└── config/                  # Configuration files
```

## Phát Triển

### Running Tests

```bash
python test_detection.py
python test_voice_ai.py
```

### Debugging

- Check log files tại `/tmp/appdexer.log` (macOS/Linux)
- Monitor MCP status trong Cursor output panel
- Use Appdexer chat popup để debug real-time

## Migration từ Review Gate V2

Appdexer là phiên bản kế tiếp và thay thế hoàn toàn cho Review Gate V2:

### Thay Đổi Chính

- Tên tool: `review_gate_chat` → `appdexer_chat`
- Keyboard shortcut: `Cmd+Shift+R` → `Cmd+Shift+A`
- Log file: `review_gate_v2.log` → `appdexer.log`
- MCP server name: `review-gate-v2` → `appdexer`

### Backward Compatibility

- Vẫn hỗ trợ `review_gate_chat` tool (deprecated)
- Migration guide có sẵn trong documentation

## Authors

- **Kiên Lê** - Core development & Design
- **Lakshman Turlapati** - MCP integration & Extensions

## License

MIT License - xem file LICENSE để biết thêm chi tiết.

## Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Changelog

### v3.0.0 (Current)

- Migration hoàn toàn từ Review Gate V2
- Thêm Design-to-prompt workflow
- Modular instruction architecture
- Enhanced voice & AI integration
- New MCP tools và commands
