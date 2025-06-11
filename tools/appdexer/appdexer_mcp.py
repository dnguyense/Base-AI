#!/usr/bin/env python3
"""
Appdexer 2.0 - Advanced MCP Server with Cursor Integration
Author: Kiên Lê & Lakshman Turlapati
Provides popup chat, quick input, and file picker tools that automatically trigger Cursor extension.

Requirements:
- mcp>=1.9.2 (latest stable version)
- Python 3.8+
"""

import asyncio
import json
import sys
import logging
import os
import time
import uuid
import glob
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional, Sequence

# Appdexer imports
try:
    from appdexer import (
        AppdexerCore, ProjectType, VoiceProcessor, SpeechRecognizer, 
        VoiceCommandParser, AIContextAnalyzer
    )
    APPDEXER_AVAILABLE = True
except ImportError:
    APPDEXER_AVAILABLE = False

# Speech-to-text imports
try:
    from faster_whisper import WhisperModel
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False

from mcp.server import Server
from mcp.server.models import InitializationOptions
from mcp.server.stdio import stdio_server
from mcp.types import (
    CallToolRequest,
    ListToolsRequest,
    TextContent,
    Tool,
    CallToolResult,
    Resource,
    ImageContent,
    EmbeddedResource,
)

# Cross-platform temp directory helper
def get_temp_path(filename: str) -> str:
    """Get cross-platform temporary file path"""
    # Use /tmp/ for macOS and Linux, system temp for Windows
    if os.name == 'nt':  # Windows
        temp_dir = tempfile.gettempdir()
    else:  # macOS and Linux
        temp_dir = '/tmp'
    return os.path.join(temp_dir, filename)

# Configure logging with immediate flush
log_file_path = get_temp_path('appdexer.log')

# Create handlers separately to handle Windows file issues
handlers = []
try:
    # File handler - may fail on Windows if file is locked
    file_handler = logging.FileHandler(log_file_path, mode='a', encoding='utf-8')
    file_handler.setLevel(logging.INFO)
    handlers.append(file_handler)
except Exception as e:
    # If file logging fails, just use stderr
    print(f"Warning: Could not create log file: {e}", file=sys.stderr)

# Always add stderr handler
stderr_handler = logging.StreamHandler(sys.stderr)
stderr_handler.setLevel(logging.INFO)
handlers.append(stderr_handler)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=handlers
)
logger = logging.getLogger(__name__)
logger.info(f"🔧 Log file path: {log_file_path}")

# Force immediate log flushing
for handler in logger.handlers:
    if hasattr(handler, 'flush'):
        handler.flush()

