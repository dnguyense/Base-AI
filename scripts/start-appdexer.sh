#!/bin/bash

# Quick Start Script for Appdexer MCP Server
# This script starts the Appdexer MCP server for Base-AI-Project

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Appdexer MCP Server...${NC}"

# Project paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APPDEXER_DIR="$PROJECT_ROOT/tools/appdexer"
CURSOR_EXT_DIR="$HOME/cursor-extensions/appdexer"

# Check if Appdexer is installed
if [ ! -d "$CURSOR_EXT_DIR" ]; then
    echo -e "${RED}❌ Appdexer not found in Cursor extensions directory${NC}"
    echo -e "${YELLOW}💡 Please run: ./scripts/setup-appdexer.sh${NC}"
    exit 1
fi

# Check if Python MCP server exists
if [ ! -f "$CURSOR_EXT_DIR/appdexer_mcp.py" ]; then
    echo -e "${RED}❌ Appdexer MCP server not found${NC}"
    echo -e "${YELLOW}💡 Please run: ./scripts/setup-appdexer.sh${NC}"
    exit 1
fi

# Check Python dependencies
echo -e "${BLUE}🔍 Checking Python dependencies...${NC}"
cd "$CURSOR_EXT_DIR"

if ! python3 -c "import mcp, asyncio, typing_extensions, faster_whisper" 2>/dev/null; then
    echo -e "${RED}❌ Python dependencies not installed${NC}"
    echo -e "${YELLOW}💡 Please run: ./scripts/setup-appdexer.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies verified${NC}"
echo -e "${BLUE}🔥 Starting Appdexer MCP Server...${NC}"
echo -e "${YELLOW}📝 Log file: /tmp/appdexer.log${NC}"
echo -e "${YELLOW}🛑 Press Ctrl+C to stop server${NC}"
echo ""

# Start the MCP server
python3 appdexer_mcp.py 