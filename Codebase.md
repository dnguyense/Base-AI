# Base-AI-Project Codebase Structure

## Overview

Base-AI-Project là một template framework được tối ưu hóa cho Cursor IDE với tích hợp Appdexer để maximize AI development efficiency và design analysis capabilities.

## Project Structure

### Root Level

```
Base-AI-Project/
├── .project-identity          # Project identification và type definitions
├── .cursorrc                  # Cursor IDE configuration với Appdexer rules
├── appdexer.mdc               # Enhanced Appdexer rule cho Base-AI-Project
├── Codebase.md               # This file - project structure overview
├── Decisions.md              # Architectural decisions và reasoning
├── Instruction.md            # Main project instruction và roadmap
├── README.md                 # Project introduction và setup guide
└── Changelog.md              # Version history và changes
```

### Instructions System (`instructions/`)

Centralized instruction modules cho structured development:

```
instructions/
├── README.md                 # Instruction system overview
├── appdexer/               # Appdexer documentation
│   └── README.md           # Basic integration guide
├── review-gate/             # Legacy Review-Gate V2 documentation
│   ├── README.md           # Basic integration guide
│   └── advanced-usage.md   # Advanced features và optimization
├── API_Docs.md             # API documentation template
├── weather-basic.md        # Weather API integration examples
├── weather-detailed.md     # Advanced weather functionality
└── database-management.md  # Database operations guide
```

### Tools & Automation (`tools/`)

Development tools và utilities:

```
tools/
├── README.md                # Tools overview
├── appdexer/               # Appdexer integration
│   ├── appdexer_mcp.py          # MCP server implementation
│   ├── Appdexer.mdc             # Enhanced Appdexer rule
│   ├── requirements.txt         # Python dependencies
│   ├── mcp.json                 # MCP configuration
│   ├── icon_library_integration.py # Icon library integration
│   ├── ai/                      # AI modules
│   ├── voice/                   # Voice processing modules
│   ├── core/                    # Core functionality
│   └── cursor-extension/        # Cursor extension files
└── database/               # Database utilities
```

### Scripts & Automation (`scripts/`)

Automated workflow scripts:

```
scripts/
├── README.md               # Scripts documentation
├── setup-appdexer.sh       # One-click Appdexer setup
├── start-appdexer.sh        # Quick Appdexer server start
├── setup-review-gate.sh     # Legacy Review-Gate V2 setup
├── backup_file.sh         # File backup automation
├── restore_file.sh        # File restoration utility
├── cleanup_backups.sh     # Backup maintenance
└── dalle/                 # DALL-E integration scripts
```

### Documentation (`docs/`)

Project documentation và templates:

```
docs/
└── templates/             # Document templates
```

### Memory & Experience (`memory_bank/`, `experiences/`)

AI memory và project experience storage:

```
memory_bank/               # Persistent AI memory storage
experiences/              # Project experience và lessons learned
```

## Key Components

### 1. Review-Gate V2 Integration

**Location**: `tools/appdexer/`, `appdexer.mdc`

Enhanced Review-Gate implementation specifically optimized for Base-AI-Project:

- **MCP Server**: Local Model Context Protocol server
- **Cursor Extension**: Multi-modal popup interface
- **Enhanced Rule**: Base-AI-Project specific behaviors
- **Auto-Setup**: One-click installation script

**Key Features**:

- 5x request efficiency improvement
- Multi-modal input (text, voice, images)
- Smart backup integration
- Project personality adaptation
- Instruction workflow sync

### 2. Cursor Optimization System

**Location**: `.cursorrc`, `Cursor-Rule-IDE.txt`

Advanced Cursor IDE configuration:

- **Always-Apply Rules**: Core rules active in all contexts
- **Auto-Apply Rules**: File-type specific rule activation
- **Rule Sync**: Automated rule updates from remote endpoint
- **Performance Optimization**: File size limits, indexing rules

### 3. Backup & Protection System

**Location**: `scripts/backup_*.sh`, file protection rules

Comprehensive file protection:

- **Automatic Backups**: Before major changes
- **Structured Storage**: Date-organized backup structure
- **Restoration Tools**: Easy file recovery
- **Integration**: Works with Review-Gate workflow

### 4. Instruction Workflow

**Location**: `instructions/`, instruction workflow rules

Structured development approach:

- **Template System**: Consistent instruction formats
- **Phase-Based Development**: Organized by project phases
- **Dependency Mapping**: Clear component relationships
- **Auto-Documentation**: Updates during development