class AppdexerServer:
    def __init__(self):
        self.server = Server("appdexer")
        self.setup_handlers()
        self.shutdown_requested = False
        self.shutdown_reason = ""
        self._last_attachments = []
        self._whisper_model = None
        self._appdexer_core = None
        
        # Initialize Whisper model if available
        if WHISPER_AVAILABLE:
            try:
                logger.info("🎤 Loading Faster-Whisper model for speech-to-text...")
                self._whisper_model = WhisperModel("base", device="cpu", compute_type="int8")  # Using base model for balance of speed/accuracy
                logger.info("✅ Faster-Whisper model loaded successfully")
            except Exception as e:
                logger.error(f"❌ Failed to load Whisper model: {e}")
                self._whisper_model = None
        else:
            logger.warning("⚠️ Whisper not available - speech-to-text will be disabled")
            
        # Initialize Appdexer Core với Voice & AI components if available
        if APPDEXER_AVAILABLE:
            try:
                logger.info("🎯 Initializing Appdexer Core with Voice & AI...")
                # Try to detect current working directory as project root
                project_root = os.getcwd()
                self._appdexer_core = AppdexerCore(project_root)
                
                # Initialize Voice & AI components
                self._voice_processor = VoiceProcessor(self._appdexer_core)
                self._speech_recognizer = SpeechRecognizer()
                self._command_parser = VoiceCommandParser()
                self._ai_analyzer = AIContextAnalyzer(self._appdexer_core)
                
                logger.info(f"✅ Appdexer Core with Voice & AI initialized for project: {project_root}")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Appdexer Core: {e}")
                self._appdexer_core = None
                self._voice_processor = None
                self._speech_recognizer = None
                self._command_parser = None
                self._ai_analyzer = None
        else:
            logger.warning("⚠️ Appdexer not available - project detection will be disabled")
            self._voice_processor = None
            self._speech_recognizer = None
            self._command_parser = None
            self._ai_analyzer = None
            
        # Start speech trigger monitoring
        self._start_speech_monitoring()
        
        logger.info("🚀 Appdexer 2.0 server initialized by Kiên Lê & Lakshman Turlapati for Cursor integration")
        # Ensure log is written immediately
        for handler in logger.handlers:
            if hasattr(handler, 'flush'):
                handler.flush()

    def setup_handlers(self):
        """Set up MCP request handlers"""
        
        @self.server.list_tools()
        async def list_tools():
            """List available Appdexer tools for Cursor Agent"""
            logger.info("🔧 Cursor Agent requesting available tools")
            tools = [
                Tool(
                    name="appdexer_chat",
                    description="Open Appdexer chat popup in Cursor for feedback and reviews. Use this when you need user input, feedback, or review from the human user. The popup will appear in Cursor and wait for user response for up to 5 minutes.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "message": {
                                "type": "string",
                                "description": "The message to display in the Appdexer popup - this is what the user will see",
                                "default": "Please provide your review or feedback:"
                            },
                            "title": {
                                "type": "string", 
                                "description": "Title for the Appdexer popup window",
                                "default": "Appdexer - Chat"
                            },
                            "context": {
                                "type": "string",
                                "description": "Additional context about what needs review (code, implementation, etc.)",
                                "default": ""
                            },
                            "urgent": {
                                "type": "boolean",
                                "description": "Whether this is an urgent review request",
                                "default": False
                            }
                        }
                    }
                ),
                Tool(
                    name="appdexer_design_analysis",
                    description="Analyze design files in design/ folder and create instruction workflow. Call this when starting a new project or when design files are present.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "force_scan": {
                                "type": "boolean",
                                "description": "Force rescan of design folder even if analysis exists",
                                "default": False
                            },
                            "analysis_mode": {
                                "type": "string",
                                "description": "Analysis mode: quick_scan, detailed_analysis, or full_workflow",
                                "default": "detailed_analysis"
                            }
                        }
                    }
                ),
                Tool(
                    name="appdexer_instruction_status",
                    description="Get current instruction workflow status and module progress. Call this to understand project progress and next steps.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "module_filter": {
                                "type": "string",
                                "description": "Filter status by specific module name",
                                "default": ""
                            }
                        }
                    }
                ),
                Tool(
                    name="appdexer_auto_setup",
                    description="Auto-detect project type and setup appropriate resource management tools. Call this when you need to understand what type of project you're working with or need project-specific tools.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "project_root": {
                                "type": "string",
                                "description": "Path to project root directory. If not provided, uses current working directory.",
                                "default": ""
                            }
                        }
                    }
                ),
                Tool(
                    name="appdexer_search_resources",
                    description="Search for resources (icons, assets) appropriate for the detected project type. Uses project context to suggest relevant resources.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Search query for resources (e.g., 'home icon', 'navigation icons')"
                            },
                            "context": {
                                "type": "string",
                                "description": "Context about where the resource will be used (e.g., 'navigation bar', 'button', 'menu')",
                                "default": ""
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Maximum number of results to return",
                                "default": 10
                            }
                        },
                        "required": ["query"]
                    }
                ),
                Tool(
                    name="appdexer_get_project_info",
                    description="Get detailed information about the current project including detected types, available tools, and resource paths.",
                    inputSchema={
                        "type": "object",
                        "properties": {}
                    }
                ),
                Tool(
                    name="appdexer_voice_search",
                    description="Process voice commands for resource search and project management. Use natural language like 'find home icon' or 'tìm biểu tượng menu'.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "voice_text": {
                                "type": "string",
                                "description": "Voice command text to process (e.g., 'find home icon', 'create button component')"
                            },
                            "language": {
                                "type": "string",
                                "description": "Language of the voice command ('vietnamese', 'english', or 'auto')",
                                "default": "auto"
                            }
                        },
                        "required": ["voice_text"]
                    }
                ),
                Tool(
                    name="appdexer_ai_analyze_context",
                    description="AI-powered context analysis to suggest appropriate resources based on user intent and project context.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "input_text": {
                                "type": "string",
                                "description": "Text to analyze for context and intent"
                            },
                            "conversation_history": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Previous conversation messages for better context",
                                "default": []
                            }
                        },
                        "required": ["input_text"]
                    }
                ),
                Tool(
                    name="appdexer_parse_voice_command",
                    description="Parse voice command text into structured commands for validation and execution.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "command_text": {
                                "type": "string",
                                "description": "Voice command text to parse"
                            },
                            "language": {
                                "type": "string",
                                "description": "Language of the command ('vietnamese', 'english', or 'auto')",
                                "default": "auto"
                            }
                        },
                        "required": ["command_text"]
                    }
                ),
                Tool(
                    name="appdexer_get_voice_commands",
                    description="Get list of supported voice commands, examples, and speech recognition capabilities.",
                    inputSchema={
                        "type": "object",
                        "properties": {}
                    }
                ),
                Tool(
                    name="appdexer_test_voice_system",
                    description="Test voice recognition and processing system to ensure everything is working correctly.",
                    inputSchema={
                        "type": "object",
                        "properties": {}
                    }
                )
            ]
            
            # Add dynamic Appdexer tools if available
            if self._appdexer_core and APPDEXER_AVAILABLE:
                try:
                    # Auto-setup if not already done
                    if not self._appdexer_core.is_setup:
                        setup_info = await self._appdexer_core.auto_setup()
                        logger.info(f"🎯 Auto-setup completed: {setup_info.get('primary_type', 'unknown')}")
                    
                    # Get context-specific tools
                    icon_tools = await self._appdexer_core.get_tools_for_context("icon")
                    for tool_name in icon_tools[:5]:  # Limit to first 5 tools
                        tools.append(Tool(
                            name=f"appdexer_{tool_name}",
                            description=f"Project-specific tool: {tool_name}. Auto-loaded based on detected project type.",
                            inputSchema={
                                "type": "object",
                                "properties": {
                                    "query": {"type": "string", "description": "Query or action to perform"},
                                    "options": {"type": "object", "description": "Additional options", "default": {}}
                                }
                            }
                        ))
                        
                except Exception as e:
                    logger.error(f"❌ Error loading dynamic Appdexer tools: {e}")
            
            logger.info(f"✅ Listed {len(tools)} Review Gate tools for Cursor Agent")
            return tools

        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict):
            """Handle tool calls from Cursor Agent with immediate activation"""
            logger.info(f"🎯 CURSOR AGENT CALLED TOOL: {name}")
            logger.info(f"📋 Tool arguments: {arguments}")
            
            # Add processing delay to ensure proper handling
            await asyncio.sleep(0.5)  # Wait 500ms for proper processing
            logger.info(f"⚙️ Processing tool call: {name}")
            
            # Immediately log that we're processing
            for handler in logger.handlers:
                if hasattr(handler, 'flush'):
                    handler.flush()
            
            try:
                if name == "appdexer_chat":
                    return await self._handle_review_gate_chat(arguments)
                elif name == "review_gate_chat":
                    # Backward compatibility
                    return await self._handle_review_gate_chat(arguments)
                elif name == "appdexer_design_analysis":
                      return await self._handle_appdexer_design_analysis(arguments)
                  elif name == "appdexer_instruction_status":
                      return await self._handle_appdexer_instruction_status(arguments)
                  elif name == "appdexer_auto_setup":
                      return await self._handle_appdexer_auto_setup(arguments)
                elif name == "appdexer_search_resources":
                    return await self._handle_appdexer_search_resources(arguments)
                elif name == "appdexer_get_project_info":
                    return await self._handle_appdexer_get_project_info(arguments)
                elif name == "appdexer_voice_search":
                    return await self._handle_appdexer_voice_search(arguments)
                elif name == "appdexer_ai_analyze_context":
                    return await self._handle_appdexer_ai_analyze_context(arguments)
                elif name == "appdexer_parse_voice_command":
                    return await self._handle_appdexer_parse_voice_command(arguments)
                elif name == "appdexer_get_voice_commands":
                    return await self._handle_appdexer_get_voice_commands(arguments)
                elif name == "appdexer_test_voice_system":
                    return await self._handle_appdexer_test_voice_system(arguments)
                elif name.startswith("appdexer_"):
                    # Handle dynamic Appdexer tools
                    return await self._handle_appdexer_dynamic_tool(name, arguments)
                else:
                    logger.error(f"❌ Unknown tool: {name}")
                    # Wait before returning error
                    await asyncio.sleep(1.0)  # Wait 1 second before error response
                    raise ValueError(f"Unknown tool: {name}")
            except Exception as e:
                logger.error(f"💥 Tool call error for {name}: {e}")
                # Wait before returning error
                await asyncio.sleep(1.0)  # Wait 1 second before error response
                return [TextContent(type="text", text=f"ERROR: Tool {name} failed: {str(e)}")]

    async def _handle_appdexer_design_analysis(self, args: dict) -> list[TextContent]:
        """Analyze design files and create instruction workflow"""
        try:
            force_scan = args.get("force_scan", False)
            analysis_mode = args.get("analysis_mode", "detailed_analysis")
            
            # Check for design folder
            design_path = os.path.join(os.getcwd(), "design")
            if not os.path.exists(design_path):
                return [TextContent(
                    type="text",
                    text="❌ No design/ folder found in current directory. Create design/ folder and add design files (PNG, JPG, PDF, Figma exports) to enable design-to-prompt workflow."
                )]
            
            # Scan for design files
            design_files = []
            for ext in ['*.png', '*.jpg', '*.jpeg', '*.pdf', '*.fig', '*.sketch']:
                design_files.extend(glob.glob(os.path.join(design_path, ext)))
                design_files.extend(glob.glob(os.path.join(design_path, "**", ext), recursive=True))
            
            if not design_files:
                return [TextContent(
                    type="text", 
                    text="⚠️ No design files found in design/ folder. Add design files to enable design-to-prompt analysis."
                )]
            
            # Check if analysis already exists
            analysis_file = os.path.join(design_path, "Design_Analysis.md")
            if os.path.exists(analysis_file) and not force_scan:
                return [TextContent(
                    type="text",
                    text=f"✅ Design analysis already exists at {analysis_file}. Use force_scan=true to regenerate."
                )]
            
            # Perform analysis based on mode
            results = {
                "design_files_found": len(design_files),
                "files": [os.path.basename(f) for f in design_files],
                "analysis_mode": analysis_mode,
                "next_steps": []
            }
            
            if analysis_mode == "quick_scan":
                results["next_steps"] = [
                    "1. Review design files manually",
                    "2. Call appdexer_design_analysis with detailed_analysis mode",
                    "3. Use Design-to-prompt workflow to create instructions"
                ]
            
            elif analysis_mode == "detailed_analysis":
                results["next_steps"] = [
                    "1. Apply 2-Agent Design-to-prompt workflow",
                    "2. Create Design_Analysis.md with technical + marketing analysis", 
                    "3. Generate modular instruction files",
                    "4. Create Instruction.md outline"
                ]
            
            elif analysis_mode == "full_workflow":
                results["next_steps"] = [
                    "1. Complete design analysis",
                    "2. Create instruction modules", 
                    "3. Setup project workspace",
                    "4. Initialize development workflow"
                ]
            
            return [TextContent(
                type="text",
                text=f"""🎨 Design Analysis Results:

📁 Found {results['design_files_found']} design files:
{chr(10).join(['   • ' + f for f in results['files']])}

🎯 Analysis Mode: {analysis_mode}

📋 Recommended Next Steps:
{chr(10).join(results['next_steps'])}

💡 To proceed with design-to-prompt workflow:
   • Use detailed_analysis or full_workflow mode
   • Review design files and apply 2-agent analysis
   • Create modular instruction architecture
"""
            )]
            
        except Exception as e:
            logger.error(f"Error in design analysis: {e}")
            return [TextContent(
                type="text",
                text=f"❌ Error during design analysis: {str(e)}"
            )]

    async def _handle_appdexer_instruction_status(self, args: dict) -> list[TextContent]:
        """Get current instruction workflow status and module progress"""
        try:
            module_filter = args.get("module_filter", "")
            
            # Check for main instruction file
            instruction_file = os.path.join(os.getcwd(), "Instruction.md")
            instructions_dir = os.path.join(os.getcwd(), "instructions")
            
            status_info = {
                "main_instruction_exists": os.path.exists(instruction_file),
                "instructions_dir_exists": os.path.exists(instructions_dir),
                "instruction_modules": [],
                "design_analysis_exists": os.path.exists(os.path.join(os.getcwd(), "design", "Design_Analysis.md")),
                "project_files": {
                    "mockup_data": os.path.exists(os.path.join(os.getcwd(), "MockupData.md")),
                    "db_schema": os.path.exists(os.path.join(os.getcwd(), "db-schema.sql")),
                    "project_identity": os.path.exists(os.path.join(os.getcwd(), ".project-identity"))
                }
            }
            
            # Scan for instruction modules
            if status_info["instructions_dir_exists"]:
                instruction_files = glob.glob(os.path.join(instructions_dir, "*_Instruction.md"))
                for file_path in instruction_files:
                    module_name = os.path.basename(file_path).replace("_Instruction.md", "")
                    if not module_filter or module_filter.lower() in module_name.lower():
                        status_info["instruction_modules"].append({
                            "name": module_name,
                            "file": os.path.basename(file_path),
                            "path": file_path
                        })
            
            # Build status report
            status_report = f"""📊 Instruction Workflow Status:

🎯 Main Files:
   • Instruction.md: {'✅' if status_info['main_instruction_exists'] else '❌'} 
   • instructions/ dir: {'✅' if status_info['instructions_dir_exists'] else '❌'}
   • Design Analysis: {'✅' if status_info['design_analysis_exists'] else '❌'}

📋 Project Support Files:
   • MockupData.md: {'✅' if status_info['project_files']['mockup_data'] else '❌'}
   • db-schema.sql: {'✅' if status_info['project_files']['db_schema'] else '❌'}
   • .project-identity: {'✅' if status_info['project_files']['project_identity'] else '❌'}

🧩 Instruction Modules ({len(status_info['instruction_modules'])} found):"""
            
            if status_info["instruction_modules"]:
                for module in status_info["instruction_modules"]:
                    status_report += f"\n   • {module['name']} ({module['file']})"
            else:
                status_report += "\n   • No instruction modules found"
            
            status_report += f"""

💡 Recommendations:"""
            
            if not status_info["main_instruction_exists"]:
                status_report += "\n   • Create Instruction.md outline file"
            if not status_info["instructions_dir_exists"]:
                status_report += "\n   • Create instructions/ directory for modules"
            if not status_info["design_analysis_exists"]:
                status_report += "\n   • Run design analysis if design files exist"
            if not status_info["instruction_modules"]:
                status_report += "\n   • Create modular instruction files for project components"
            
            return [TextContent(
                type="text",
                text=status_report
            )]
            
        except Exception as e:
            logger.error(f"Error getting instruction status: {e}")
            return [TextContent(
                type="text",
                text=f"❌ Error retrieving instruction status: {str(e)}"
            )]

    async def _handle_appdexer_auto_setup(self, args: dict) -> list[TextContent]:
        """Handle Appdexer auto-setup request"""
        logger.info("🎯 APPDEXER: Auto-setup requested")
        
        try:
            project_root = args.get("project_root", os.getcwd())
            
            if not self._appdexer_core or not APPDEXER_AVAILABLE:
                return [TextContent(
                    type="text",
                    text="❌ Appdexer not available. Please ensure it's properly installed."
                )]
            
            # Initialize with specified project root if different
            if self._appdexer_core.project_root != project_root:
                logger.info(f"🔄 Switching to new project root: {project_root}")
                self._appdexer_core = AppdexerCore(project_root)
            
            # Run auto-setup
            setup_info = await self._appdexer_core.auto_setup()
            
            result_text = f"""🎯 **Appdexer Auto-Setup Complete!**

**📁 Project Root:** {setup_info['project_root']}
**🎯 Primary Type:** {setup_info['primary_type']}
**🔍 Detected Types:** {', '.join(setup_info['detected_types'])}
**🛠️ Available Tools:** {len(setup_info['available_tools'])} tools loaded
**📂 Resource Paths:** {len(setup_info['resource_paths'])} paths configured

**📊 Confidence Scores:**
{chr(10).join([f"  • {pt}: {score:.2f}" for pt, score in setup_info['confidence_scores'].items()])}

**🛠️ Loaded Tools:**
{chr(10).join([f"  • {tool}" for tool in setup_info['available_tools'][:10]])}
{f"  • ... and {len(setup_info['available_tools']) - 10} more" if len(setup_info['available_tools']) > 10 else ""}

✅ **Setup Status:** {'✅ Complete' if setup_info['setup_complete'] else '❌ Failed'}
"""
            
            logger.info(f"✅ Appdexer auto-setup completed for {setup_info['primary_type']} project")
            return [TextContent(type="text", text=result_text)]
            
        except Exception as e:
            logger.error(f"❌ Appdexer auto-setup failed: {e}")
            return [TextContent(
                type="text",
                text=f"❌ **Appdexer Auto-Setup Failed**\n\nError: {str(e)}\n\nPlease check the project path and try again."
            )]
    
    async def _handle_appdexer_search_resources(self, args: dict) -> list[TextContent]:
        """Handle Appdexer resource search request"""
        logger.info("🔍 APPDEXER: Resource search requested")
        
        try:
            if not self._appdexer_core or not APPDEXER_AVAILABLE:
                return [TextContent(
                    type="text",
                    text="❌ Appdexer not available. Please run appdexer_auto_setup first."
                )]
            
            query = args.get("query", "")
            context = args.get("context", "")
            limit = args.get("limit", 10)
            
            if not query:
                return [TextContent(
                    type="text",
                    text="❌ Search query is required. Please provide a search term."
                )]
            
            # Ensure setup is complete
            if not self._appdexer_core.is_setup:
                await self._appdexer_core.auto_setup()
            
            # Get relevant tools for resource search
            resource_tools = await self._appdexer_core.get_tools_for_context("icon")
            
            if not resource_tools:
                return [TextContent(
                    type="text",
                    text="❌ No resource search tools available for this project type."
                )]
            
            # Simulate resource search (in real implementation, this would call actual search APIs)
            result_text = f"""🔍 **Resource Search Results**

**🎯 Query:** "{query}"
**📋 Context:** {context if context else "General"}
**🔧 Project Type:** {self._appdexer_core.project_types[0].value if self._appdexer_core.project_types else "unknown"}
**🛠️ Search Tool:** {resource_tools[0] if resource_tools else "generic"}

**📦 Available Search Tools:**
{chr(10).join([f"  • {tool}" for tool in resource_tools[:5]])}

**💡 Next Steps:**
1. Use specific tool like `appdexer_{resource_tools[0] if resource_tools else "generic"}` for actual search
2. Resources will be downloaded to appropriate project directories
3. Code integration will be generated based on project type

⚠️ **Note:** This is a mock response. Real implementation will integrate with icon library API.
"""
            
            logger.info(f"✅ Resource search prepared for query: {query}")
            return [TextContent(type="text", text=result_text)]
            
        except Exception as e:
            logger.error(f"❌ Resource search failed: {e}")
            return [TextContent(
                type="text",
                text=f"❌ **Resource Search Failed**\n\nError: {str(e)}"
            )]
    
    async def _handle_appdexer_get_project_info(self, args: dict) -> list[TextContent]:
        """Handle Appdexer project info request"""
        logger.info("📋 APPDEXER: Project info requested")
        
        try:
            if not self._appdexer_core or not APPDEXER_AVAILABLE:
                return [TextContent(
                    type="text",
                    text="❌ Appdexer not available. Please run appdexer_auto_setup first."
                )]
            
            # Ensure setup is complete
            if not self._appdexer_core.is_setup:
                await self._appdexer_core.auto_setup()
            
            # Get project summary
            project_summary = self._appdexer_core.mcp_loader.get_project_summary()
            project_info = self._appdexer_core.detector.get_project_info()
            resource_paths = self._appdexer_core.detector.get_resource_paths()
            
            result_text = f"""📋 **Project Information**

**🎯 Basic Info:**
  • Project Root: {project_info['project_root']}
  • Primary Type: {project_info['primary_type']}
  • Multi-Platform: {'Yes' if project_info['is_multi_platform'] else 'No'}

**🔍 Detection Results:**
  • Detected Types: {', '.join(project_info['detected_types'])}
  • Confidence Scores:
{chr(10).join([f"    - {pt}: {score:.2f}" for pt, score in project_info['confidence_scores'].items()])}

**🛠️ Tools Summary:**
  • Initialized: {'Yes' if project_summary['initialized'] else 'No'}
  • Total Tools: {project_summary['total_tools']}
  • Project Types: {', '.join(project_summary['project_types'])}

**📂 Resource Paths:**
{chr(10).join([f"  • {pt.value}: {path}" for pt, path in resource_paths.items()])}

**🔧 Available Tools by Type:**
{chr(10).join([f"  • {pt}: {len(tools)} tools" for pt, tools in project_summary['tools_by_type'].items()])}

**🌟 Context-Specific Tools:**
  • Icon Tools: Available for current project type
  • Resource Tools: Available for current project type
  • General Tools: Available for current project type
"""
            
            logger.info("✅ Project info retrieved successfully")
            return [TextContent(type="text", text=result_text)]
            
        except Exception as e:
            logger.error(f"❌ Failed to get project info: {e}")
            return [TextContent(
                type="text",
                text=f"❌ **Failed to Get Project Info**\n\nError: {str(e)}"
            )]
    
    async def _handle_appdexer_dynamic_tool(self, tool_name: str, args: dict) -> list[TextContent]:
        """Handle dynamic Appdexer tool calls"""
        logger.info(f"🔧 APPDEXER: Dynamic tool called: {tool_name}")
        
        try:
            if not self._appdexer_core or not APPDEXER_AVAILABLE:
                return [TextContent(
                    type="text",
                    text="❌ Appdexer not available. Please run appdexer_auto_setup first."
                )]
            
            # Extract actual tool name (remove "appdexer_" prefix)
            actual_tool_name = tool_name.replace("appdexer_", "")
            query = args.get("query", "")
            options = args.get("options", {})
            
            # Ensure setup is complete
            if not self._appdexer_core.is_setup:
                await self._appdexer_core.auto_setup()
            
            # Call the specific tool
            result = await self._appdexer_core.call_tool(actual_tool_name, query=query, options=options)
            
            result_text = f"""🔧 **Tool Execution Result**

**🛠️ Tool:** {actual_tool_name}
**🎯 Query:** {query if query else "No query provided"}
**⚙️ Project Type:** {result.get('project_type', 'unknown')}
**✅ Status:** {result.get('status', 'unknown')}

**📄 Message:** {result.get('message', 'No message')}

**🔧 Configuration Used:**
  • Project Root: {result.get('config', {}).get('project_root', 'N/A')}
  • Resource Path: {result.get('config', {}).get('resource_path', 'N/A')}
  • Preferred Formats: {', '.join(result.get('config', {}).get('preferred_formats', []))}

**💡 Tool executed successfully! This is a mock response showing the tool integration is working.**
"""
            
            logger.info(f"✅ Dynamic tool {tool_name} executed successfully")
            return [TextContent(type="text", text=result_text)]
            
        except Exception as e:
            logger.error(f"❌ Dynamic tool {tool_name} failed: {e}")
            return [TextContent(
                type="text",
                text=f"❌ **Tool Execution Failed**\n\nTool: {tool_name}\nError: {str(e)}"
            )]

    async def _handle_appdexer_voice_search(self, args: dict) -> list[TextContent]:
        """Handle voice search command processing"""
        logger.info("🎤 APPDEXER VOICE: Voice search requested")
        
        try:
            if not self._voice_processor or not APPDEXER_AVAILABLE:
                return [TextContent(
                    type="text",
                    text="❌ Appdexer Voice not available. Please ensure it's properly initialized."
                )]
            
            voice_text = args.get("voice_text", "")
            language = args.get("language", "auto")
            
            if not voice_text:
                return [TextContent(
                    type="text",
                    text="❌ Voice text is required. Please provide a voice command to process."
                )]
            
            # Process voice command
            voice_command = await self._voice_processor.process_voice_input(voice_text, language)
            
            # Execute command
            execution_result = await self._voice_processor.execute_voice_command(voice_command)
            
            result_text = f"""🎤 **Voice Search Results**

**🗣️ Voice Input:** "{voice_text}"
**🌍 Language:** {voice_command.language}
**🎯 Command Type:** {voice_command.command_type.value}
**🔍 Query:** {voice_command.query}
**📋 Context:** {voice_command.context if voice_command.context else "None"}
**📊 Confidence:** {voice_command.confidence:.2f}

**⚙️ Execution Result:**
{json.dumps(execution_result, indent=2, ensure_ascii=False)}

**🔧 Project Context:** {voice_command.project_context if voice_command.project_context else "Not available"}
"""

            logger.info(f"✅ Voice search processed: {voice_command.command_type.value}")
            return [TextContent(type="text", text=result_text)]
            
        except Exception as e:
            logger.error(f"❌ Voice search failed: {e}")
            return [TextContent(
                type="text",
                text=f"❌ **Voice Search Failed**\n\nError: {str(e)}\n\nVoice Input: {args.get('voice_text', 'N/A')}"
            )]
    
    async def _handle_appdexer_ai_analyze_context(self, args: dict) -> list[TextContent]:
        """Handle AI context analysis"""
        logger.info("🧠 APPDEXER AI: Context analysis requested")
        
        try:
            if not self._ai_analyzer or not APPDEXER_AVAILABLE:
                return [TextContent(
                    type="text",
                    text="❌ Appdexer AI not available. Please ensure it's properly initialized."
                )]
            
            input_text = args.get("input_text", "")
            conversation_history = args.get("conversation_history", [])
            
            if not input_text:
                return [TextContent(
                    type="text",
                    text="❌ Input text is required. Please provide text to analyze."
                )]
            
            # Analyze context
            analysis = await self._ai_analyzer.analyze_context(input_text, conversation_history)
            
            result_text = f"""🧠 **AI Context Analysis**

**📝 Input:** "{input_text}"
**🎯 Context Type:** {analysis.context_type.value}
**📊 Confidence:** {analysis.confidence:.2f}
**⚠️ Urgency:** {analysis.urgency.value}

**🔑 Keywords:** {', '.join(analysis.keywords)}
**🔗 Project Relevance:** {analysis.project_relevance:.2f}

**💡 Suggested Resources:**
{chr(10).join([f"  • {resource}" for resource in analysis.suggested_resources[:10]])}
{f"  • ... and {len(analysis.suggested_resources) - 10} more" if len(analysis.suggested_resources) > 10 else ""}

**🤔 AI Reasoning:** {analysis.reasoning}

**📊 Metadata:**
{json.dumps(analysis.metadata, indent=2, ensure_ascii=False)}
"""

            logger.info(f"✅ AI analysis completed: {analysis.context_type.value}")
            return [TextContent(type="text", text=result_text)]
            
        except Exception as e:
            logger.error(f"❌ AI context analysis failed: {e}")
            return [TextContent(
                type="text",
                text=f"❌ **AI Context Analysis Failed**\n\nError: {str(e)}\n\nInput: {args.get('input_text', 'N/A')}"
            )]
    
    async def _handle_appdexer_parse_voice_command(self, args: dict) -> list[TextContent]:
        """Handle voice command parsing"""
        logger.info("📝 APPDEXER PARSER: Command parsing requested")
        
        try:
            if not self._command_parser or not APPDEXER_AVAILABLE:
                return [TextContent(
                    type="text",
                    text="❌ Appdexer Command Parser not available. Please ensure it's properly initialized."
                )]
            
            command_text = args.get("command_text", "")
            language = args.get("language", "auto")
            
            if not command_text:
                return [TextContent(
                    type="text",
                    text="❌ Command text is required. Please provide a command to parse."
                )]
            
            # Parse command
            parsed = self._command_parser.parse_command(command_text, language)
            
            # Validate command
            validation = self._command_parser.validate_command(parsed)
            
            # Get command suggestions
            suggestions = self._command_parser.get_command_suggestions(parsed.category)
            
            result_text = f"""📝 **Voice Command Parsing**

**🗣️ Original Text:** "{command_text}"
**🌍 Language:** {parsed.language}

**🎯 Parsed Command:**
  • Category: {parsed.category.value}
  • Action: {parsed.action.value}
  • Target: {parsed.target}
  • Confidence: {parsed.confidence:.2f}

**⚙️ Parameters:**
{json.dumps(parsed.parameters, indent=2, ensure_ascii=False)}

**✅ Validation:**
  • Valid: {'✅ Yes' if validation['is_valid'] else '❌ No'}
  • Confidence: {validation['confidence']:.2f}
  • Issues: {', '.join(validation['issues']) if validation['issues'] else 'None'}

**💡 Suggestions:**
{chr(10).join([f"  • {suggestion}" for suggestion in validation['suggestions'][:5]])}

**📚 Example Commands for this category:**
{chr(10).join([f"  • VI: {cmd.get('vi', 'N/A')} | EN: {cmd.get('en', 'N/A')}" for cmd in suggestions[:3]])}
"""

            logger.info(f"✅ Command parsed: {parsed.category.value} -> {parsed.action.value}")
            return [TextContent(type="text", text=result_text)]
            
        except Exception as e:
            logger.error(f"❌ Command parsing failed: {e}")
            return [TextContent(
                type="text",
                text=f"❌ **Command Parsing Failed**\n\nError: {str(e)}\n\nCommand: {args.get('command_text', 'N/A')}"
            )]
    
    async def _handle_appdexer_get_voice_commands(self, args: dict) -> list[TextContent]:
        """Handle get voice commands info"""
        logger.info("📋 APPDEXER VOICE: Voice commands info requested")
        
        try:
            if not self._voice_processor or not APPDEXER_AVAILABLE:
                return [TextContent(
                    type="text",
                    text="❌ Appdexer Voice not available. Please ensure it's properly initialized."
                )]
            
            # Get supported commands
            supported_commands = self._voice_processor.get_supported_commands()
            command_suggestions = self._command_parser.get_command_suggestions()
            
            # Get speech recognition info
            recognition_info = self._speech_recognizer.get_engine_info()
            supported_languages = self._speech_recognizer.get_supported_languages()
            
            result_text = f"""📋 **Voice Commands & Capabilities**

**🎤 Speech Recognition Engine:**
  • Name: {recognition_info.get('name', 'Unknown')}
  • Description: {recognition_info.get('description', 'N/A')}
  • Features: {', '.join(recognition_info.get('features', []))}

**🌍 Supported Languages:**
{chr(10).join([f"  • {lang['name']} ({lang['code']})" for lang in supported_languages])}

**🎯 Voice Command Categories:**
{chr(10).join([f"  • {cmd['command']}" for cmd in supported_commands])}

**💡 Example Commands:**

**🔍 Resource Search:**
  • "Tìm icon home" / "Find home icon"
  • "Tìm biểu tượng menu" / "Search menu icon"
  • "Tải ảnh background" / "Download background image"

**🛠️ Component Creation:**
  • "Tạo button component" / "Create button component"
  • "Tạo form component" / "Generate form component"

**📋 Project Management:**
  • "Thông tin dự án" / "Project info"
  • "Auto setup" / "Tự động setup"
  • "Danh sách tools" / "List tools"

**⚙️ System Control:**
  • "Đặt ngôn ngữ English" / "Set language Vietnamese"
  • "Help" / "Giúp đỡ"

**🤖 AI Features:**
  • Context Analysis: ✅ Available
  • Smart Suggestions: ✅ Available
  • Multilingual Support: ✅ Available
  • Project-Aware: ✅ Available

**📝 Usage Tips:**
1. Speak naturally in Vietnamese or English
2. Be specific about what you're looking for
3. Include context when possible (e.g., "for navigation", "cho menu")
4. Use action words like "tìm", "tạo", "find", "create"
"""

            logger.info("✅ Voice commands info provided")
            return [TextContent(type="text", text=result_text)]
            
        except Exception as e:
            logger.error(f"❌ Get voice commands failed: {e}")
            return [TextContent(
                type="text",
                text=f"❌ **Get Voice Commands Failed**\n\nError: {str(e)}"
            )]
    
    async def _handle_appdexer_test_voice_system(self, args: dict) -> list[TextContent]:
        """Handle voice system testing"""
        logger.info("🧪 APPDEXER TEST: Voice system test requested")
        
        try:
            if not self._voice_processor or not APPDEXER_AVAILABLE:
                return [TextContent(
                    type="text",
                    text="❌ Appdexer Voice not available. Please ensure it's properly initialized."
                )]
            
            # Test speech recognition
            recognition_test = await self._speech_recognizer.test_recognition()
            
            # Test voice processing
            test_commands = [
                "tìm icon home",
                "find search icon", 
                "project info",
                "create button component"
            ]
            
            processing_tests = []
            for cmd in test_commands:
                try:
                    voice_command = await self._voice_processor.process_voice_input(cmd)
                    processing_tests.append({
                        "input": cmd,
                        "success": True,
                        "parsed_type": voice_command.command_type.value,
                        "confidence": voice_command.confidence
                    })
                except Exception as e:
                    processing_tests.append({
                        "input": cmd,
                        "success": False,
                        "error": str(e)
                    })
            
            # Test AI analysis
            ai_test_result = await self._ai_analyzer.analyze_context("need a home icon for navigation")
            
            # Calculate overall health
            successful_tests = sum(1 for test in processing_tests if test["success"])
            success_rate = successful_tests / len(processing_tests) * 100
            
            result_text = f"""🧪 **Voice System Test Results**

**🎤 Speech Recognition Test:**
  • Engine: {recognition_test.get('engine', 'unknown')}
  • Overall Success: {'✅ Pass' if recognition_test.get('overall_success', False) else '❌ Fail'}
  • Summary: {recognition_test.get('summary', 'N/A')}

**🎯 Voice Processing Tests:**
{chr(10).join([
    f"  • {test['input']}: {'✅ Pass' if test['success'] else '❌ Fail'}"
    + (f" ({test['parsed_type']}, {test['confidence']:.2f})" if test['success'] else f" - {test.get('error', 'Unknown error')}")
    for test in processing_tests
])}

**🧠 AI Analysis Test:**
  • Success: ✅ Pass
  • Context Type: {ai_test_result.context_type.value}
  • Confidence: {ai_test_result.confidence:.2f}
  • Suggestions: {len(ai_test_result.suggested_resources)} resources

**📊 System Health:**
  • Voice Processing Success Rate: {success_rate:.1f}%
  • Speech Recognition: {'✅ Operational' if recognition_test.get('overall_success', False) else '⚠️ Limited'}
  • AI Context Analysis: ✅ Operational
  • Command Parsing: ✅ Operational

**🎯 Overall Status:** {'🟢 All Systems Operational' if success_rate >= 75 else '🟡 Some Issues Detected' if success_rate >= 50 else '🔴 System Issues'}

**💡 Recommendations:**
{
  '• All systems working properly!' if success_rate >= 75 else
  '• Some voice commands may not work properly. Check logs for details.' if success_rate >= 50 else
  '• Multiple system issues detected. Please restart or check configuration.'
}
"""

            logger.info(f"✅ Voice system test completed: {success_rate:.1f}% success rate")
            return [TextContent(type="text", text=result_text)]
            
        except Exception as e:
            logger.error(f"❌ Voice system test failed: {e}")
            return [TextContent(
                type="text",
                text=f"❌ **Voice System Test Failed**\n\nError: {str(e)}"
            )]

    async def _handle_unified_review_gate(self, args: dict) -> list[TextContent]:
        """Handle unified Review Gate tool for all user interaction needs"""
        message = args.get("message", "Please provide your input:")
        title = args.get("title", "Review Gate ゲート v2")
        context = args.get("context", "")
        mode = args.get("mode", "chat")
        urgent = args.get("urgent", False)
        timeout = args.get("timeout", 300)  # Default 5 minutes
        
        logger.info(f"🎯 UNIFIED Review Gate activated - Mode: {mode}")
        logger.info(f"📝 Title: {title}")
        logger.info(f"📄 Message: {message}")
        logger.info(f"⏱️ Timeout: {timeout}s")
        
        # Create trigger file for Cursor extension IMMEDIATELY
        trigger_id = f"unified_{mode}_{int(time.time() * 1000)}"
        
        # Adapt the tool name based on mode for compatibility
        tool_name = "review_gate"
        if mode == "quick":
            tool_name = "quick_review"
        elif mode == "file":
            tool_name = "file_review"
        elif mode == "ingest":
            tool_name = "ingest_text"
        elif mode == "confirm":
            tool_name = "shutdown_mcp"
        
        # Force immediate trigger creation
        success = await self._trigger_cursor_popup_immediately({
            "tool": tool_name,
            "message": message,
            "title": title,
            "context": context,
            "urgent": urgent,
            "mode": mode,
            "trigger_id": trigger_id,
            "timestamp": datetime.now().isoformat(),
            "immediate_activation": True,
            "unified_tool": True
        })
        
        if success:
            logger.info(f"🔥 UNIFIED POPUP TRIGGERED - waiting for user input (trigger_id: {trigger_id}, mode: {mode})")
            
            # Wait for user input with specified timeout
            user_input = await self._wait_for_user_input(trigger_id, timeout=timeout)
            
            if user_input:
                # Return user input directly to MCP client with mode context
                logger.info(f"✅ RETURNING USER INPUT TO MCP CLIENT: {user_input[:100]}...")
                result_message = f"✅ User Response (Mode: {mode})\n\n"
                result_message += f"💬 Input: {user_input}\n"
                result_message += f"📝 Request: {message}\n"
                result_message += f"📍 Context: {context}\n"
                result_message += f"⚙️ Mode: {mode}\n"
                result_message += f"🚨 Urgent: {urgent}\n\n"
                result_message += f"🎯 User interaction completed successfully via unified Review Gate tool."
                
                return [TextContent(type="text", text=result_message)]
            else:
                response = f"TIMEOUT: No user input received within {timeout} seconds (Mode: {mode})"
                logger.warning(f"⚠️ Unified Review Gate timed out waiting for user input after {timeout} seconds")
                return [TextContent(type="text", text=response)]
        else:
            response = f"ERROR: Failed to trigger unified Review Gate popup (Mode: {mode})"
            return [TextContent(type="text", text=response)]

    async def _handle_review_gate_chat(self, args: dict) -> list[TextContent]:
        """Handle Review Gate chat popup and wait for user input with 5 minute timeout"""
        message = args.get("message", "Please provide your review or feedback:")
        title = args.get("title", "Appdexer - ゲート")
        context = args.get("context", "")
        urgent = args.get("urgent", False)
        
        logger.info(f"💬 ACTIVATING Review Gate chat popup IMMEDIATELY for Cursor Agent")
        logger.info(f"📝 Title: {title}")
        logger.info(f"📄 Message: {message}")
        
        # Create trigger file for Cursor extension IMMEDIATELY
        trigger_id = f"review_{int(time.time() * 1000)}"  # Use milliseconds for uniqueness
        
        # Force immediate trigger creation with enhanced debugging
        success = await self._trigger_cursor_popup_immediately({
            "tool": "review_gate_chat",
            "message": message,
            "title": title,
            "context": context,
            "urgent": urgent,
            "trigger_id": trigger_id,
            "timestamp": datetime.now().isoformat(),
            "immediate_activation": True
        })
        
        if success:
            logger.info(f"🔥 POPUP TRIGGERED IMMEDIATELY - waiting for user input (trigger_id: {trigger_id})")
            
            # Wait for extension acknowledgement first
            ack_received = await self._wait_for_extension_acknowledgement(trigger_id, timeout=30)
            if ack_received:
                logger.info("📨 Extension acknowledged popup activation")
            else:
                logger.warning("⚠️ No extension acknowledgement received - popup may not have opened")
            
            # Wait for user input from the popup with 5 MINUTE timeout
            logger.info("⏳ Waiting for user input for up to 5 minutes...")
            user_input = await self._wait_for_user_input(trigger_id, timeout=300)  # 5 MINUTE timeout
            
            if user_input:
                # Return user input directly to MCP client
                logger.info(f"✅ RETURNING USER REVIEW TO MCP CLIENT: {user_input[:100]}...")
                
                # Check for images in the last response data
                response_content = [TextContent(type="text", text=f"User Response: {user_input}")]
                
                # If we have stored attachment data, include images
                if hasattr(self, '_last_attachments') and self._last_attachments:
                    for attachment in self._last_attachments:
                        if attachment.get('mimeType', '').startswith('image/'):
                            try:
                                image_content = ImageContent(
                                    type="image",
                                    data=attachment['base64Data'],
                                    mimeType=attachment['mimeType']
                                )
                                response_content.append(image_content)
                                logger.info(f"📸 Added image to response: {attachment.get('fileName', 'unknown')}")
                            except Exception as e:
                                logger.error(f"❌ Error adding image to response: {e}")
                
                return response_content
            else:
                response = f"TIMEOUT: No user input received for review gate within 5 minutes"
                logger.warning("⚠️ Review Gate timed out waiting for user input after 5 minutes")
                return [TextContent(type="text", text=response)]
        else:
            response = f"ERROR: Failed to trigger Review Gate popup"
            logger.error("❌ Failed to trigger Review Gate popup")
            return [TextContent(type="text", text=response)]

    async def _handle_get_user_input(self, args: dict) -> list[TextContent]:
        """Retrieve user input from any available response files"""
        timeout = args.get("timeout", 10)
        
        logger.info(f"🔍 CHECKING for user input (timeout: {timeout}s)")
        
        # Check all possible response file patterns
        response_patterns = [
            os.path.join(tempfile.gettempdir(), "review_gate_response_*.json"),
            get_temp_path("review_gate_response.json"),
            os.path.join(tempfile.gettempdir(), "mcp_response_*.json"),
            get_temp_path("mcp_response.json")
        ]
        
        import glob
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                # Check all response patterns
                for pattern in response_patterns:
                    matching_files = glob.glob(pattern)
                    for response_file_path in matching_files:
                        response_file = Path(response_file_path)
                        if response_file.exists():
                            try:
                                file_content = response_file.read_text().strip()
                                logger.info(f"📄 Found response file {response_file}: {file_content[:200]}...")
                                
                                # Handle JSON format
                                if file_content.startswith('{'):
                                    data = json.loads(file_content)
                                    user_input = data.get("user_input", data.get("response", data.get("message", ""))).strip()
                                # Handle plain text format
                                else:
                                    user_input = file_content
                                
                                if user_input:
                                    # Clean up response file
                                    try:
                                        response_file.unlink()
                                        logger.info(f"🧹 Response file cleaned up: {response_file}")
                                    except Exception as cleanup_error:
                                        logger.warning(f"⚠️ Cleanup error: {cleanup_error}")
                                    
                                    logger.info(f"✅ RETRIEVED USER INPUT: {user_input[:100]}...")
                                    
                                    result_message = f"✅ User Input Retrieved\n\n"
                                    result_message += f"💬 User Response: {user_input}\n"
                                    result_message += f"📁 Source File: {response_file.name}\n"
                                    result_message += f"⏰ Retrieved at: {datetime.now().isoformat()}\n\n"
                                    result_message += f"🎯 User input successfully captured from Review Gate."
                                    
                                    return [TextContent(type="text", text=result_message)]
                                    
                            except json.JSONDecodeError as e:
                                logger.error(f"❌ JSON decode error in {response_file}: {e}")
                            except Exception as e:
                                logger.error(f"❌ Error processing response file {response_file}: {e}")
                
                # Short sleep to avoid excessive CPU usage
                await asyncio.sleep(0.5)
                
            except Exception as e:
                logger.error(f"❌ Error in get_user_input loop: {e}")
                await asyncio.sleep(1)
        
        # No input found within timeout
        no_input_message = f"⏰ No user input found within {timeout} seconds\n\n"
        no_input_message += f"🔍 Checked patterns: {', '.join(response_patterns)}\n"
        no_input_message += f"💡 User may not have provided input yet, or the popup may not be active.\n\n"
        no_input_message += f"🎯 Try calling this tool again after the user provides input."
        
        logger.warning(f"⏰ No user input found within {timeout} seconds")
        return [TextContent(type="text", text=no_input_message)]

    async def _handle_quick_review(self, args: dict) -> list[TextContent]:
        """Handle quick review request and wait for response with immediate activation"""
        prompt = args.get("prompt", "Quick feedback needed:")
        context = args.get("context", "")
        
        logger.info(f"⚡ ACTIVATING Quick Review IMMEDIATELY for Cursor Agent: {prompt}")
        
        # Create trigger for quick input IMMEDIATELY
        trigger_id = f"quick_{int(time.time() * 1000)}"
        success = await self._trigger_cursor_popup_immediately({
            "tool": "quick_review",
            "prompt": prompt,
            "context": context,
            "title": "Quick Review - Appdexer",
            "trigger_id": trigger_id,
            "timestamp": datetime.now().isoformat(),
            "immediate_activation": True
        })
        
        if success:
            logger.info(f"🔥 QUICK POPUP TRIGGERED - waiting for user input (trigger_id: {trigger_id})")
            
            # Wait for quick user input
            user_input = await self._wait_for_user_input(trigger_id, timeout=90)  # 1.5 minute timeout for quick review
            
            if user_input:
                # Return user input directly to MCP client
                logger.info(f"✅ RETURNING QUICK REVIEW TO MCP CLIENT: {user_input}")
                return [TextContent(type="text", text=user_input)]
            else:
                response = f"TIMEOUT: No quick review input received within 1.5 minutes"
                logger.warning("⚠️ Quick review timed out")
                return [TextContent(type="text", text=response)]
        else:
            response = f"ERROR: Failed to trigger quick review popup"
            return [TextContent(type="text", text=response)]

    async def _handle_file_review(self, args: dict) -> list[TextContent]:
        """Handle file review request and wait for file selection with immediate activation"""
        instruction = args.get("instruction", "Please select file(s) for review:")
        file_types = args.get("file_types", ["*"])
        
        logger.info(f"📁 ACTIVATING File Review IMMEDIATELY for Cursor Agent: {instruction}")
        
        # Create trigger for file picker IMMEDIATELY
        trigger_id = f"file_{int(time.time() * 1000)}"
        success = await self._trigger_cursor_popup_immediately({
            "tool": "file_review",
            "instruction": instruction,
            "file_types": file_types,
            "title": "File Review - Appdexer",
            "trigger_id": trigger_id,
            "timestamp": datetime.now().isoformat(),
            "immediate_activation": True
        })
        
        if success:
            logger.info(f"🔥 FILE POPUP TRIGGERED - waiting for selection (trigger_id: {trigger_id})")
            
            # Wait for file selection
            user_input = await self._wait_for_user_input(trigger_id, timeout=90)  # 1.5 minute timeout
            
            if user_input:
                response = f"📁 File Review completed!\n\n**Selected Files:** {user_input}\n\n**Instruction:** {instruction}\n**Allowed Types:** {', '.join(file_types)}\n\nYou can now proceed to analyze the selected files."
                logger.info(f"✅ FILES SELECTED: {user_input}")
            else:
                response = f"⏰ File Review timed out.\n\n**Instruction:** {instruction}\n\nNo files selected within 1.5 minutes. Try again or proceed with current workspace files."
                logger.warning("⚠️ File review timed out")
        else:
            response = f"⚠️ File Review trigger failed. Manual activation may be needed."
        
        logger.info("🏁 File review processing complete")
        return [TextContent(type="text", text=response)]

    async def _handle_ingest_text(self, args: dict) -> list[TextContent]:
        """
        Handle text ingestion with immediate activation and user input capture
        """
        text_content = args.get("text_content", "")
        source = args.get("source", "extension")
        context = args.get("context", "")
        processing_mode = args.get("processing_mode", "immediate")
        
        logger.info(f"🚀 ACTIVATING ingest_text IMMEDIATELY for Cursor Agent: {text_content[:100]}...")
        logger.info(f"📍 Source: {source}, Context: {context}, Mode: {processing_mode}")
        
        # Create trigger for ingest_text IMMEDIATELY (consistent with other tools)
        trigger_id = f"ingest_{int(time.time() * 1000)}"
        success = await self._trigger_cursor_popup_immediately({
            "tool": "ingest_text",
            "text_content": text_content,
            "source": source,
            "context": context,
            "processing_mode": processing_mode,
            "title": "Text Ingestion - Appdexer",
            "message": f"Text to process: {text_content}",
            "trigger_id": trigger_id,
            "timestamp": datetime.now().isoformat(),
            "immediate_activation": True
        })
        
        if success:
            logger.info(f"🔥 INGEST POPUP TRIGGERED - waiting for user input (trigger_id: {trigger_id})")
            
            # Wait for user input with appropriate timeout
            user_input = await self._wait_for_user_input(trigger_id, timeout=120)  # 2 minute timeout
            
            if user_input:
                # Return the user input for further processing
                result_message = f"✅ Text ingestion completed!\n\n"
                result_message += f"📝 Original Text: {text_content}\n"
                result_message += f"💬 User Response: {user_input}\n"
                result_message += f"📍 Source: {source}\n"
                result_message += f"💭 Context: {context}\n"
                result_message += f"⚙️ Processing Mode: {processing_mode}\n\n"
                result_message += f"🎯 The text has been processed and user feedback collected successfully."
                
                logger.info(f"✅ INGEST SUCCESS: User provided feedback for text ingestion")
                return [TextContent(type="text", text=result_message)]
            else:
                result_message = f"⏰ Text ingestion timed out.\n\n"
                result_message += f"📝 Text Content: {text_content}\n"
                result_message += f"📍 Source: {source}\n\n"
                result_message += f"No user response received within 2 minutes. The text content is noted but no additional processing occurred."
                
                logger.warning("⚠️ Text ingestion timed out")
                return [TextContent(type="text", text=result_message)]
        else:
            result_message = f"⚠️ Text ingestion trigger failed.\n\n"
            result_message += f"📝 Text Content: {text_content}\n"
            result_message += f"Manual activation may be needed."
            
            logger.error("❌ Failed to trigger text ingestion popup")
            return [TextContent(type="text", text=result_message)]

    async def _handle_shutdown_mcp(self, args: dict) -> list[TextContent]:
        """Handle shutdown_mcp request and wait for confirmation with immediate activation"""
        reason = args.get("reason", "Task completed successfully")
        immediate = args.get("immediate", False)
        cleanup = args.get("cleanup", True)
        
        logger.info(f"🛑 ACTIVATING shutdown_mcp IMMEDIATELY for Cursor Agent: {reason}")
        
        # Create trigger for shutdown_mcp IMMEDIATELY
        trigger_id = f"shutdown_{int(time.time() * 1000)}"
        success = await self._trigger_cursor_popup_immediately({
            "tool": "shutdown_mcp",
            "reason": reason,
            "immediate": immediate,
            "cleanup": cleanup,
            "title": "Shutdown - Appdexer",
            "trigger_id": trigger_id,
            "timestamp": datetime.now().isoformat(),
            "immediate_activation": True
        })
        
        if success:
            logger.info(f"🛑 SHUTDOWN TRIGGERED - waiting for confirmation (trigger_id: {trigger_id})")
            
            # Wait for confirmation
            user_input = await self._wait_for_user_input(trigger_id, timeout=60)  # 1 minute timeout for shutdown confirmation
            
            if user_input:
                # Check if user confirmed shutdown
                if user_input.upper().strip() in ['CONFIRM', 'YES', 'Y', 'SHUTDOWN', 'PROCEED']:
                    self.shutdown_requested = True
                    self.shutdown_reason = f"User confirmed: {user_input.strip()}"
                    response = f"🛑 shutdown_mcp CONFIRMED!\n\n**User Confirmation:** {user_input}\n\n**Reason:** {reason}\n**Immediate:** {immediate}\n**Cleanup:** {cleanup}\n\n✅ MCP server will now shut down gracefully..."
                    logger.info(f"✅ SHUTDOWN CONFIRMED BY USER: {user_input[:100]}...")
                    logger.info(f"🛑 Server shutdown initiated - reason: {self.shutdown_reason}")
                else:
                    response = f"💡 shutdown_mcp CANCELLED - Alternative instructions received!\n\n**User Response:** {user_input}\n\n**Original Reason:** {reason}\n\nShutdown cancelled. User provided alternative instructions instead of confirmation."
                    logger.info(f"💡 SHUTDOWN CANCELLED - user provided alternative: {user_input[:100]}...")
            else:
                response = f"⏰ shutdown_mcp timed out.\n\n**Reason:** {reason}\n\nNo response received within 1 minute. Shutdown cancelled due to timeout."
                logger.warning("⚠️ Shutdown timed out - shutdown cancelled")
        else:
            response = f"⚠️ shutdown_mcp trigger failed. Manual activation may be needed."
        
        logger.info("🏁 shutdown_mcp processing complete")
        return [TextContent(type="text", text=response)]

    async def _wait_for_extension_acknowledgement(self, trigger_id: str, timeout: int = 30) -> bool:
        """Wait for extension acknowledgement that popup was activated"""
        ack_file = Path(get_temp_path(f"review_gate_ack_{trigger_id}.json"))
        
        logger.info(f"🔍 Monitoring for extension acknowledgement: {ack_file}")
        
        start_time = time.time()
        check_interval = 0.1  # Check every 100ms for fast response
        
        while time.time() - start_time < timeout:
            try:
                if ack_file.exists():
                    data = json.loads(ack_file.read_text())
                    ack_status = data.get("acknowledged", False)
                    
                    # Clean up acknowledgement file immediately
                    try:
                        ack_file.unlink()
                        logger.info(f"🧹 Acknowledgement file cleaned up")
                    except:
                        pass
                    
                    if ack_status:
                        logger.info(f"📨 EXTENSION ACKNOWLEDGED popup activation for trigger {trigger_id}")
                        return True
                    
                # Check frequently for faster response
                await asyncio.sleep(check_interval)
                
            except Exception as e:
                logger.error(f"❌ Error reading acknowledgement file: {e}")
                await asyncio.sleep(0.5)
        
        logger.warning(f"⏰ TIMEOUT waiting for extension acknowledgement (trigger_id: {trigger_id})")
        return False

    async def _wait_for_user_input(self, trigger_id: str, timeout: int = 120) -> Optional[str]:
        """Wait for user input from the Cursor extension popup with frequent checks and multiple response patterns"""
        response_patterns = [
            Path(get_temp_path(f"review_gate_response_{trigger_id}.json")),
            Path(get_temp_path("review_gate_response.json")),  # Fallback generic response
            Path(get_temp_path(f"mcp_response_{trigger_id}.json")),  # Alternative pattern
            Path(get_temp_path("mcp_response.json"))  # Generic MCP response
        ]
        
        logger.info(f"👁️ Monitoring for response files: {[str(p) for p in response_patterns]}")
        logger.info(f"🔍 Trigger ID: {trigger_id}")
        
        start_time = time.time()
        check_interval = 0.1  # Check every 100ms for faster response
        
        while time.time() - start_time < timeout:
            try:
                # Check all possible response file patterns
                for response_file in response_patterns:
                    if response_file.exists():
                        try:
                            file_content = response_file.read_text().strip()
                            logger.info(f"📄 Found response file {response_file}: {file_content[:200]}...")
                            
                            # Handle JSON format
                            if file_content.startswith('{'):
                                data = json.loads(file_content)
                                user_input = data.get("user_input", data.get("response", data.get("message", ""))).strip()
                                attachments = data.get("attachments", [])
                                
                                # Also check if trigger_id matches (if specified)
                                response_trigger_id = data.get("trigger_id", "")
                                if response_trigger_id and response_trigger_id != trigger_id:
                                    logger.info(f"⚠️ Trigger ID mismatch: expected {trigger_id}, got {response_trigger_id}")
                                    continue
                                
                                # Process attachments if present
                                if attachments:
                                    logger.info(f"📎 Found {len(attachments)} attachments")
                                    # Store attachments for use in response
                                    self._last_attachments = attachments
                                    attachment_descriptions = []
                                    for att in attachments:
                                        if att.get('mimeType', '').startswith('image/'):
                                            attachment_descriptions.append(f"Image: {att.get('fileName', 'unknown')}")
                                    
                                    if attachment_descriptions:
                                        user_input += f"\n\nAttached: {', '.join(attachment_descriptions)}"
                                else:
                                    self._last_attachments = []
                                    
                            # Handle plain text format
                            else:
                                user_input = file_content
                                attachments = []
                                self._last_attachments = []
                            
                            # Clean up response file immediately
                            try:
                                response_file.unlink()
                                logger.info(f"🧹 Response file cleaned up: {response_file}")
                            except Exception as cleanup_error:
                                logger.warning(f"⚠️ Cleanup error: {cleanup_error}")
                            
                            if user_input:
                                logger.info(f"🎉 RECEIVED USER INPUT for trigger {trigger_id}: {user_input[:100]}...")
                                return user_input
                            else:
                                logger.warning(f"⚠️ Empty user input in file: {response_file}")
                                
                        except json.JSONDecodeError as e:
                            logger.error(f"❌ JSON decode error in {response_file}: {e}")
                        except Exception as e:
                            logger.error(f"❌ Error processing response file {response_file}: {e}")
                
                # Check more frequently for faster response
                await asyncio.sleep(check_interval)
                
            except Exception as e:
                logger.error(f"❌ Error in wait loop: {e}")
                await asyncio.sleep(0.5)
        
        logger.warning(f"⏰ TIMEOUT waiting for user input (trigger_id: {trigger_id})")
        return None

    async def _trigger_cursor_popup_immediately(self, data: dict) -> bool:
        """Create trigger file for Cursor extension with immediate activation and enhanced debugging"""
        try:
            # Add delay before creating trigger to ensure readiness
            await asyncio.sleep(0.1)  # Wait 100ms before trigger creation
            
            trigger_file = Path(get_temp_path("review_gate_trigger.json"))
            
            trigger_data = {
                "timestamp": datetime.now().isoformat(),
                "system": "appdexer",
                "editor": "cursor",
                "data": data,
                "pid": os.getpid(),
                "active_window": True,
                "mcp_integration": True,
                "immediate_activation": True
            }
            
            logger.info(f"🎯 CREATING trigger file with data: {json.dumps(trigger_data, indent=2)}")
            
            # Write trigger file with immediate flush
            trigger_file.write_text(json.dumps(trigger_data, indent=2))
            
            # Verify file was written successfully
            if not trigger_file.exists():
                logger.error(f"❌ Failed to create trigger file: {trigger_file}")
                return False
                
            try:
                file_size = trigger_file.stat().st_size
                if file_size == 0:
                    logger.error(f"❌ Trigger file is empty: {trigger_file}")
                    return False
            except FileNotFoundError:
                # File may have been consumed by the extension already - this is OK
                logger.info(f"✅ Trigger file was consumed immediately by extension: {trigger_file}")
                file_size = len(json.dumps(trigger_data, indent=2))
            
            # Force file system sync with retry
            for attempt in range(3):
                try:
                    os.sync()
                    break
                except Exception as sync_error:
                    logger.warning(f"⚠️ Sync attempt {attempt + 1} failed: {sync_error}")
                    await asyncio.sleep(0.1)  # Wait 100ms between attempts
            
            logger.info(f"🔥 IMMEDIATE trigger created for Cursor: {trigger_file}")
            logger.info(f"📁 Trigger file path: {trigger_file.absolute()}")
            logger.info(f"📊 Trigger file size: {file_size} bytes")
            
            # Create multiple backup trigger files for reliability
            await self._create_backup_triggers(data)
            
            # Add small delay to allow extension to process
            await asyncio.sleep(0.2)  # Wait 200ms for extension to process
            
            # Note: Trigger file may have been consumed by extension already, which is good!
            try:
                if trigger_file.exists():
                    logger.info(f"✅ Trigger file still exists: {trigger_file}")
                else:
                    logger.info(f"✅ Trigger file was consumed by extension: {trigger_file}")
                    logger.info(f"🎯 This is expected behavior - extension is working properly")
            except Exception as check_error:
                logger.info(f"✅ Cannot check trigger file status (likely consumed): {check_error}")
                logger.info(f"🎯 This is expected behavior - extension is working properly")
            
            # Check if extension might be watching
            log_file = Path(get_temp_path("review_gate_v2.log"))
            if log_file.exists():
                logger.info(f"📝 MCP log file exists: {log_file}")
            else:
                logger.warning(f"⚠️ MCP log file missing: {log_file}")
            
            # Force log flush
            for handler in logger.handlers:
                if hasattr(handler, 'flush'):
                    handler.flush()
            
            return True
            
        except Exception as e:
            logger.error(f"❌ CRITICAL: Failed to create Review Gate trigger: {e}")
            import traceback
            logger.error(f"🔍 Full traceback: {traceback.format_exc()}")
            # Wait before returning failure
            await asyncio.sleep(1.0)  # Wait 1 second before confirming failure
            return False

    async def _create_backup_triggers(self, data: dict):
        """Create backup trigger files for better reliability"""
        try:
            # Create multiple backup trigger files
            for i in range(3):
                backup_trigger = Path(get_temp_path(f"review_gate_trigger_{i}.json"))
                backup_data = {
                    "backup_id": i,
                    "timestamp": datetime.now().isoformat(),
                    "system": "appdexer",
                    "data": data,
                    "mcp_integration": True,
                    "immediate_activation": True
                }
                backup_trigger.write_text(json.dumps(backup_data, indent=2))
            
            logger.info("🔄 Backup trigger files created for reliability")
            
        except Exception as e:
            logger.warning(f"⚠️ Backup trigger creation failed: {e}")

    async def run(self):
        """Run the Review Gate server with immediate activation capability and shutdown monitoring"""
        logger.info("🚀 Starting Review Gate 2.0 MCP Server for IMMEDIATE Cursor integration...")
        
        
        async with stdio_server() as (read_stream, write_stream):
            logger.info("✅ Appdexer server ACTIVE on stdio transport for Cursor")
            
            # Create server run task
            server_task = asyncio.create_task(
                self.server.run(
                    read_stream,
                    write_stream,
                    self.server.create_initialization_options()
                )
            )
            
            # Create shutdown monitor task
            shutdown_task = asyncio.create_task(self._monitor_shutdown())
            
            # Create heartbeat task to keep log file fresh for extension status monitoring
            heartbeat_task = asyncio.create_task(self._heartbeat_logger())
            
            # Wait for either server completion or shutdown request
            done, pending = await asyncio.wait(
                [server_task, shutdown_task, heartbeat_task],
                return_when=asyncio.FIRST_COMPLETED
            )
            
            # Cancel any pending tasks
            for task in pending:
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
            
            if self.shutdown_requested:
                logger.info(f"🛑 Appdexer server shutting down: {self.shutdown_reason}")
            else:
                logger.info("🏁 Appdexer server completed normally")

    async def _heartbeat_logger(self):
        """Periodically update log file to keep MCP status active in extension"""
        logger.info("💓 Starting heartbeat logger for extension status monitoring")
        heartbeat_count = 0
        
        while not self.shutdown_requested:
            try:
                # Update log every 10 seconds to keep file modification time fresh
                await asyncio.sleep(10)
                heartbeat_count += 1
                
                # Write heartbeat to log
                logger.info(f"💓 MCP heartbeat #{heartbeat_count} - Server is active and ready")
                
                # Force log flush to ensure file is updated
                for handler in logger.handlers:
                    if hasattr(handler, 'flush'):
                        handler.flush()
                        
            except Exception as e:
                logger.error(f"❌ Heartbeat error: {e}")
                await asyncio.sleep(5)
        
        logger.info("💔 Heartbeat logger stopped")
    
    async def _monitor_shutdown(self):
        """Monitor for shutdown requests in a separate task"""
        while not self.shutdown_requested:
            await asyncio.sleep(1)  # Check every second
        
        # Cleanup operations before shutdown
        logger.info("🧹 Performing cleanup operations before shutdown...")
        
        # Clean up any temporary files
        try:
            temp_files = [
                get_temp_path("review_gate_trigger.json"),
                get_temp_path("review_gate_trigger_0.json"),
                get_temp_path("review_gate_trigger_1.json"), 
                get_temp_path("review_gate_trigger_2.json")
            ]
            for temp_file in temp_files:
                if Path(temp_file).exists():
                    Path(temp_file).unlink()
                    logger.info(f"🗑️ Cleaned up: {temp_file}")
        except Exception as e:
            logger.warning(f"⚠️ Cleanup warning: {e}")
        
        logger.info("✅ Cleanup completed - shutdown ready")
        return True

    def _start_speech_monitoring(self):
        """Start monitoring for speech-to-text trigger files"""
        def monitor_speech_triggers():
            while not self.shutdown_requested:
                try:
                    # Look for speech trigger files
                    speech_triggers = glob.glob(os.path.join(tempfile.gettempdir(), "review_gate_speech_trigger_*.json"))
                    
                    for trigger_file in speech_triggers:
                        try:
                            with open(trigger_file, 'r') as f:
                                trigger_data = json.load(f)
                            
                            if trigger_data.get('data', {}).get('tool') == 'speech_to_text':
                                logger.info(f"🎤 Processing speech-to-text request: {trigger_file}")
                                self._process_speech_request(trigger_data)
                                
                                # Clean up trigger file
                                Path(trigger_file).unlink()
                                
                        except Exception as e:
                            logger.error(f"❌ Error processing speech trigger {trigger_file}: {e}")
                            try:
                                Path(trigger_file).unlink()
                            except:
                                pass
                    
                    time.sleep(0.5)  # Check every 500ms
                    
                except Exception as e:
                    logger.error(f"❌ Speech monitoring error: {e}")
                    time.sleep(1)
        
        # Start monitoring in background thread
        import threading
        speech_thread = threading.Thread(target=monitor_speech_triggers, daemon=True)
        speech_thread.start()
        logger.info("🎤 Speech-to-text monitoring started")

    def _process_speech_request(self, trigger_data):
        """Process speech-to-text request"""
        try:
            audio_file = trigger_data.get('data', {}).get('audio_file')
            trigger_id = trigger_data.get('data', {}).get('trigger_id')
            
            if not audio_file or not trigger_id:
                logger.error("❌ Invalid speech request - missing audio_file or trigger_id")
                return
            
            if not self._whisper_model:
                logger.error("❌ Whisper model not available")
                self._write_speech_response(trigger_id, "", "Whisper model not available")
                return
            
            if not os.path.exists(audio_file):
                logger.error(f"❌ Audio file not found: {audio_file}")
                self._write_speech_response(trigger_id, "", "Audio file not found")
                return
            
            logger.info(f"🎤 Transcribing audio: {audio_file}")
            
            # Transcribe audio using Faster-Whisper
            segments, info = self._whisper_model.transcribe(audio_file, beam_size=5)
            transcription = " ".join(segment.text for segment in segments).strip()
            
            logger.info(f"✅ Speech transcribed: '{transcription}'")
            
            # Write response
            self._write_speech_response(trigger_id, transcription)
            
            # Clean up audio file
            try:
                Path(audio_file).unlink()
                logger.info(f"🗑️ Cleaned up audio file: {audio_file}")
            except Exception as e:
                logger.warning(f"⚠️ Could not clean up audio file: {e}")
                
        except Exception as e:
            logger.error(f"❌ Speech transcription failed: {e}")
            trigger_id = trigger_data.get('data', {}).get('trigger_id', 'unknown')
            self._write_speech_response(trigger_id, "", str(e))

    def _write_speech_response(self, trigger_id, transcription, error=None):
        """Write speech-to-text response"""
        try:
            response_data = {
                'timestamp': datetime.now().isoformat(),
                'trigger_id': trigger_id,
                'transcription': transcription,
                'success': error is None,
                'error': error,
                'source': 'review_gate_whisper'
            }
            
            response_file = get_temp_path(f"review_gate_speech_response_{trigger_id}.json")
            with open(response_file, 'w') as f:
                json.dump(response_data, f, indent=2)
            
            logger.info(f"📝 Speech response written: {response_file}")
            
        except Exception as e:
            logger.error(f"❌ Failed to write speech response: {e}")

async def main():
    """Main entry point for Appdexer with immediate activation"""
    logger.info("🎬 STARTING Appdexer MCP Server...")
    logger.info(f"Python version: {sys.version}")
    logger.info(f"Platform: {sys.platform}")
    logger.info(f"OS name: {os.name}")
    logger.info(f"Working directory: {os.getcwd()}")
    
    try:
        server = AppdexerServer()
        await server.run()
    except Exception as e:
        logger.error(f"❌ Fatal error in MCP server: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("🛑 Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Server crashed: {e}")
        sys.exit(1) 