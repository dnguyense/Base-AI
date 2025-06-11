"""
Appdexer - Multi-Project Resource Management System

Auto-detect project types và dynamically load appropriate MCP tools.
Voice search và AI-powered context analysis for enhanced productivity.
"""

from .core.project_detector import ProjectDetector, ProjectType
from .core.mcp_loader import MCPToolsLoader, AppdexerCore
from .voice.voice_processor import VoiceProcessor, VoiceCommand
from .voice.speech_recognition import SpeechRecognizer, SpeechRecognitionResult
from .voice.voice_commands import VoiceCommandParser, ParsedCommand
from .ai.context_analyzer import AIContextAnalyzer, ContextAnalysis

__version__ = "1.0.0"
__author__ = "Base-AI-Project Team"

# Public API
__all__ = [
    "ProjectDetector",
    "ProjectType", 
    "MCPToolsLoader",
    "AppdexerCore",
    "VoiceProcessor",
    "VoiceCommand",
    "SpeechRecognizer",
    "SpeechRecognitionResult",
    "VoiceCommandParser", 
    "ParsedCommand",
    "AIContextAnalyzer",
    "ContextAnalysis",
]

# Quick setup function
async def quick_setup(project_root: str):
    """Quick setup function for easy integration"""
    appdexer = AppdexerCore(project_root)
    return await appdexer.auto_setup() 