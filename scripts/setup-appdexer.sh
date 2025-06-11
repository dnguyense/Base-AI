#!/bin/bash

# Base-AI-Project Appdexer Setup
# Integrates Appdexer with our existing project structure

set -e

echo "🚀 Setting up Appdexer for Base-AI-Project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APPDEXER_DIR="$PROJECT_ROOT/tools/appdexer"
CURSOR_EXT_DIR="$HOME/cursor-extensions/appdexer"

echo -e "${BLUE}📍 Project root: $PROJECT_ROOT${NC}"
echo -e "${BLUE}📁 Appdexer dir: $APPDEXER_DIR${NC}"

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is required${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python 3 found${NC}"

# Check if Appdexer directory exists
if [ ! -d "$APPDEXER_DIR" ]; then
    echo -e "${RED}❌ Appdexer directory not found at $APPDEXER_DIR${NC}"
    exit 1
fi

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
cd "$APPDEXER_DIR"
if [ -f "requirements.txt" ]; then
    python3 -m pip install -r requirements.txt
    echo -e "${GREEN}✅ Python dependencies installed${NC}"
else
    echo -e "${RED}❌ requirements.txt not found in $APPDEXER_DIR${NC}"
    exit 1
fi

# Setup MCP server
echo -e "${YELLOW}🔧 Setting up MCP server...${NC}"
mkdir -p "$CURSOR_EXT_DIR"
cp appdexer_mcp.py "$CURSOR_EXT_DIR/"
cp requirements.txt "$CURSOR_EXT_DIR/"
cp mcp.json "$CURSOR_EXT_DIR/"

# Install Python deps in cursor-extensions
cd "$CURSOR_EXT_DIR"
python3 -m pip install -r requirements.txt
echo -e "${GREEN}✅ MCP server setup complete${NC}"

# Setup Cursor extension
echo -e "${YELLOW}🔌 Installing Cursor extension...${NC}"
if [ -d "$APPDEXER_DIR/cursor-extension" ]; then
    # Check for extension package
    if [ -f "$APPDEXER_DIR/cursor-extension/appdexer-3.0.0.vsix" ]; then
        echo -e "${BLUE}📦 Installing Cursor extension VSIX...${NC}"
        # Note: User needs to manually install VSIX in Cursor
        echo -e "${YELLOW}⚠️ Please manually install the extension:${NC}"
        echo -e "   1. Open Cursor"
        echo -e "   2. Go to Extensions (Cmd+Shift+X)"
        echo -e "   3. Click '...' menu → 'Install from VSIX'"
        echo -e "   4. Select: $APPDEXER_DIR/cursor-extension/appdexer-3.0.0.vsix"
    else
        echo -e "${YELLOW}⚠️ Extension VSIX not found, extension features may not be available${NC}"
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
    "appdexer": {
      "command": "python3",
      "args": ["$CURSOR_EXT_DIR/appdexer_mcp.py"],
      "env": {}
    }
  }
}
EOF

echo -e "${GREEN}✅ MCP configuration updated${NC}"

# Add Appdexer rule to .cursorrc
echo -e "${YELLOW}📝 Adding Appdexer rule to .cursorrc...${NC}"
CURSORRC_FILE="$PROJECT_ROOT/.cursorrc"

if [ -f "$CURSORRC_FILE" ]; then
    # Check if appdexer rule already exists
    if ! grep -q "appdexer" "$CURSORRC_FILE"; then
        # Parse JSON and add appdexer rule
        python3 -c "
import json
import sys

with open('$CURSORRC_FILE', 'r') as f:
    config = json.load(f)

if 'rules' not in config:
    config['rules'] = {}
if 'alwaysApplyRules' not in config['rules']:
    config['rules']['alwaysApplyRules'] = []

# Add appdexer rule if not already present
rule_name = 'appdexer.mdc'
if rule_name not in config['rules']['alwaysApplyRules']:
    config['rules']['alwaysApplyRules'].append(rule_name)

with open('$CURSORRC_FILE', 'w') as f:
    json.dump(config, f, indent=2)
"
        echo -e "${GREEN}✅ Appdexer rule added to .cursorrc${NC}"
    else
        echo -e "${BLUE}📋 Appdexer rule already exists in .cursorrc${NC}"
    fi
fi

# Copy the Appdexer rule to project
echo -e "${YELLOW}📋 Setting up Appdexer rule...${NC}"
if [ -f "$APPDEXER_DIR/Appdexer.mdc" ]; then
    cp "$APPDEXER_DIR/Appdexer.mdc" "$PROJECT_ROOT/appdexer.mdc"
    echo -e "${GREEN}✅ Appdexer rule copied to project root${NC}"
else
    echo -e "${YELLOW}⚠️ Appdexer.mdc not found, rule not copied${NC}"
fi

# Create project-specific documentation
echo -e "${YELLOW}📚 Creating documentation...${NC}"
mkdir -p "$PROJECT_ROOT/instructions/appdexer"

cat > "$PROJECT_ROOT/instructions/appdexer/README.md" << 'EOF'
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
EOF

echo -e "${GREEN}✅ Documentation created${NC}"

# Final instructions
echo ""
echo -e "${GREEN}🎉 Appdexer setup complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "1. ${BLUE}Restart Cursor completely${NC}"
echo -e "2. ${BLUE}Test the setup:${NC}"
echo -e "   - Press Cmd+Shift+A for manual popup test"
echo -e "   - Ask AI: 'Use the appdexer_chat tool to get my feedback'"
echo -e "3. ${BLUE}Try Design Analysis:${NC}"
echo -e "   - Ask AI: 'Use appdexer_design_analysis to analyze design files'"
echo ""
echo -e "${GREEN}✨ Happy coding with Appdexer!${NC}" 