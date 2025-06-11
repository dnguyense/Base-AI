# Review-Gate V2 Advanced Usage trong Base-AI-Project

## Tổng quan

Review-Gate V2 được tích hợp sâu vào Base-AI-Project workflow để tối ưu hóa tool call usage và tạo ra interactive loop hiệu quả.

## Advanced Features Integration

### 1. **Project Personality Integration**

Review-Gate sẽ adapt tone theo project personality:

```bash
# Kiểm tra project personality hiện tại
cat .project-personality

# Review-Gate sẽ tự động adjust:
# - Humor level
# - Communication style
# - Technical depth
# - Response format
```

### 2. **Smart Backup Integration**

Tự động trigger backup trước major changes:

```bash
# Manual backup trigger trong review cycle
"backup current state"

# Auto-backup được trigger khi:
# - Thay đổi > 5 files
# - Thay đổi architecture files
# - Major refactoring detected
```

### 3. **Multi-Modal Input Optimization**

#### Voice Commands (macOS):

- **"Update documentation"** → Auto-update Codebase.md, Decisions.md
- **"Create instruction file"** → Generate new instruction template
- **"Backup and continue"** → Create backup then proceed
- **"Check project rules"** → Verify compliance với Base-AI-Project rules

#### Image Upload Use Cases:

- **Architecture Diagrams**: Upload để AI understand system design
- **UI Mockups**: Share wireframes cho UI implementation
- **Error Screenshots**: Debug issues visually
- **Reference Materials**: Documentation, specifications

#### Text Commands:

```
# Special Base-AI-Project commands
"update instructions for [module_name]"
"document decision: [decision_description]"
"check file protection status"
"review project structure"
"optimize cursor configuration"
```

### 4. **Instruction Workflow Enhancement**

#### Auto-Documentation Updates:

Review-Gate sẽ tự động update:

```markdown
# Codebase.md - Structure changes

# Decisions.md - Architectural decisions

# instructions/[module]/ - Feature implementations

# README.md - Major functionality additions
```

#### Phase-Aware Reviews:

Different review prompts based on project phase:

```json
{
  "Phase 1 (Core AI)": "Focus on AI integration, ML models, camera features",
  "Phase 2 (Advanced)": "Review editor functionality, social features",
  "Phase 3 (Architecture)": "Database design, API architecture review",
  "Phase 4 (Premium)": "Monetization, analytics implementation",
  "Phase 5 (Support)": "Settings, help system, user support"
}
```

## Tool Call Optimization Strategies

### 1. **Maximizing Tool Call Budget**

```
Thay vì:
Request 1: "Create authentication module" (5 tool calls)
Request 2: "Add error handling" (3 tool calls)
Request 3: "Update documentation" (2 tool calls)
Request 4: "Add tests" (4 tool calls)
= 4 requests, 14 tool calls total

Với Review-Gate:
Request 1: "Create authentication module"
- Primary: Create module (8 tool calls)
- Review 1: "Add error handling" (4 tool calls)
- Review 2: "Update documentation" (3 tool calls)
- Review 3: "Add comprehensive tests" (6 tool calls)
- Review 4: "TASK_COMPLETE"
= 1 request, 21 tool calls total
```

### 2. **Smart Sub-Prompting**

Optimal sub-prompt patterns:

```
✅ Good: "Add input validation to the login form"
✅ Good: "Implement retry logic with exponential backoff"
✅ Good: "Update the API documentation for the new endpoint"

❌ Avoid: "Make it better" (vague)
❌ Avoid: "Fix everything" (too broad)
❌ Avoid: "Start over" (wastes tool calls)
```

## Integration với Base-AI-Project Workflows

### 1. **Rule Inheritance**

Review-Gate respects all Base-AI-Project rules:

```json
// Automatic rule application
{
  "file_protection": "Backup before changes",
  "cursor_optimization": "File size limits, indexing",
  "instruction_workflow": "Template compliance",
  "project_personality": "Communication style",
  "resource_management": "Icon/asset handling"
}
```

### 2. **Documentation Continuity**

Seamless integration với existing docs:

```markdown
# Auto-generated entries

## Decisions.md

[2024-01-15] Review-Gate session: Enhanced authentication module with JWT tokens

## Codebase.md

### New Components

- AuthenticationManager.js: JWT token handling
- ValidationUtils.js: Input validation helpers

## instructions/auth/

Updated authentication.md với new implementation details
```

### 3. **Error Handling Enhancement**

Enhanced error handling cho Base-AI-Project context:

```javascript
// Review-Gate enhanced error responses
{
  "mcp_unavailable": "Fallback to standard Base-AI-Project completion",
  "backup_failed": "Continue with warning, recommend manual backup",
  "rule_conflict": "Prioritize Base-AI-Project rules",
  "project_mismatch": "Alert user, request confirmation"
}
```

## Performance Monitoring

### 1. **Tool Call Tracking**

Monitor efficiency improvements:

```bash
# Check Review-Gate logs
tail -f /tmp/review_gate_v2.log

# Look for patterns:
# - Tool calls per session
# - Review cycles per request
# - Completion time improvements
```

### 2. **Request Efficiency Metrics**

Track monthly request optimization:

```
Before Review-Gate: 500 requests → 500 tasks completed
With Review-Gate: 500 requests → 1500-2500 tasks completed (3-5x improvement)

Typical gains:
- Simple tasks: 2x efficiency
- Medium complexity: 3-4x efficiency
- Complex workflows: 5x+ efficiency
```

## Best Practices

### 1. **Effective Review Cycles**

```
✅ Start broad, get specific
✅ Use images for visual context
✅ Voice commands for quick iterations
✅ Document major decisions
✅ Backup before major changes

❌ Don't micro-manage every detail
❌ Don't ignore project conventions
❌ Don't skip documentation updates
```

### 2. **Multi-Modal Strategy**

```
Text: Specific requirements, code snippets
Voice: Quick commands, natural language feedback
Images: Architecture diagrams, UI mockups, error screens
```

### 3. **Base-AI-Project Compliance**

Always ensure:

- File protection rules followed
- Backup created for substantial changes
- Documentation updated appropriately
- Project personality maintained
- Instruction templates used correctly

## Troubleshooting

### Common Issues:

```bash
# MCP server not responding
ps aux | grep review_gate_v2_mcp.py
python3 ~/cursor-extensions/review-gate-v2/review_gate_v2_mcp.py

# Extension not loading
# Manually install VSIX in Cursor Extensions

# Speech not working
sox --version
brew install sox  # macOS

# Popup not appearing
Cmd+Shift+R  # Manual trigger
```

### Integration Conflicts:

```
# Rule conflicts → Base-AI-Project rules take priority
# Backup failures → Continue with warning
# Project mismatch → Alert and request confirmation
```

## Advanced Customization

### Project-Specific Review Prompts:

```json
{
  "android_projects": "Focus on performance, memory, battery",
  "web_projects": "Review responsive design, accessibility",
  "ai_projects": "Validate model integration, data flow",
  "base_templates": "Ensure reusability, documentation"
}
```

### Custom Voice Commands:

Extend với project-specific commands:

```
"run android tests" → Trigger test suite
"check performance" → Run performance benchmarks
"validate ai models" → Test ML model integration
"sync with base" → Update from base template
```

Review-Gate V2 transforms Base-AI-Project development efficiency while maintaining all project conventions and quality standards!
