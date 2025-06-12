# Review Gate V2 Team Onboarding Checklist

## 🎯 Overview

Review Gate V2 biến 500 monthly AI requests thành cảm giác như 2500-3000 requests thông qua interactive feedback loop. Đây là checklist để onboard toàn team.

## 📋 Team Leader Checklist

### Pre-Setup (5 phút)

- [ ] **Explain the value prop**: 5x request efficiency, multi-modal input
- [ ] **Show demo video** nếu có hoặc live demo
- [ ] **Set expectations**: Manual extension install, voice chỉ hoạt động trên macOS
- [ ] **Prepare troubleshooting**: Designate 1-2 tech leads làm support

### Setup Phase (15 phút per person)

- [ ] **Run setup script** trên mỗi developer machine:

  ```bash
  cd /path/to/Base-AI-Project
  ./scripts/setup-review-gate.sh
  ```

- [ ] **Manual extension install** (BẮT BUỘC):

  - [ ] Cmd+Shift+P → "Extensions: Install from VSIX"
  - [ ] Select: `tools/Review-Gate/V2/cursor-extension/review-gate-v2-2.6.3.vsix`
  - [ ] Restart Cursor completely

- [ ] **Verify setup** (30 giây):
  - [ ] Test manual: Cmd+Shift+R → popup appears
  - [ ] Test AI: "Use the review_gate_chat tool" → popup works
  - [ ] Test voice (macOS): `sox --version` → shows version

### Training Phase (20 phút per person)

- [ ] **Basic Workflow Demo**:

  ```markdown
  1. Request: "Build login form với validation"
  2. AI works: Creates files, implements logic
  3. Review Gate: Popup opens automatically
  4. Iterate: Add feedback via text/voice/image
  5. Complete: Type "TASK_COMPLETE"
  ```

- [ ] **Multi-modal Practice**:

  - [ ] **Text input**: "Add error handling"
  - [ ] **Voice input**: Record "Make it look better" (macOS)
  - [ ] **Image upload**: Upload wireframe hoặc screenshot

- [ ] **Efficiency Education**:
  - [ ] Explain tool call budget (25 per request)
  - [ ] Show how to combine multiple sub-tasks
  - [ ] Practice optimal request structuring

## 👥 Individual Developer Checklist

### Initial Understanding

- [ ] **Hiểu được lợi ích**: Request efficiency, context preservation, multi-modal
- [ ] **Biết shortcuts**: Cmd+Shift+R cho manual trigger
- [ ] **Biết completion commands**: TASK_COMPLETE, Done, Quit, q

### Technical Verification

- [ ] **Extension installed**: Cursor → Extensions → "Review Gate V2" visible
- [ ] **MCP configured**: `cat ~/.cursor/mcp.json` shows review-gate-v2 server
- [ ] **Script test**: Manual popup (Cmd+Shift+R) works
- [ ] **AI integration**: "Use review_gate_chat" triggers popup

### macOS Specific (Voice Features)

- [ ] **SoX installed**: `sox --version` shows version
- [ ] **Recording test**: `sox -d -r 16000 -c 1 test.wav trim 0 3 && rm test.wav`
- [ ] **Voice UI test**: Click microphone in popup, speak "test"

### Workflow Practice

- [ ] **Complete 1 simple task** với Review Gate
- [ ] **Try all input methods**: text, voice (macOS), image upload
- [ ] **Practice iteration**: Multiple sub-prompts trong 1 session
- [ ] **Understand completion**: Proper session ending

## 🚨 Common Issues & Quick Fixes

### Popup Not Appearing

**Developer reports**: "Review Gate popup never shows up"

**Team Lead Action**:

```bash
# 1. Check extension
# Cursor → Extensions → Search "review-gate" → Should be installed

# 2. Check MCP config
cat ~/.cursor/mcp.json
# Should contain "review-gate-v2" entry

# 3. Complete restart
# Quit Cursor entirely, reopen (not just reload)

# 4. Manual test
# Cmd+Shift+R → Should trigger popup
```

### Voice Not Working

**Developer reports**: "Microphone button does nothing"

**Team Lead Action**:

```bash
# macOS only feature - check platform
uname -s  # Should show "Darwin" for macOS

# Check SoX installation
sox --version

# If missing:
brew install sox

# Test recording
sox -d -r 16000 -c 1 test.wav trim 0 3 && rm test.wav
# Should record 3 seconds without error
```

### AI Says Tool Not Available

**Developer reports**: "AI says review_gate_chat tool not available"

**Team Lead Action**:

```bash
# Check MCP server running
cd ~/cursor-extensions/review-gate-v2
python3 review_gate_v2_mcp.py --version

# Check dependencies
python3 -c "import fastapi, uvicorn; print('MCP dependencies OK')"

# Restart Cursor with clear cache
# Sometimes helps to reset MCP connection
```

## 📊 Success Metrics

### Week 1 Target

- [ ] **90% team** has working setup (popup appears)
- [ ] **70% team** successfully completes 1 Review Gate session
- [ ] **50% team** uses multi-modal features (voice/image)
- [ ] **0 blockers**: No one completely blocked by technical issues

### Week 2 Target

- [ ] **Team reports** subjective feeling of "more requests available"
- [ ] **Reduced complaints** về hitting monthly limits
- [ ] **Increased iteration** on tasks (more refinement)
- [ ] **Better context preservation** trong complex tasks

### Month 1 Target

- [ ] **Measurable efficiency**: Fewer total conversation starts for same work
- [ ] **Higher satisfaction**: Team prefers Review Gate workflow
- [ ] **Advanced usage**: Regular use of voice và image features
- [ ] **Team knowledge**: Everyone can troubleshoot basic issues

## 🎓 Advanced Training (Week 2+)

### Power User Techniques

- [ ] **Request structuring** for maximum efficiency:

  ```markdown
  "Build complete feature X với these requirements: [list]
  I'll iterate on design, error handling, và optimization
  trong Review Gate session"
  ```

- [ ] **Voice command optimization**:

  - Quick feedback: "Make it bigger", "Add error handling"
  - Direction changes: "Actually try a different approach"
  - Bug reports: "The login button doesn't work"

- [ ] **Image workflow mastery**:
  - Upload wireframes for UI implementation
  - Screenshot errors for debugging
  - Before/after comparisons for iteration

### Team Collaboration

- [ ] **Shared sessions**: Multiple people providing feedback
- [ ] **Design reviews**: Upload mockups for AI implementation
- [ ] **Bug triage**: Screenshot-driven debugging
- [ ] **Knowledge sharing**: Best practices từ power users

## 📞 Ongoing Support

### Support Hierarchy

1. **Self-service**: [review-gate-quick-setup.md](review-gate-quick-setup.md)
2. **Peer support**: Designate 2-3 team champions
3. **Technical escalation**: Team lead troubleshooting
4. **Framework issues**: Base-AI-Project maintainers

### Regular Check-ins

- [ ] **Week 1**: Daily standup check on setup issues
- [ ] **Week 2**: Bi-weekly efficiency discussion
- [ ] **Month 1**: Monthly retrospective on Review Gate adoption
- [ ] **Ongoing**: Include trong regular developer experience surveys

---

🚀 **Goal**: Entire team leveraging Review Gate V2 cho 5x AI productivity trong 1 tháng!