### 5. Project Identity & Personality

**Location**: `.project-identity`, project personality rules

Project-specific customization:

- **Identity Verification**: Prevents project confusion
- **Personality Adaptation**: Customizes AI communication style
- **Type-Specific Rules**: Different behaviors by project type
- **Context Preservation**: Maintains project characteristics

## Integration Points

### Review-Gate V2 ↔ Base-AI-Project

- **Backup Integration**: Auto-triggers backup before major changes
- **Documentation Updates**: Auto-updates Codebase.md, Decisions.md
- **Rule Compliance**: Respects all Base-AI-Project conventions
- **Personality Sync**: Adapts to project communication style

### Cursor IDE ↔ System Components

- **Rule System**: Hierarchical rule application
- **MCP Integration**: Seamless tool communication
- **Extension Support**: Enhanced popup interface
- **Performance Optimization**: File indexing, context management

### Instruction System ↔ Development Process

- **Template Compliance**: Ensures consistent instruction format
- **Progress Tracking**: Updates status in instruction files
- **Dependency Management**: Tracks component relationships
- **Quality Assurance**: Maintains documentation standards

## Performance Characteristics

### Tool Call Optimization

- **Before Review-Gate**: 500 monthly requests → 500 tasks
- **With Review-Gate**: 500 monthly requests → 1500-2500 tasks
- **Efficiency Gain**: 3-5x improvement typical

### File Management

- **Protection**: Automatic backup before changes
- **Organization**: Structured file hierarchy
- **Optimization**: Cursor indexing rules
- **Recovery**: Quick restoration capabilities

### Development Workflow

- **Structured Process**: Phase-based development
- **Quality Control**: Built-in review cycles
- **Documentation**: Auto-updating project docs
- **Consistency**: Enforced coding standards

## Recent Enhancements

### Review-Gate V2 Integration (Latest)

- Added comprehensive Review-Gate V2 support
- Created Base-AI-Project specific rule adaptation
- Implemented one-click setup automation
- Enhanced multi-modal interaction capabilities

### Optimization Improvements

- Enhanced `.cursorrc` configuration
- Improved file protection rules
- Streamlined backup workflow
- Better instruction template system

## Technology Stack

### Core Technologies

- **IDE**: Cursor IDE with enhanced rules
- **Protocol**: Model Context Protocol (MCP)
- **Scripting**: Bash automation scripts
- **Configuration**: JSON-based settings

### Integration Technologies

- **Python**: MCP server implementation
- **JavaScript**: Cursor extension
- **Speech**: Faster-Whisper (macOS optimized)
- **Images**: Multi-format support (PNG, JPG, etc.)

### Development Tools

- **Backup System**: Automated file protection
- **Documentation**: Markdown-based system
- **Rules Engine**: Hierarchical rule application
- **Memory System**: Persistent AI memory storage

Base-AI-Project provides a comprehensive foundation for AI-assisted development with Review-Gate V2 integration maximizing productivity and maintaining quality standards.

## 🎯 **Appdexer System** (NEW)

### **Overview**

**Appdexer** - Multi-Project Resource Management System tích hợp vào Review-Gate V2, cung cấp:

- **🤖 Auto Project Detection:** Tự động nhận diện loại dự án (Android, iOS, React, Vue, Node.js, Flutter...)
- **⚙️ Dynamic MCP Tools Loading:** Tự động load appropriate tools cho từng project type
- **🎤 Voice Search Integration:** Hỗ trợ voice commands cho resource search
- **🔧 AI-Callable Functions:** AI có thể tự động gọi tools dựa trên context

### **Core Components**

#### **ProjectDetector** (`tools/appdexer/core/project_detector.py`)

- Auto-detect project types với confidence scoring
- Hỗ trợ 9+ project types: Android, iOS, React, Vue, Angular, Node.js, Flutter, React Native, Python
- Smart detection logic với file pattern matching
- Multi-platform project support

#### **MCPToolsLoader** (`tools/appdexer/core/mcp_loader.py`)

- Dynamic loading của MCP tools dựa trên detected project types
- Project-specific configuration management
- Tool handler registration và execution
- Context-aware tool filtering

#### **AppdexerCore** (`tools/appdexer/core/mcp_loader.py`)

- Main coordinator class
- Auto-setup workflow
- Integration với MCP server
- Project information management

