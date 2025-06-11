import asyncio
import json
import re
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum
import os
from pathlib import Path

logger = logging.getLogger(__name__)

class ContextType(Enum):
    UI_COMPONENT = "ui_component"
    NAVIGATION = "navigation"
    USER_ACTION = "user_action"
    CONTENT_TYPE = "content_type"
    BRANDING = "branding"
    STATE_INDICATOR = "state_indicator"
    SYSTEM_FEEDBACK = "system_feedback"
    UNKNOWN = "unknown"

class UrgencyLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class ContextAnalysis:
    """Kết quả phân tích context từ AI"""
    context_type: ContextType
    confidence: float
    suggested_resources: List[str]
    keywords: List[str]
    project_relevance: float
    urgency: UrgencyLevel
    reasoning: str
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class AIContextAnalyzer:
    """AI-powered context analyzer để understand user needs và suggest appropriate resources"""
    
    def __init__(self, appdexer_core=None):
        self.appdexer_core = appdexer_core
        self.context_patterns = self._initialize_context_patterns()
        self.project_contexts = {}
        self.analysis_history = []
        self.learning_cache = {}
        
    def _initialize_context_patterns(self) -> Dict[ContextType, Dict]:
        """Initialize patterns để detect different context types"""
        
        return {
            ContextType.UI_COMPONENT: {
                "keywords": [
                    "button", "input", "form", "card", "modal", "dropdown", "tab", "accordion",
                    "slider", "toggle", "checkbox", "radio", "avatar", "badge", "chip",
                    "nút", "biểu mẫu", "thẻ", "hộp thoại", "thanh trượt"
                ],
                "patterns": [
                    r"(button|nút) (.+)",
                    r"(form|biểu mẫu) (.+)",
                    r"(card|thẻ) (.+)",
                    r"(modal|hộp thoại) (.+)",
                ],
                "contexts": ["component", "ui", "interface", "design"]
            },
            ContextType.NAVIGATION: {
                "keywords": [
                    "menu", "nav", "navigation", "breadcrumb", "sidebar", "header", "footer",
                    "home", "back", "next", "previous", "up", "down", "left", "right",
                    "điều hướng", "menu", "trang chủ", "quay lại", "tiếp", "trước"
                ],
                "patterns": [
                    r"(navigation|điều hướng) (.+)",
                    r"(menu|thực đơn) (.+)",
                    r"(breadcrumb|đường dẫn) (.+)",
                ],
                "contexts": ["navigation", "menu", "flow", "journey"]
            },
            ContextType.USER_ACTION: {
                "keywords": [
                    "click", "tap", "press", "hover", "drag", "drop", "swipe", "scroll",
                    "save", "delete", "edit", "create", "update", "submit", "cancel",
                    "nhấn", "chạm", "lưu", "xóa", "sửa", "tạo", "cập nhật", "gửi", "hủy"
                ],
                "patterns": [
                    r"(click|nhấn) (.+)",
                    r"(save|lưu) (.+)",
                    r"(delete|xóa) (.+)",
                ],
                "contexts": ["action", "interaction", "behavior", "trigger"]
            },
            ContextType.CONTENT_TYPE: {
                "keywords": [
                    "text", "image", "video", "audio", "document", "file", "data",
                    "list", "table", "chart", "graph", "calendar", "map",
                    "văn bản", "hình ảnh", "video", "âm thanh", "tài liệu", "danh sách", "bảng"
                ],
                "patterns": [
                    r"(image|hình ảnh) (.+)",
                    r"(text|văn bản) (.+)",
                    r"(list|danh sách) (.+)",
                ],
                "contexts": ["content", "media", "data", "information"]
            },
            ContextType.BRANDING: {
                "keywords": [
                    "logo", "brand", "company", "product", "service", "app", "website",
                    "identity", "style", "theme", "color", "font",
                    "thương hiệu", "công ty", "sản phẩm", "dịch vụ", "ứng dụng"
                ],
                "patterns": [
                    r"(logo|biểu tượng) (.+)",
                    r"(brand|thương hiệu) (.+)",
                ],
                "contexts": ["branding", "identity", "style", "theme"]
            },
            ContextType.STATE_INDICATOR: {
                "keywords": [
                    "loading", "error", "success", "warning", "info", "notification",
                    "progress", "status", "state", "indicator", "badge", "alert",
                    "tải", "lỗi", "thành công", "cảnh báo", "thông báo", "tiến trình"
                ],
                "patterns": [
                    r"(loading|đang tải) (.+)",
                    r"(error|lỗi) (.+)",
                    r"(success|thành công) (.+)",
                ],
                "contexts": ["status", "feedback", "state", "progress"]
            },
            ContextType.SYSTEM_FEEDBACK: {
                "keywords": [
                    "toast", "snackbar", "popup", "tooltip", "help", "guide", "tutorial",
                    "message", "feedback", "response", "confirmation",
                    "thông báo", "hướng dẫn", "tin nhắn", "phản hồi", "xác nhận"
                ],
                "patterns": [
                    r"(tooltip|chú thích) (.+)",
                    r"(message|tin nhắn) (.+)",
                ],
                "contexts": ["feedback", "help", "guidance", "communication"]
            }
        }
    
    async def analyze_context(self, input_text: str, conversation_history: List[str] = None) -> ContextAnalysis:
        """Analyze context từ user input và conversation history"""
        
        logger.info(f"🧠 Analyzing context for: '{input_text}'")
        
        # Clean và normalize input
        cleaned_input = self._clean_input(input_text)
        
        # Detect context type
        context_type, confidence = self._detect_context_type(cleaned_input)
        
        # Extract keywords
        keywords = self._extract_keywords(cleaned_input, context_type)
        
        # Generate resource suggestions
        suggested_resources = await self._generate_resource_suggestions(
            cleaned_input, context_type, keywords
        )
        
        # Calculate project relevance
        project_relevance = self._calculate_project_relevance(context_type, keywords)
        
        # Determine urgency
        urgency = self._determine_urgency(input_text, conversation_history)
        
        # Generate reasoning
        reasoning = self._generate_reasoning(
            context_type, keywords, suggested_resources, project_relevance
        )
        
        analysis = ContextAnalysis(
            context_type=context_type,
            confidence=confidence,
            suggested_resources=suggested_resources,
            keywords=keywords,
            project_relevance=project_relevance,
            urgency=urgency,
            reasoning=reasoning,
            metadata={
                "input_text": input_text,
                "cleaned_input": cleaned_input,
                "analysis_timestamp": asyncio.get_event_loop().time(),
                "project_type": self._get_project_type()
            }
        )
        
        # Store in history for learning
        self.analysis_history.append(analysis)
        
        logger.info(f"✅ Context analysis complete: {context_type.value} (confidence: {confidence:.2f})")
        return analysis
    
    def _clean_input(self, text: str) -> str:
        """Clean và normalize input text"""
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Convert to lowercase for analysis
        text = text.lower()
        
        # Remove common filler words
        filler_words = ["uh", "um", "er", "ah", "like", "you know", "actually", "basically"]
        for filler in filler_words:
            text = re.sub(rf'\b{filler}\b', '', text, flags=re.IGNORECASE)
        
        return text.strip()
    
    def _detect_context_type(self, text: str) -> Tuple[ContextType, float]:
        """Detect context type với confidence score"""
        
        best_match = ContextType.UNKNOWN
        best_confidence = 0.0
        
        for context_type, patterns_data in self.context_patterns.items():
            confidence = 0.0
            
            # Check keywords
            keywords = patterns_data["keywords"]
            keyword_matches = sum(1 for keyword in keywords if keyword.lower() in text)
            if keyword_matches > 0:
                confidence += (keyword_matches / len(keywords)) * 0.6
            
            # Check patterns
            patterns = patterns_data.get("patterns", [])
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    confidence += 0.3
                    break
            
            # Check contexts
            contexts = patterns_data.get("contexts", [])
            context_matches = sum(1 for context in contexts if context.lower() in text)
            if context_matches > 0:
                confidence += (context_matches / len(contexts)) * 0.1
            
            if confidence > best_confidence:
                best_confidence = confidence
                best_match = context_type
        
        return best_match, min(best_confidence, 1.0)
    
    def _extract_keywords(self, text: str, context_type: ContextType) -> List[str]:
        """Extract relevant keywords từ text"""
        
        keywords = []
        
        # Get keywords from context patterns
        if context_type in self.context_patterns:
            pattern_keywords = self.context_patterns[context_type]["keywords"]
            keywords.extend([kw for kw in pattern_keywords if kw.lower() in text])
        
        # Extract nouns and important words
        words = text.split()
        important_words = []
        
        # Simple keyword extraction (in real implementation, use NLP library)
        for word in words:
            if len(word) > 3 and word not in ["the", "and", "or", "but", "for", "in", "on", "at"]:
                important_words.append(word)
        
        keywords.extend(important_words[:5])  # Limit to 5 most important words
        
        return list(set(keywords))  # Remove duplicates
    
    async def _generate_resource_suggestions(self, text: str, context_type: ContextType, keywords: List[str]) -> List[str]:
        """Generate resource suggestions dựa trên context"""
        
        suggestions = []
        
        # Context-specific suggestions
        context_suggestions = {
            ContextType.UI_COMPONENT: {
                "button": ["button_primary", "button_secondary", "button_outline", "click_icon"],
                "input": ["input_field", "text_input", "search_icon", "edit_icon"],
                "form": ["form_icon", "submit_icon", "save_icon", "document_icon"],
                "card": ["card_background", "content_icon", "info_icon"],
                "modal": ["close_icon", "popup_icon", "overlay_background"]
            },
            ContextType.NAVIGATION: {
                "menu": ["menu_icon", "hamburger_icon", "navigation_icon"],
                "home": ["home_icon", "house_icon", "dashboard_icon"],
                "back": ["arrow_left", "back_icon", "previous_icon"],
                "next": ["arrow_right", "next_icon", "forward_icon"],
                "navigation": ["nav_icon", "compass_icon", "direction_icon"]
            },
            ContextType.USER_ACTION: {
                "save": ["save_icon", "disk_icon", "check_icon"],
                "delete": ["delete_icon", "trash_icon", "remove_icon"],
                "edit": ["edit_icon", "pencil_icon", "modify_icon"],
                "create": ["plus_icon", "add_icon", "new_icon"],
                "click": ["pointer_icon", "hand_icon", "cursor_icon"]
            },
            ContextType.CONTENT_TYPE: {
                "image": ["image_icon", "photo_icon", "picture_icon"],
                "text": ["text_icon", "document_icon", "file_text"],
                "video": ["video_icon", "play_icon", "media_icon"],
                "list": ["list_icon", "menu_list", "items_icon"]
            },
            ContextType.BRANDING: {
                "logo": ["logo_placeholder", "brand_icon", "company_icon"],
                "brand": ["brand_elements", "identity_kit", "style_guide"]
            },
            ContextType.STATE_INDICATOR: {
                "loading": ["spinner_icon", "loader_icon", "progress_icon"],
                "error": ["error_icon", "warning_icon", "alert_icon"],
                "success": ["check_icon", "success_icon", "done_icon"],
                "warning": ["warning_icon", "caution_icon", "alert_triangle"]
            },
            ContextType.SYSTEM_FEEDBACK: {
                "tooltip": ["info_icon", "help_icon", "question_icon"],
                "message": ["message_icon", "chat_icon", "notification_icon"],
                "notification": ["bell_icon", "alert_icon", "notify_icon"]
            }
        }
        
        # Get suggestions for context type
        type_suggestions = context_suggestions.get(context_type, {})
        
        # Find matches based on keywords
        for keyword in keywords:
            for suggestion_key, suggestion_list in type_suggestions.items():
                if keyword in suggestion_key or suggestion_key in keyword:
                    suggestions.extend(suggestion_list)
        
        # Add general suggestions if no specific matches
        if not suggestions:
            general_suggestions = {
                ContextType.UI_COMPONENT: ["ui_icon", "component_icon", "interface_element"],
                ContextType.NAVIGATION: ["navigation_icon", "menu_icon", "arrow_icon"],
                ContextType.USER_ACTION: ["action_icon", "button_icon", "interact_icon"],
                ContextType.CONTENT_TYPE: ["content_icon", "media_icon", "data_icon"],
                ContextType.BRANDING: ["brand_icon", "logo_icon", "identity_icon"],
                ContextType.STATE_INDICATOR: ["status_icon", "indicator_icon", "state_icon"],
                ContextType.SYSTEM_FEEDBACK: ["feedback_icon", "message_icon", "system_icon"]
            }
            
            suggestions = general_suggestions.get(context_type, ["generic_icon"])
        
        # Remove duplicates và limit results
        suggestions = list(set(suggestions))[:10]
        
        # Add project-specific suggestions if available
        if self.appdexer_core and self.appdexer_core.is_setup:
            project_suggestions = await self._get_project_specific_suggestions(context_type, keywords)
            suggestions.extend(project_suggestions)
        
        return suggestions[:15]  # Limit to 15 suggestions
    
    async def _get_project_specific_suggestions(self, context_type: ContextType, keywords: List[str]) -> List[str]:
        """Get project-specific resource suggestions"""
        
        project_type = self._get_project_type()
        project_suggestions = []
        
        # Project-type specific suggestions
        if project_type == "android":
            project_suggestions.extend([
                "ic_" + kw.replace(" ", "_") for kw in keywords[:3]
            ])
        elif project_type == "ios":
            project_suggestions.extend([
                kw.replace(" ", "_") + "_ios" for kw in keywords[:3]
            ])
        elif project_type in ["react", "vue", "angular"]:
            project_suggestions.extend([
                kw.replace(" ", "-") + "-component" for kw in keywords[:3]
            ])
        
        return project_suggestions
    
    def _calculate_project_relevance(self, context_type: ContextType, keywords: List[str]) -> float:
        """Calculate relevance to current project"""
        
        base_relevance = 0.5
        
        # Get project type
        project_type = self._get_project_type()
        
        # Project-specific relevance boost
        if project_type in ["react", "vue", "angular"] and context_type == ContextType.UI_COMPONENT:
            base_relevance += 0.3
        elif project_type in ["android", "ios"] and context_type == ContextType.NAVIGATION:
            base_relevance += 0.3
        elif project_type == "nodejs" and context_type == ContextType.SYSTEM_FEEDBACK:
            base_relevance += 0.2
        
        # Keyword relevance
        project_keywords = {
            "android": ["mobile", "app", "touch", "swipe", "material"],
            "ios": ["mobile", "app", "touch", "swipe", "human interface"],
            "react": ["web", "component", "state", "props", "jsx"],
            "vue": ["web", "component", "reactive", "template"],
            "angular": ["web", "component", "service", "typescript"],
            "nodejs": ["server", "api", "backend", "endpoint"]
        }
        
        relevant_keywords = project_keywords.get(project_type, [])
        keyword_matches = sum(1 for kw in keywords if any(rk in kw.lower() for rk in relevant_keywords))
        
        if relevant_keywords:
            base_relevance += (keyword_matches / len(relevant_keywords)) * 0.2
        
        return min(base_relevance, 1.0)
    
    def _determine_urgency(self, input_text: str, conversation_history: List[str] = None) -> UrgencyLevel:
        """Determine urgency level của request"""
        
        # Check for urgency indicators
        urgent_keywords = ["urgent", "asap", "immediately", "now", "quickly", "fast", "gấp", "nhanh", "ngay"]
        high_keywords = ["important", "critical", "needed", "required", "quan trọng", "cần thiết"]
        
        text_lower = input_text.lower()
        
        if any(keyword in text_lower for keyword in urgent_keywords):
            return UrgencyLevel.CRITICAL
        elif any(keyword in text_lower for keyword in high_keywords):
            return UrgencyLevel.HIGH
        elif conversation_history and len(conversation_history) > 3:
            # If user has been asking repeatedly, increase urgency
            return UrgencyLevel.MEDIUM
        else:
            return UrgencyLevel.LOW
    
    def _generate_reasoning(self, context_type: ContextType, keywords: List[str], 
                          suggestions: List[str], project_relevance: float) -> str:
        """Generate human-readable reasoning cho analysis"""
        
        reasoning_parts = []
        
        # Context detection reasoning
        reasoning_parts.append(f"Detected context: {context_type.value}")
        
        if keywords:
            reasoning_parts.append(f"Key terms identified: {', '.join(keywords[:5])}")
        
        # Project relevance
        if project_relevance > 0.7:
            reasoning_parts.append("High project relevance")
        elif project_relevance > 0.4:
            reasoning_parts.append("Moderate project relevance")
        else:
            reasoning_parts.append("Low project relevance")
        
        # Suggestions reasoning
        if suggestions:
            reasoning_parts.append(f"Suggested {len(suggestions)} relevant resources")
        
        return ". ".join(reasoning_parts) + "."
    
    def _get_project_type(self) -> str:
        """Get current project type"""
        
        if self.appdexer_core and self.appdexer_core.is_setup and self.appdexer_core.project_types:
            return self.appdexer_core.project_types[0].value
        return "unknown"
    
    def get_analysis_summary(self) -> Dict[str, Any]:
        """Get summary of recent analyses"""
        
        if not self.analysis_history:
            return {"message": "No analyses performed yet"}
        
        recent_analyses = self.analysis_history[-10:]  # Last 10 analyses
        
        context_counts = {}
        total_confidence = 0
        
        for analysis in recent_analyses:
            context_type = analysis.context_type.value
            context_counts[context_type] = context_counts.get(context_type, 0) + 1
            total_confidence += analysis.confidence
        
        return {
            "total_analyses": len(self.analysis_history),
            "recent_analyses": len(recent_analyses),
            "average_confidence": total_confidence / len(recent_analyses) if recent_analyses else 0,
            "context_distribution": context_counts,
            "project_type": self._get_project_type()
        } 