import re
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class CommandCategory(Enum):
    RESOURCE_SEARCH = "resource_search"
    PROJECT_MANAGEMENT = "project_management"
    COMPONENT_CREATION = "component_creation"
    NAVIGATION = "navigation"
    SYSTEM_CONTROL = "system_control"
    HELP = "help"

class ActionType(Enum):
    SEARCH = "search"
    CREATE = "create"
    GET = "get"
    SET = "set"
    LIST = "list"
    DOWNLOAD = "download"
    UPLOAD = "upload"
    DELETE = "delete"
    HELP = "help"

@dataclass
class ParsedCommand:
    """Structured representation của voice command"""
    original_text: str
    category: CommandCategory
    action: ActionType
    target: str
    parameters: Dict[str, Any]
    confidence: float
    language: str
    alternatives: List[str] = None
    
    def __post_init__(self):
        if self.alternatives is None:
            self.alternatives = []

class VoiceCommandParser:
    """Parser để convert voice transcriptions thành structured commands"""
    
    def __init__(self):
        self.command_patterns = self._initialize_command_patterns()
        self.context_extractors = self._initialize_context_extractors()
        self.parameter_extractors = self._initialize_parameter_extractors()
        
    def _initialize_command_patterns(self) -> Dict[str, List[Dict]]:
        """Initialize command patterns cho different languages"""
        
        return {
            "vietnamese": [
                # Resource Search Commands
                {
                    "category": CommandCategory.RESOURCE_SEARCH,
                    "action": ActionType.SEARCH,
                    "patterns": [
                        r"tìm (icon|biểu tượng) (.+)",
                        r"tìm kiếm (icon|biểu tượng) (.+)",
                        r"tìm (.+) icon",
                        r"tìm (tài nguyên|resource) (.+)",
                        r"tìm (ảnh|hình) (.+)",
                        r"cần (icon|biểu tượng) (.+)",
                        r"có (icon|biểu tượng) (.+) không",
                    ],
                    "target_group": 2,  # Which regex group contains the target
                    "priority": 10
                },
                {
                    "category": CommandCategory.RESOURCE_SEARCH,
                    "action": ActionType.DOWNLOAD,
                    "patterns": [
                        r"tải (về|xuống)? (.+)",
                        r"download (.+)",
                        r"lấy (.+)",
                        r"tải (.+) icon",
                        r"tải (.+) ảnh",
                    ],
                    "target_group": 2,
                    "priority": 8
                },
                
                # Component Creation Commands
                {
                    "category": CommandCategory.COMPONENT_CREATION,
                    "action": ActionType.CREATE,
                    "patterns": [
                        r"tạo (component|thành phần) (.+)",
                        r"tạo (.+) component",
                        r"sinh (component|thành phần) (.+)",
                        r"generate (.+) component",
                        r"tạo (.+) (button|nút)",
                        r"tạo (.+) (form|biểu mẫu)",
                    ],
                    "target_group": 2,
                    "priority": 9
                },
                
                # Project Management Commands
                {
                    "category": CommandCategory.PROJECT_MANAGEMENT,
                    "action": ActionType.GET,
                    "patterns": [
                        r"thông tin dự án",
                        r"project info",
                        r"dự án gì",
                        r"loại dự án",
                        r"project type",
                        r"setup gì",
                        r"đã setup chưa",
                        r"auto setup",
                        r"tự động setup",
                    ],
                    "target_group": 0,  # No specific target, whole command
                    "priority": 7
                },
                {
                    "category": CommandCategory.PROJECT_MANAGEMENT,
                    "action": ActionType.LIST,
                    "patterns": [
                        r"danh sách (tool|công cụ)",
                        r"list (tool|công cụ)",
                        r"có những (tool|công cụ) gì",
                        r"available tools",
                        r"tools available",
                    ],
                    "target_group": 1,
                    "priority": 6
                },
                
                # System Control Commands
                {
                    "category": CommandCategory.SYSTEM_CONTROL,
                    "action": ActionType.SET,
                    "patterns": [
                        r"đặt ngôn ngữ (.+)",
                        r"set language (.+)",
                        r"chuyển sang (.+)",
                        r"switch to (.+)",
                        r"thiết lập (.+)",
                        r"config (.+)",
                    ],
                    "target_group": 1,
                    "priority": 5
                },
                
                # Help Commands
                {
                    "category": CommandCategory.HELP,
                    "action": ActionType.HELP,
                    "patterns": [
                        r"help",
                        r"giúp",
                        r"hướng dẫn",
                        r"cách sử dụng",
                        r"how to use",
                        r"commands",
                        r"lệnh",
                        r"tôi có thể làm gì",
                        r"what can i do",
                    ],
                    "target_group": 0,
                    "priority": 3
                }
            ],
            
            "english": [
                # Resource Search Commands
                {
                    "category": CommandCategory.RESOURCE_SEARCH,
                    "action": ActionType.SEARCH,
                    "patterns": [
                        r"find (.+) icon",
                        r"search (.+) icon",
                        r"look for (.+) icon",
                        r"find icon (.+)",
                        r"search icon (.+)",
                        r"need (.+) icon",
                        r"get (.+) icon",
                        r"find (.+) resource",
                        r"search (.+) asset",
                        r"find (.+) image",
                        r"look for (.+)",
                        r"need (.+) for project",
                    ],
                    "target_group": 1,
                    "priority": 10
                },
                {
                    "category": CommandCategory.RESOURCE_SEARCH,
                    "action": ActionType.DOWNLOAD,
                    "patterns": [
                        r"download (.+)",
                        r"get (.+)",
                        r"fetch (.+)",
                        r"retrieve (.+)",
                        r"pull (.+)",
                        r"download (.+) icon",
                        r"download (.+) image",
                    ],
                    "target_group": 1,
                    "priority": 8
                },
                
                # Component Creation Commands
                {
                    "category": CommandCategory.COMPONENT_CREATION,
                    "action": ActionType.CREATE,
                    "patterns": [
                        r"create (.+) component",
                        r"generate (.+) component",
                        r"make (.+) component",
                        r"build (.+) component",
                        r"create (.+) button",
                        r"create (.+) form",
                        r"generate (.+) widget",
                    ],
                    "target_group": 1,
                    "priority": 9
                },
                
                # Project Management Commands
                {
                    "category": CommandCategory.PROJECT_MANAGEMENT,
                    "action": ActionType.GET,
                    "patterns": [
                        r"project info",
                        r"project information",
                        r"what project",
                        r"project type",
                        r"project setup",
                        r"setup info",
                        r"auto setup",
                        r"current project",
                    ],
                    "target_group": 0,
                    "priority": 7
                },
                {
                    "category": CommandCategory.PROJECT_MANAGEMENT,
                    "action": ActionType.LIST,
                    "patterns": [
                        r"list tools",
                        r"available tools",
                        r"what tools",
                        r"show tools",
                        r"tools list",
                    ],
                    "target_group": 0,
                    "priority": 6
                },
                
                # System Control Commands
                {
                    "category": CommandCategory.SYSTEM_CONTROL,
                    "action": ActionType.SET,
                    "patterns": [
                        r"set language (.+)",
                        r"switch to (.+)",
                        r"change to (.+)",
                        r"configure (.+)",
                        r"config (.+)",
                        r"setup (.+)",
                    ],
                    "target_group": 1,
                    "priority": 5
                },
                
                # Help Commands
                {
                    "category": CommandCategory.HELP,
                    "action": ActionType.HELP,
                    "patterns": [
                        r"help",
                        r"how to use",
                        r"usage",
                        r"commands",
                        r"what can i do",
                        r"available commands",
                        r"guide",
                        r"tutorial",
                    ],
                    "target_group": 0,
                    "priority": 3
                }
            ]
        }
    
    def _initialize_context_extractors(self) -> Dict[str, List[str]]:
        """Initialize context extraction patterns"""
        
        return {
            "location": [
                r"cho (.+)",
                r"trong (.+)",
                r"ở (.+)",
                r"của (.+)",
                r"for (.+)",
                r"in (.+)",
                r"on (.+)",
                r"at (.+)",
            ],
            "purpose": [
                r"để (.+)",
                r"phục vụ (.+)",
                r"to (.+)",
                r"for (.+) purpose",
            ],
            "style": [
                r"kiểu (.+)",
                r"style (.+)",
                r"theo (.+)",
                r"in (.+) style",
            ],
            "size": [
                r"(nhỏ|vừa|lớn|to|nhỏ xíu)",
                r"(small|medium|large|big|tiny|huge)",
                r"size (.+)",
                r"kích thước (.+)",
            ],
            "color": [
                r"màu (.+)",
                r"color (.+)",
                r"(đen|trắng|xanh|đỏ|vàng|tím|cam|hồng)",
                r"(black|white|blue|red|yellow|purple|orange|pink|green)",
            ]
        }
    
    def _initialize_parameter_extractors(self) -> Dict[str, List[str]]:
        """Initialize parameter extraction patterns"""
        
        return {
            "format": [
                r"(svg|png|jpg|jpeg|gif|ico|pdf)",
                r"định dạng (.+)",
                r"format (.+)",
                r"kiểu file (.+)",
            ],
            "quantity": [
                r"(\d+) (cái|icon|ảnh|hình)",
                r"(\d+) (icons?|images?|files?)",
                r"nhiều (.+)",
                r"multiple (.+)",
            ],
            "urgency": [
                r"(gấp|nhanh|ngay|immediately|urgent|asap|quickly)",
                r"ưu tiên (cao|thấp|vừa)",
                r"priority (high|low|medium)",
            ],
            "quality": [
                r"chất lượng (cao|thấp|vừa)",
                r"(high|low|medium) quality",
                r"resolution (\d+)",
                r"độ phân giải (\d+)",
            ]
        }
    
    def parse_command(self, text: str, language: str = "auto", confidence: float = 1.0) -> ParsedCommand:
        """Parse voice command text thành structured command"""
        
        logger.debug(f"🎯 Parsing command: '{text}' (language: {language})")
        
        # Auto-detect language if needed
        if language == "auto":
            language = self._detect_language(text)
        
        # Clean input
        cleaned_text = self._clean_text(text)
        
        # Find best matching pattern
        best_match = self._find_best_match(cleaned_text, language)
        
        if best_match:
            # Extract target
            target = self._extract_target(cleaned_text, best_match)
            
            # Extract parameters
            parameters = self._extract_parameters(cleaned_text)
            
            # Calculate final confidence
            final_confidence = confidence * best_match["confidence"]
            
            parsed_command = ParsedCommand(
                original_text=text,
                category=best_match["category"],
                action=best_match["action"],
                target=target,
                parameters=parameters,
                confidence=final_confidence,
                language=language
            )
            
            logger.debug(f"✅ Parsed: {best_match['category'].value} -> {best_match['action'].value} -> '{target}'")
            return parsed_command
        
        else:
            # Unknown command
            logger.debug(f"❓ Unknown command pattern")
            return ParsedCommand(
                original_text=text,
                category=CommandCategory.HELP,
                action=ActionType.HELP,
                target="unknown_command",
                parameters={"error": "unrecognized_pattern"},
                confidence=0.1,
                language=language
            )
    
    def _detect_language(self, text: str) -> str:
        """Simple language detection"""
        
        vietnamese_keywords = [
            "tìm", "kiếm", "tạo", "icon", "biểu", "tượng", "dự", "án", 
            "thông", "tin", "tải", "về", "cho", "trong", "của", "cần"
        ]
        
        english_keywords = [
            "find", "search", "create", "icon", "project", "info", 
            "download", "get", "for", "in", "of", "need"
        ]
        
        text_lower = text.lower()
        
        vi_score = sum(1 for kw in vietnamese_keywords if kw in text_lower)
        en_score = sum(1 for kw in english_keywords if kw in text_lower)
        
        return "vietnamese" if vi_score > en_score else "english"
    
    def _clean_text(self, text: str) -> str:
        """Clean và normalize text"""
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove punctuation
        text = re.sub(r'[.,!?;]', '', text)
        
        return text
    
    def _find_best_match(self, text: str, language: str) -> Optional[Dict]:
        """Find best matching command pattern"""
        
        patterns = self.command_patterns.get(language, self.command_patterns["english"])
        
        best_match = None
        best_score = 0
        
        for pattern_group in patterns:
            for pattern in pattern_group["patterns"]:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    # Calculate match score based on priority và pattern specificity
                    score = pattern_group["priority"]
                    
                    # Boost score for longer matches (more specific)
                    if match.group(0):
                        score += len(match.group(0)) / len(text) * 2
                    
                    # Boost score for exact matches
                    if match.group(0).strip() == text.strip():
                        score += 3
                    
                    if score > best_score:
                        best_score = score
                        best_match = {
                            "category": pattern_group["category"],
                            "action": pattern_group["action"],
                            "pattern": pattern,
                            "match": match,
                            "target_group": pattern_group["target_group"],
                            "confidence": min(score / 15, 1.0)  # Normalize to 0-1
                        }
        
        return best_match
    
    def _extract_target(self, text: str, match_info: Dict) -> str:
        """Extract command target từ matched pattern"""
        
        match = match_info["match"]
        target_group = match_info["target_group"]
        
        if target_group == 0:
            # Whole command is the target
            return text.strip()
        elif target_group <= len(match.groups()):
            # Extract from specific group
            target = match.group(target_group)
            if target:
                return target.strip()
        
        # Fallback: try to extract noun phrases
        words = text.split()
        
        # Simple noun extraction (in real implementation, use NLP)
        important_words = []
        skip_words = ["tìm", "find", "tạo", "create", "icon", "biểu", "tượng", "component"]
        
        for word in words:
            if len(word) > 2 and word not in skip_words:
                important_words.append(word)
        
        return " ".join(important_words[:3]) if important_words else "unknown"
    
    def _extract_parameters(self, text: str) -> Dict[str, Any]:
        """Extract additional parameters từ command text"""
        
        parameters = {}
        
        # Extract context information
        for context_type, patterns in self.context_extractors.items():
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    if match.groups():
                        parameters[context_type] = match.group(1).strip()
                    else:
                        parameters[context_type] = match.group(0).strip()
                    break
        
        # Extract specific parameters
        for param_type, patterns in self.parameter_extractors.items():
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    if match.groups():
                        if param_type == "quantity":
                            try:
                                parameters[param_type] = int(match.group(1))
                            except ValueError:
                                parameters[param_type] = match.group(1).strip()
                        else:
                            parameters[param_type] = match.group(1).strip()
                    else:
                        parameters[param_type] = match.group(0).strip()
                    break
        
        return parameters
    
    def get_command_suggestions(self, category: CommandCategory = None) -> List[Dict[str, str]]:
        """Get list of available commands by category"""
        
        suggestions = []
        
        example_commands = {
            CommandCategory.RESOURCE_SEARCH: [
                {"vi": "Tìm icon home", "en": "Find home icon"},
                {"vi": "Tìm biểu tượng menu", "en": "Search menu icon"},
                {"vi": "Tải icon save", "en": "Download save icon"},
                {"vi": "Tìm ảnh background", "en": "Find background image"},
            ],
            CommandCategory.COMPONENT_CREATION: [
                {"vi": "Tạo button component", "en": "Create button component"},
                {"vi": "Tạo form component", "en": "Generate form component"},
                {"vi": "Tạo navigation component", "en": "Make navigation component"},
            ],
            CommandCategory.PROJECT_MANAGEMENT: [
                {"vi": "Thông tin dự án", "en": "Project info"},
                {"vi": "Loại dự án", "en": "Project type"},
                {"vi": "Auto setup", "en": "Auto setup"},
                {"vi": "Danh sách tools", "en": "List tools"},
            ],
            CommandCategory.SYSTEM_CONTROL: [
                {"vi": "Đặt ngôn ngữ English", "en": "Set language Vietnamese"},
                {"vi": "Thiết lập config", "en": "Configure settings"},
            ],
            CommandCategory.HELP: [
                {"vi": "Help", "en": "Help"},
                {"vi": "Hướng dẫn", "en": "Guide"},
                {"vi": "Tôi có thể làm gì", "en": "What can I do"},
            ]
        }
        
        if category:
            suggestions.extend(example_commands.get(category, []))
        else:
            for cmd_list in example_commands.values():
                suggestions.extend(cmd_list)
        
        return suggestions
    
    def validate_command(self, parsed_command: ParsedCommand) -> Dict[str, Any]:
        """Validate parsed command và suggest improvements"""
        
        validation = {
            "is_valid": True,
            "confidence": parsed_command.confidence,
            "issues": [],
            "suggestions": []
        }
        
        # Check confidence level
        if parsed_command.confidence < 0.3:
            validation["is_valid"] = False
            validation["issues"].append("Low confidence in command recognition")
            validation["suggestions"].append("Try speaking more clearly or using simpler commands")
        
        # Check target validity
        if not parsed_command.target or parsed_command.target == "unknown":
            validation["issues"].append("Target not clearly identified")
            validation["suggestions"].append("Please specify what you're looking for more clearly")
        
        # Check category-specific validation
        if parsed_command.category == CommandCategory.RESOURCE_SEARCH:
            if not parsed_command.target or len(parsed_command.target) < 2:
                validation["issues"].append("Search target too vague")
                validation["suggestions"].append("Try 'Find [specific item] icon' or 'Search [item name]'")
        
        # Lower confidence if issues found
        if validation["issues"]:
            validation["confidence"] *= 0.7
        
        return validation 