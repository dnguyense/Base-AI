# Review Gate V2 - Quick Setup Guide

## 🚀 Quick Setup (5 phút)

### 1. Automatic Setup

```bash
# Clone hoặc cd vào Base-AI-Project
cd /path/to/Base-AI-Project

# Chạy script setup
./scripts/setup-review-gate.sh

# Output mong đợi:
# ✅ Python 3 found
# ✅ SoX installed (macOS)
# ✅ Python dependencies installed
# ✅ MCP server setup complete
# ✅ MCP configuration updated
```

### 2. Manual Extension Install (**BẮT BUỘC**)

```bash
# Script không thể tự động cài extension, cần làm thủ công:

# 1. Mở Cursor IDE
# 2. Nhấn Cmd+Shift+P (macOS) hoặc Ctrl+Shift+P (Windows/Linux)
# 3. Gõ: "Extensions: Install from VSIX"
# 4. Navigate và chọn file:
#    tools/Review-Gate/V2/cursor-extension/review-gate-v2-2.6.3.vsix
# 5. Restart Cursor hoàn toàn (quit and reopen)
```

### 3. Verification (30 giây)

```bash
# Test 1: Manual popup trigger
# Trong Cursor, nhấn: Cmd+Shift+R
# → Review Gate popup sẽ xuất hiện

# Test 2: AI integration
# Chat với AI: "Use the review_gate_chat tool"
# → AI sẽ mở popup và chờ input

# Test 3: Voice functionality (macOS only)
sox --version
# → Hiển thị version of SoX nếu installed correctly
```

## 📋 Quick Reference

### Keyboard Shortcuts

- **Cmd+Shift+R**: Mở Review Gate popup thủ công
- **Cmd+,**: Mở Cursor Settings (để check rules)
- **F12**: Developer tools (troubleshooting)

### Completion Commands

Type trong popup để kết thúc session:

- `TASK_COMPLETE`
- `Done`
- `Quit`
- `q`

### File Locations

```bash
# MCP Server
~/cursor-extensions/review-gate-v2/

# MCP Configuration
~/.cursor/mcp.json

# Extension VSIX
tools/Review-Gate/V2/cursor-extension/review-gate-v2-2.6.3.vsix

# Project Rules
.cursor/rules/review-gate-v2.mdc

# Logs (if issues)
/tmp/review_gate_v2.log
```

## 🔧 Troubleshooting (1 phút fixes)

### Issue: Popup không xuất hiện

```bash
# 1. Check extension installed
# Cursor → Extensions → Search "review-gate"
# Should show installed extension

# 2. Check MCP config
cat ~/.cursor/mcp.json
# Should contain "review-gate-v2" server

# 3. Restart Cursor completely
# Quit và open lại, không chỉ reload window

# 4. Test manual trigger
# Cmd+Shift+R
```

### Issue: Voice input không hoạt động

```bash
# macOS only - check SoX
sox --version

# If not installed:
brew install sox

# Test recording:
sox -d -r 16000 -c 1 test.wav trim 0 3 && rm test.wav
# Should record 3 seconds without error
```

### Issue: MCP Server lỗi

```bash
# Check server manually
cd ~/cursor-extensions/review-gate-v2
python3 review_gate_v2_mcp.py --version

# Check dependencies
python3 -c "import fastapi, uvicorn, subprocess; print('Dependencies OK')"

# Reinstall if needed
pip3 install fastapi uvicorn
```

### Issue: Extension lỗi

```bash
# Uninstall và reinstall extension
# 1. Cursor → Extensions → Review Gate V2 → Uninstall
# 2. Restart Cursor
# 3. Install lại từ VSIX
# 4. Restart Cursor again
```

## 💡 Usage Tips

### Efficient Workflow

```markdown
1. **Big Request**: "Build complete authentication system"
2. **Let AI Work**: Primary implementation phase
3. **Review Gate Opens**: Popup appears automatically
4. **Iterate**:
   - Text: "Add password validation"
   - Voice: "Make the UI look nicer"
   - Image: Upload mockup for reference
5. **Complete**: "TASK_COMPLETE"

Result: 1 request thay vì 5+ separate requests
```

### Voice Input Best Practices

- **Nói rõ ràng** và với tốc độ bình thường
- **Pause** giữa các concepts quan trọng
- **2-3 giây** is optimal recording length
- **English** works better cho technical terms

### Image Upload Tips

- **Screenshots** of bugs/errors
- **Wireframes** và mockups cho UI
- **Console outputs** for debugging
- **Before/after** comparisons

## 🎯 Expected Benefits

### Request Efficiency

```markdown
## Before Review Gate V2

- Authentication: 1 request
- Add validation: 1 request
- UI improvements: 1 request
- Bug fixes: 2 requests
- Polish: 1 request
  Total: 6 requests

## With Review Gate V2

- Initial: "Build auth with Review Gate"
- All refinements trong 1 popup session
  Total: 1 request (feels like 6 separate ones)

Monthly 500 limit → Feels like 2500-3000
```

### Quality Improvements

- **Context preservation** throughout iteration
- **Multi-modal feedback** cho better communication
- **Real-time refinement** thay vì context switching
- **Comprehensive solutions** thay vì piecemeal fixes

## ✅ Success Indicators

### You know it's working when:

- **Popup xuất hiện** sau mỗi major AI task
- **Voice input** transcribes correctly
- **Image uploads** appear trong popup
- **AI responds** to sub-prompts properly
- **Context maintained** across iterations
- **Monthly requests** feel more abundant

### Red flags:

- Popup never appears (extension issue)
- Voice button không hoạt động (SoX issue)
- AI says tool not available (MCP issue)
- Frequent disconnections (config issue)

## 📞 Support

### Self-Help Checklist

- [ ] Script ran without errors
- [ ] Extension installed từ VSIX
- [ ] Cursor restarted completely
- [ ] Manual test (Cmd+Shift+R) works
- [ ] AI test passes ("use review_gate_chat")
- [ ] Voice test passes (SoX working)

### Log Locations

```bash
# MCP logs
tail -f /tmp/review_gate_v2.log

# Cursor logs
# Help → Open Logs Folder trong Cursor

# System logs (macOS)
log show --predicate 'process == "Cursor"' --last 5m
```

### Community

- **Project Docs**: `instructions/review-gate/`
- **Scripts**: `scripts/setup-review-gate.sh`
- **Tools**: `tools/Review-Gate/V2/`

---

🎉 **Enjoy 5x AI productivity với Review Gate V2!**
