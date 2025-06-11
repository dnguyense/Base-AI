import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import re
import time

logger = logging.getLogger(__name__)

class VoiceCommandType(Enum):
    SEARCH_ICON = "search_icon"
    FIND_RESOURCE = "find_resource" 
    DOWNLOAD_ASSET = "download_asset"
    CREATE_COMPONENT = "create_component"
    ORGANIZE_RESOURCES = "organize_resources"
    GET_PROJECT_INFO = "get_project_info"
    UNKNOWN = "unknown"

@dataclass
class VoiceCommand:
    """Parsed voice command với context"""
    command_type: VoiceCommandType
    query: str
    context: str = ""
    confidence: float = 0.0
    language: str = "vi"
    project_context: Optional[str] = None
    parameters: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.parameters is None:
            self.parameters = {}

class VoiceProcessor:
    """Main voice processing engine cho Appdexer"""
    
    def __init__(self, appdexer_core=None):
        self.appdexer_core = appdexer_core
        self.command_patterns = self._initialize_patterns()
        self.processing_cache = {}
        self.last_processed_time = 0
        
    def _initialize_patterns(self) -> Dict[str, List[Dict]]:
        """Initialize voice command patterns cho Vietnamese và English"""
        
        return {
            "vietnamese": [
                {
                    "type": VoiceCommandType.SEARCH_ICON,
                    "patterns": [
                        r"tìm icon (.+)",
                        r"tìm kiếm icon (.+)", 
                        r"tìm biểu tượng (.+)",
                        r"tìm (.+) icon",
                        r"cần icon (.+)",
                        r"có icon (.+) không",
                        r"kiếm icon (.+)",
                    ],
                    "contexts": [
                        r"cho (.+)",
                        r"trong (.+)",
                        r"ở (.+)",
                        r"của (.+)",
                    ]
                },
                {
                    "type": VoiceCommandType.FIND_RESOURCE,
                    "patterns": [
                        r"tìm tài nguyên (.+)",
                        r"tìm resource (.+)",
                        r"tìm ảnh (.+)",
                        r"tìm file (.+)",
                        r"cần (.+) cho dự án",
                    ]
                },
                {
                    "type": VoiceCommandType.DOWNLOAD_ASSET,
                    "patterns": [
                        r"tải (.+)",
                        r"tải về (.+)",
                        r"download (.+)",
                        r"lấy (.+)",
                        r"tải xuống (.+)",
                    ]
                },
                {
                    "type": VoiceCommandType.CREATE_COMPONENT,
                    "patterns": [
                        r"tạo component (.+)",
                        r"tạo thành phần (.+)",
                        r"tạo (.+) component",
                        r"sinh (.+) component",
                        r"generate (.+) component",
                    ]
                },
                {
                    "type": VoiceCommandType.GET_PROJECT_INFO,
                    "patterns": [
                        r"thông tin dự án",
                        r"project info",
                        r"dự án gì",
                        r"loại dự án",
                        r"project type",
                        r"setup gì",
                        r"đã setup chưa",
                    ]
                }
            ],
            "english": [
                {
                    "type": VoiceCommandType.SEARCH_ICON,
                    "patterns": [
                        r"find (.+) icon",
                        r"search (.+) icon",
                        r"look for (.+) icon",
                        r"find icon (.+)",
                        r"search icon (.+)",
                        r"need (.+) icon",
                        r"get (.+) icon",
                    ],
                    "contexts": [
                        r"for (.+)",
                        r"in (.+)",
                        r"on (.+)",
                        r"of (.+)",
                    ]
                },
                {
                    "type": VoiceCommandType.FIND_RESOURCE,
                    "patterns": [
                        r"find (.+) resource",
                        r"search (.+) asset",
                        r"find (.+) image",
                        r"look for (.+)",
                        r"need (.+) for project",
                    ]
                },
                {
                    "type": VoiceCommandType.DOWNLOAD_ASSET,
                    "patterns": [
                        r"download (.+)",
                        r"get (.+)",
                        r"fetch (.+)",
                        r"retrieve (.+)",
                        r"pull (.+)",
                    ]
                },
                {
                    "type": VoiceCommandType.CREATE_COMPONENT,
                    "patterns": [
                        r"create (.+) component",
                        r"generate (.+) component",
                        r"make (.+) component",
                        r"build (.+) component",
                    ]
                },
                {
                    "type": VoiceCommandType.GET_PROJECT_INFO,
                    "patterns": [
                        r"project info",
                        r"project information", 
                        r"what project",
                        r"project type",
                        r"project setup",
                        r"setup info",
                    ]
                }
            ]
        }
    
    async def process_voice_input(self, transcription: str, language: str = "auto") -> VoiceCommand:
        """Process voice transcription thành structured command"""
        
        logger.info(f"🎤 Processing voice input: '{transcription}' (lang: {language})")
        
        # Detect language if auto
        if language == "auto":
            language = self._detect_language(transcription)
            
        # Clean và normalize input
        cleaned_input = self._clean_input(transcription)
        
        # Parse command
        command = self._parse_command(cleaned_input, language)
        
        # Add project context if available
        if self.appdexer_core and self.appdexer_core.is_setup:
            command.project_context = self._get_project_context()
            
        # Cache result
        self._cache_command(transcription, command)
        
        logger.info(f"✅ Parsed command: {command.command_type.value} - '{command.query}'")
        return command
    
    def _detect_language(self, text: str) -> str:
        """Simple language detection dựa trên từ khóa"""
        
        vietnamese_keywords = [
            "tìm", "kiếm", "tài", "nguyên", "tạo", "icon", "biểu", "tượng", 
            "dự", "án", "thông", "tin", "cho", "trong", "của", "cần"
        ]
        
        english_keywords = [
            "find", "search", "icon", "resource", "create", "project", 
            "info", "for", "in", "of", "need", "get", "download"
        ]
        
        text_lower = text.lower()
        
        vi_matches = sum(1 for keyword in vietnamese_keywords if keyword in text_lower)
        en_matches = sum(1 for keyword in english_keywords if keyword in text_lower)
        
        return "vietnamese" if vi_matches > en_matches else "english"
    
    def _clean_input(self, text: str) -> str:
        """Clean và normalize voice input"""
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Convert common speech patterns
        replacements = {
            "home page": "home",
            "navigation bar": "navigation", 
            "menu bar": "menu",
            "search box": "search",
            "user profile": "profile",
            "settings page": "settings",
        }
        
        text_lower = text.lower()
        for pattern, replacement in replacements.items():
            text_lower = text_lower.replace(pattern, replacement)
            
        return text_lower
    
    def _parse_command(self, text: str, language: str) -> VoiceCommand:
        """Parse cleaned text thành VoiceCommand"""
        
        patterns = self.command_patterns.get(language, self.command_patterns["english"])
        
        for pattern_group in patterns:
            command_type = pattern_group["type"]
            
            for pattern in pattern_group["patterns"]:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    query = match.group(1) if match.groups() else text
                    
                    # Extract context if available
                    context = self._extract_context(text, pattern_group.get("contexts", []))
                    
                    # Calculate confidence based on pattern match
                    confidence = self._calculate_confidence(text, pattern, match)
                    
                    return VoiceCommand(
                        command_type=command_type,
                        query=query.strip(),
                        context=context,
                        confidence=confidence,
                        language=language,
                        parameters=self._extract_parameters(text, command_type)
                    )
        
        # If no pattern matches, return unknown command
        return VoiceCommand(
            command_type=VoiceCommandType.UNKNOWN,
            query=text,
            confidence=0.0,
            language=language
        )
    
    def _extract_context(self, text: str, context_patterns: List[str]) -> str:
        """Extract context từ voice input"""
        
        for pattern in context_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
                
        return ""
    
    def _calculate_confidence(self, text: str, pattern: str, match: re.Match) -> float:
        """Calculate confidence score cho pattern match"""
        
        base_confidence = 0.7
        
        # Boost confidence for exact matches
        if match.group(0).lower() == text.lower():
            base_confidence += 0.2
            
        # Boost for longer queries (more specific)
        query_length = len(match.group(1)) if match.groups() else len(text)
        if query_length > 10:
            base_confidence += 0.1
            
        return min(base_confidence, 1.0)
    
    def _extract_parameters(self, text: str, command_type: VoiceCommandType) -> Dict[str, Any]:
        """Extract additional parameters từ voice input"""
        
        params = {}
        
        # Extract size preferences
        size_patterns = ["nhỏ", "vừa", "lớn", "small", "medium", "large", "big"]
        for size in size_patterns:
            if size in text.lower():
                params["size"] = size
                break
                
        # Extract format preferences
        format_patterns = ["svg", "png", "jpg", "icon", "vector"]
        for fmt in format_patterns:
            if fmt in text.lower():
                params["format"] = fmt
                break
                
        # Extract color preferences
        color_patterns = ["đen", "trắng", "xanh", "đỏ", "black", "white", "blue", "red", "green"]
        for color in color_patterns:
            if color in text.lower():
                params["color"] = color
                break
                
        # Extract quantity
        quantity_match = re.search(r'(\d+)', text)
        if quantity_match:
            params["quantity"] = int(quantity_match.group(1))
            
        return params
    
    def _get_project_context(self) -> str:
        """Get current project context"""
        
        if not self.appdexer_core or not self.appdexer_core.is_setup:
            return ""
            
        try:
            primary_type = self.appdexer_core.project_types[0].value if self.appdexer_core.project_types else "unknown"
            return f"Project type: {primary_type}"
        except Exception as e:
            logger.error(f"Error getting project context: {e}")
            return ""
    
    def _cache_command(self, transcription: str, command: VoiceCommand):
        """Cache processed command for optimization"""
        
        cache_key = transcription.lower().strip()
        self.processing_cache[cache_key] = {
            "command": command,
            "timestamp": time.time()
        }
        
        # Clean old cache entries (older than 1 hour)
        current_time = time.time()
        self.processing_cache = {
            k: v for k, v in self.processing_cache.items()
            if current_time - v["timestamp"] < 3600
        }
    
    async def execute_voice_command(self, command: VoiceCommand) -> Dict[str, Any]:
        """Execute processed voice command"""
        
        logger.info(f"🎯 Executing voice command: {command.command_type.value}")
        
        try:
            if command.command_type == VoiceCommandType.SEARCH_ICON:
                return await self._execute_icon_search(command)
            elif command.command_type == VoiceCommandType.FIND_RESOURCE:
                return await self._execute_resource_search(command)
            elif command.command_type == VoiceCommandType.DOWNLOAD_ASSET:
                return await self._execute_download(command)
            elif command.command_type == VoiceCommandType.CREATE_COMPONENT:
                return await self._execute_component_creation(command)
            elif command.command_type == VoiceCommandType.GET_PROJECT_INFO:
                return await self._execute_project_info(command)
            else:
                return {
                    "status": "error",
                    "message": f"Unknown command type: {command.command_type.value}",
                    "suggestions": ["Try 'find home icon'", "Try 'project info'"]
                }
                
        except Exception as e:
            logger.error(f"Error executing voice command: {e}")
            return {
                "status": "error",
                "message": f"Failed to execute command: {str(e)}",
                "command": command.command_type.value
            }
    
    async def _execute_icon_search(self, command: VoiceCommand) -> Dict[str, Any]:
        """Execute icon search command"""
        
        search_query = command.query
        context = command.context
        
        # If we have Appdexer core, use it for search
        if self.appdexer_core:
            try:
                # Use resource search tools
                resource_tools = await self.appdexer_core.get_tools_for_context("icon")
                
                if resource_tools:
                    # Call first available icon search tool
                    tool_name = resource_tools[0]
                    result = await self.appdexer_core.call_tool(
                        tool_name, 
                        query=search_query,
                        context=context,
                        **command.parameters
                    )
                    
                    return {
                        "status": "success",
                        "command": "icon_search",
                        "query": search_query,
                        "context": context,
                        "results": result,
                        "tool_used": tool_name,
                        "project_type": self.appdexer_core.project_types[0].value if self.appdexer_core.project_types else "unknown"
                    }
                    
            except Exception as e:
                logger.error(f"Error using Appdexer core for search: {e}")
        
        # Fallback to mock search
        return {
            "status": "success",
            "command": "icon_search",
            "query": search_query,
            "context": context,
            "results": f"Mock search results for '{search_query}' với context '{context}'",
            "suggestions": [
                f"{search_query}_outline.svg",
                f"{search_query}_filled.svg", 
                f"{search_query}_solid.png"
            ]
        }
    
    async def _execute_resource_search(self, command: VoiceCommand) -> Dict[str, Any]:
        """Execute general resource search"""
        
        return {
            "status": "success",
            "command": "resource_search",
            "query": command.query,
            "results": f"Searching resources for: {command.query}",
            "resource_types": ["icons", "images", "fonts", "sounds"]
        }
    
    async def _execute_download(self, command: VoiceCommand) -> Dict[str, Any]:
        """Execute download command"""
        
        return {
            "status": "success", 
            "command": "download",
            "target": command.query,
            "message": f"Downloading {command.query}...",
            "estimated_time": "5 seconds"
        }
    
    async def _execute_component_creation(self, command: VoiceCommand) -> Dict[str, Any]:
        """Execute component creation command"""
        
        project_type = "unknown"
        if self.appdexer_core and self.appdexer_core.project_types:
            project_type = self.appdexer_core.project_types[0].value
            
        return {
            "status": "success",
            "command": "create_component",
            "component_name": command.query,
            "project_type": project_type,
            "message": f"Creating {command.query} component for {project_type} project",
            "next_steps": ["Generate code", "Add to project", "Update imports"]
        }
    
    async def _execute_project_info(self, command: VoiceCommand) -> Dict[str, Any]:
        """Execute project info command"""
        
        if self.appdexer_core and self.appdexer_core.is_setup:
            project_info = self.appdexer_core.detector.get_project_info()
            return {
                "status": "success",
                "command": "project_info",
                "project_info": project_info,
                "message": f"Project type: {project_info['primary_type']}"
            }
        else:
            return {
                "status": "error",
                "command": "project_info", 
                "message": "Appdexer not initialized. Please run auto-setup first."
            }

    def get_supported_commands(self) -> List[Dict[str, str]]:
        """Get list of supported voice commands"""
        
        return [
            {
                "command": "Search Icon",
                "examples": [
                    "Tìm icon home",
                    "Find search icon",
                    "Tìm biểu tượng menu cho navigation"
                ]
            },
            {
                "command": "Find Resource", 
                "examples": [
                    "Tìm tài nguyên button",
                    "Find image background",
                    "Cần font cho dự án"
                ]
            },
            {
                "command": "Download Asset",
                "examples": [
                    "Tải icon home",
                    "Download button.svg",
                    "Lấy logo.png"
                ]
            },
            {
                "command": "Create Component",
                "examples": [
                    "Tạo button component",
                    "Create navigation component",
                    "Generate card component"
                ]
            },
            {
                "command": "Project Info",
                "examples": [
                    "Thông tin dự án",
                    "Project info",
                    "Loại dự án gì?"
                ]
            }
        ] 