#!/bin/bash

# Base-AI-Project Review-Gate V2 Setup
# Integrates Review-Gate V2 with our existing project structure

set -e

echo "🚀 Setting up Review-Gate V2 for Base-AI-Project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REVIEW_GATE_DIR="$PROJECT_ROOT/tools/review-gate-v2"
CURSOR_EXT_DIR="$HOME/cursor-extensions/review-gate-v2"

echo -e "${BLUE}📍 Project root: $PROJECT_ROOT${NC}"
echo -e "${BLUE}📁 Review-Gate dir: $REVIEW_GATE_DIR${NC}"

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is required${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python 3 found${NC}"

# Check if on macOS for SoX
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${YELLOW}🎤 Installing SoX for speech functionality...${NC}"
    if command -v brew &> /dev/null; then
        brew install sox
        echo -e "${GREEN}✅ SoX installed${NC}"
    else
        echo -e "${YELLOW}⚠️ Homebrew not found. Please install SoX manually for speech functionality${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Non-macOS detected. Please install SoX manually for speech functionality${NC}"
fi

# Install Python dependencies
echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
cd "$REVIEW_GATE_DIR"
python3 -m pip install -r requirements_simple.txt
echo -e "${GREEN}✅ Python dependencies installed${NC}"

# Setup MCP server
echo -e "${YELLOW}🔧 Setting up MCP server...${NC}"
mkdir -p "$CURSOR_EXT_DIR"
cp review_gate_v2_mcp.py "$CURSOR_EXT_DIR/"
cp requirements_simple.txt "$CURSOR_EXT_DIR/"
cp mcp.json "$CURSOR_EXT_DIR/"

# Install Python deps in cursor-extensions
cd "$CURSOR_EXT_DIR"
python3 -m pip install -r requirements_simple.txt
echo -e "${GREEN}✅ MCP server setup complete${NC}"

# Setup Cursor extension
echo -e "${YELLOW}🔌 Installing Cursor extension...${NC}"
if [ -d "$REVIEW_GATE_DIR/cursor-extension" ]; then
    # Install the VSIX extension
    if [ -f "$REVIEW_GATE_DIR/cursor-extension/review-gate-v2-2.6.3.vsix" ]; then
        echo -e "${BLUE}📦 Installing Cursor extension VSIX...${NC}"
        # Note: User needs to manually install VSIX in Cursor
        echo -e "${YELLOW}⚠️ Please manually install the extension:${NC}"
        echo -e "   1. Open Cursor"
        echo -e "   2. Go to Extensions (Cmd+Shift+X)"
        echo -e "   3. Click '...' menu → 'Install from VSIX'"
        echo -e "   4. Select: $REVIEW_GATE_DIR/cursor-extension/review-gate-v2-2.6.3.vsix"
    fi
fi

# Configure MCP in Cursor
echo -e "${YELLOW}⚙️ Configuring MCP integration...${NC}"
CURSOR_MCP_CONFIG="$HOME/.cursor/mcp.json"

if [ -f "$CURSOR_MCP_CONFIG" ]; then
    echo -e "${BLUE}📄 Existing MCP config found, backing up...${NC}"
    cp "$CURSOR_MCP_CONFIG" "$CURSOR_MCP_CONFIG.backup.$(date +%s)"
fi

# Create or update MCP config
cat > "$CURSOR_MCP_CONFIG" << EOF
{
  "mcpServers": {
    "review-gate-v2": {
      "command": "python3",
      "args": ["$CURSOR_EXT_DIR/review_gate_v2_mcp.py"],
      "env": {}
    }
  }
}
EOF

echo -e "${GREEN}✅ MCP configuration updated${NC}"

# Add Review-Gate rule to .cursorrc
echo -e "${YELLOW}📝 Adding Review-Gate rule to .cursorrc...${NC}"
CURSORRC_FILE="$PROJECT_ROOT/.cursorrc"

if [ -f "$CURSORRC_FILE" ]; then
    # Check if review-gate rule already exists
    if ! grep -q "review-gate-v2" "$CURSORRC_FILE"; then
        # Parse JSON and add review-gate rule
        python3 -c "
import json
import sys

with open('$CURSORRC_FILE', 'r') as f:
    config = json.load(f)

if 'rules' not in config:
    config['rules'] = {}
if 'alwaysApplyRules' not in config['rules']:
    config['rules']['alwaysApplyRules'] = []

# Add review-gate rule if not already present
rule_name = 'review-gate-v2.mdc'
if rule_name not in config['rules']['alwaysApplyRules']:
    config['rules']['alwaysApplyRules'].append(rule_name)

with open('$CURSORRC_FILE', 'w') as f:
    json.dump(config, f, indent=2)
"
        echo -e "${GREEN}✅ Review-Gate rule added to .cursorrc${NC}"
    else
        echo -e "${BLUE}📋 Review-Gate rule already exists in .cursorrc${NC}"
    fi
fi

# Copy the Review-Gate rule to project
echo -e "${YELLOW}📋 Setting up Review-Gate rule...${NC}"
cp "$REVIEW_GATE_DIR/ReviewGateV2.mdc" "$PROJECT_ROOT/"
echo -e "${GREEN}✅ Review-Gate rule copied to project root${NC}"

# Create project-specific documentation
echo -e "${YELLOW}📚 Creating documentation...${NC}"
mkdir -p "$PROJECT_ROOT/instructions/review-gate"

cat > "$PROJECT_ROOT/instructions/review-gate/README.md" << 'EOF'
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
EOF

echo -e "${GREEN}✅ Documentation created${NC}"

# Final instructions
echo ""
echo -e "${GREEN}🎉 Review-Gate V2 setup complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "1. ${BLUE}Restart Cursor completely${NC}"
echo -e "2. ${BLUE}Install the extension VSIX manually:${NC}"
echo -e "   - Open Cursor → Extensions → Install from VSIX"
echo -e "   - Select: $REVIEW_GATE_DIR/cursor-extension/review-gate-v2-2.6.3.vsix"
echo -e "3. ${BLUE}Test the setup:${NC}"
echo -e "   - Press Cmd+Shift+R for manual popup test"
echo -e "   - Ask AI: 'Use the review_gate_chat tool to get my feedback'"
echo ""
echo -e "${GREEN}✨ Happy coding with Review-Gate V2!${NC}" 