### **MCP Integration** (`tools/appdexer/appdexer_mcp.py`)

**New MCP Tools:**

- `appdexer_auto_setup` - Auto-detect và setup project tools
- `appdexer_search_resources` - Search resources cho project type
- `appdexer_get_project_info` - Get comprehensive project information
- `appdexer_{dynamic_tool}` - Project-specific tools auto-loaded

**Tool Examples by Project Type:**

```
Android: android_icon_search, android_drawable_manager, vector_drawable_converter
iOS: ios_asset_search, ios_bundle_manager, ios_icon_generator
React: react_icon_search, react_component_generator, jsx_component_creator
Vue: vue_icon_search, vue_component_generator, vue_sfc_creator
Node.js: web_asset_manager, static_file_organizer, express_static_setup
```

### **Detection Logic**

**Project Type Detection Matrix:**
| Project Type | Key Signals | Confidence Weights | Resource Path |
|---|---|---|---|
| Android | `app/build.gradle`, `AndroidManifest.xml` | 0.4, 0.3 | `app/src/main/res/drawable/` |
| iOS | `*.xcodeproj`, `Info.plist` | 0.5, 0.2 | `Assets.xcassets/` |
| React | `package.json` + `react` dependency | 0.5 | `src/assets/icons/` |
| Vue | `package.json` + `vue` dependency | 0.5 | `src/assets/icons/` |
| Flutter | `pubspec.yaml`, `lib/main.dart` | 0.5, 0.4 | `assets/icons/` |

### **Usage Example**

```python
# Auto-setup for current project
from appdexer import quick_setup
setup_info = await quick_setup("/path/to/project")

# Manual usage
from appdexer import AppdexerCore
appdexer = AppdexerCore("/path/to/project")
setup_info = await appdexer.auto_setup()

# Get tools for specific context
icon_tools = await appdexer.get_tools_for_context("icon")
```

### **Current Status**

- ✅ Phase 1: Core Detection Engine - **COMPLETED**
- ✅ Project Detector với 9+ project types
- ✅ MCP Tools Auto-Loader với dynamic tool mapping
- ✅ Integration với Review-Gate V2 MCP server
- ✅ Test suite và validation
- 📋 Next: Phase 2 - Voice Search & AI Integration

## 🔧 **Review-Gate V2 System**

### **Core Features**

- **Multi-modal popup interface** - Text, voice, images support
- **MCP Server integration** - Direct Cursor extension communication
- **Speech-to-text processing** - Faster-Whisper integration
- **Real-time user interaction** - 5-minute timeout with immediate response
- **Appdexer integration** - Auto project detection và resource management

### **Technical Components**

#### **MCP Server** (`tools/appdexer/appdexer_mcp.py`)

- Main server với Appdexer integration
- Tool handlers cho user interaction
- Speech processing capabilities
- Cross-platform file handling

#### **Cursor Extension** (`tools/appdexer/cursor-extension/`)

- Popup UI implementation
- Extension-server communication
- User input capture và processing

### **Available MCP Tools**

1. `review_gate_chat` - Main user interaction tool
2. `appdexer_auto_setup` - Project detection và setup
3. `appdexer_search_resources` - Resource search
4. `appdexer_get_project_info` - Project information
5. Dynamic project-specific tools

## 📚 **Documentation & Configuration**

### **Key Files**

- `instructions/review-gate-enhancement-plan.md` - Appdexer implementation plan
- `tools/appdexer/mcp.json` - MCP configuration
- `tools/appdexer/requirements.txt` - Dependencies

### **Dependencies**

```
mcp>=1.9.2
faster-whisper (optional - for speech features)
pathlib, asyncio, json, logging (built-in)
```

### **Future Development**

- **Phase 2:** Voice Search & AI Integration
- **Phase 3:** AI-Callable MCP Functions
- **Phase 4:** Icon Library API Integration
- **Phase 5:** Advanced Features (batch operations, customization)

## 🎯 **Key Achievements**

1. **Zero-Config Auto-Setup** - Project detection hoàn toàn tự động
2. **Multi-Platform Support** - 9+ project types được support
3. **Dynamic Tool Loading** - Tools được load dựa trên project context
4. **MCP Integration** - Seamless integration với Cursor workflow
5. **Extensible Architecture** - Dễ dàng thêm project types và tools mới

**Status:** Phase 1 hoàn thành, ready for Phase 2 implementation.
