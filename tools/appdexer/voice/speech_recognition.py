import asyncio
import logging
import json
import tempfile
import os
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass
from enum import Enum
import time

logger = logging.getLogger(__name__)

class SpeechEngine(Enum):
    WEB_SPEECH_API = "web_speech"
    MOCK = "mock"
    WHISPER = "whisper"  # Future: OpenAI Whisper integration
    
class LanguageCode(Enum):
    VIETNAMESE = "vi-VN"
    ENGLISH_US = "en-US"
    AUTO = "auto"

@dataclass
class SpeechRecognitionResult:
    """Kết quả nhận dạng giọng nói"""
    transcript: str
    confidence: float
    language: str
    is_final: bool
    alternatives: List[str] = None
    processing_time: float = 0.0
    engine_used: str = "unknown"
    
    def __post_init__(self):
        if self.alternatives is None:
            self.alternatives = []

class SpeechRecognizer:
    """Speech Recognition engine cho voice commands"""
    
    def __init__(self, engine: SpeechEngine = SpeechEngine.MOCK):
        self.engine = engine
        self.is_listening = False
        self.recognition_settings = {
            "continuous": True,
            "interim_results": True,
            "max_alternatives": 3,
            "language": LanguageCode.AUTO.value,
            "noise_threshold": 0.1,
            "silence_timeout": 2.0,
            "max_recording_time": 30.0
        }
        self.callbacks = {
            "on_start": None,
            "on_result": None,
            "on_end": None,
            "on_error": None
        }
        self.session_stats = {
            "total_recognitions": 0,
            "successful_recognitions": 0,
            "average_confidence": 0.0,
            "average_processing_time": 0.0
        }
    
    def configure(self, **settings):
        """Configure speech recognition settings"""
        self.recognition_settings.update(settings)
        logger.info(f"🎙️ Speech recognition configured: {settings}")
    
    def set_callback(self, event: str, callback: Callable):
        """Set callback cho speech recognition events"""
        if event in self.callbacks:
            self.callbacks[event] = callback
            logger.debug(f"Set callback for {event}")
    
    async def start_listening(self, language: LanguageCode = LanguageCode.AUTO) -> bool:
        """Start listening cho voice input"""
        
        if self.is_listening:
            logger.warning("Already listening")
            return False
            
        logger.info(f"🎤 Starting speech recognition (engine: {self.engine.value}, language: {language.value})")
        
        self.is_listening = True
        
        try:
            if self.engine == SpeechEngine.MOCK:
                return await self._start_mock_listening(language)
            elif self.engine == SpeechEngine.WEB_SPEECH_API:
                return await self._start_web_speech_listening(language)
            elif self.engine == SpeechEngine.WHISPER:
                return await self._start_whisper_listening(language)
            else:
                logger.error(f"Unsupported engine: {self.engine}")
                return False
                
        except Exception as e:
            logger.error(f"Error starting speech recognition: {e}")
            self.is_listening = False
            if self.callbacks["on_error"]:
                await self.callbacks["on_error"](str(e))
            return False
    
    async def stop_listening(self) -> bool:
        """Stop listening"""
        
        if not self.is_listening:
            return True
            
        logger.info("🛑 Stopping speech recognition")
        self.is_listening = False
        
        if self.callbacks["on_end"]:
            await self.callbacks["on_end"]()
            
        return True
    
    async def recognize_from_audio(self, audio_data: bytes, language: LanguageCode = LanguageCode.AUTO) -> SpeechRecognitionResult:
        """Recognize speech từ audio data"""
        
        start_time = time.time()
        
        try:
            if self.engine == SpeechEngine.MOCK:
                result = await self._mock_recognize_audio(audio_data, language)
            elif self.engine == SpeechEngine.WEB_SPEECH_API:
                result = await self._web_speech_recognize_audio(audio_data, language)  
            elif self.engine == SpeechEngine.WHISPER:
                result = await self._whisper_recognize_audio(audio_data, language)
            else:
                raise ValueError(f"Unsupported engine: {self.engine}")
                
            result.processing_time = time.time() - start_time
            result.engine_used = self.engine.value
            
            # Update stats
            self._update_stats(result)
            
            logger.info(f"✅ Speech recognized: '{result.transcript}' (confidence: {result.confidence:.2f})")
            return result
            
        except Exception as e:
            logger.error(f"Error recognizing speech: {e}")
            return SpeechRecognitionResult(
                transcript="",
                confidence=0.0,
                language=language.value,
                is_final=True,
                processing_time=time.time() - start_time,
                engine_used=self.engine.value
            )
    
    async def _start_mock_listening(self, language: LanguageCode) -> bool:
        """Mock listening implementation cho testing"""
        
        if self.callbacks["on_start"]:
            await self.callbacks["on_start"]()
        
        # Simulate listening với mock results
        mock_inputs = [
            "tìm icon home",
            "find search icon", 
            "tạo button component",
            "project info",
            "tìm biểu tượng menu cho navigation"
        ]
        
        for mock_input in mock_inputs:
            if not self.is_listening:
                break
                
            await asyncio.sleep(2)  # Simulate processing delay
            
            # Create mock result
            result = SpeechRecognitionResult(
                transcript=mock_input,
                confidence=0.85 + (hash(mock_input) % 15) / 100,  # Mock confidence 0.85-0.99
                language=language.value if language != LanguageCode.AUTO else "vi-VN",
                is_final=True,
                alternatives=[mock_input + " alt1", mock_input + " alt2"],
                engine_used="mock"
            )
            
            if self.callbacks["on_result"]:
                await self.callbacks["on_result"](result)
        
        return True
    
    async def _start_web_speech_listening(self, language: LanguageCode) -> bool:
        """Web Speech API listening (placeholder for browser integration)"""
        
        logger.info("📡 Web Speech API listening would start here")
        
        # This would integrate với Web Speech API trong browser environment
        # For now, return mock implementation
        return await self._start_mock_listening(language)
    
    async def _start_whisper_listening(self, language: LanguageCode) -> bool:
        """OpenAI Whisper listening (future implementation)"""
        
        logger.info("🤖 Whisper API listening would start here")
        
        # Future: Integrate với OpenAI Whisper API
        return await self._start_mock_listening(language)
    
    async def _mock_recognize_audio(self, audio_data: bytes, language: LanguageCode) -> SpeechRecognitionResult:
        """Mock audio recognition"""
        
        # Simulate processing delay
        await asyncio.sleep(0.5)
        
        # Mock transcriptions based on audio data length
        mock_transcripts = {
            "short": ["home", "menu", "icon", "button"],
            "medium": ["tìm icon home", "find search icon", "tạo button"],
            "long": ["tìm biểu tượng menu cho navigation", "create a new button component"]
        }
        
        # Determine transcript based on audio length
        audio_length = len(audio_data) if audio_data else 0
        if audio_length < 1000:
            category = "short"
        elif audio_length < 5000:
            category = "medium"
        else:
            category = "long"
            
        transcript = mock_transcripts[category][hash(str(audio_length)) % len(mock_transcripts[category])]
        
        return SpeechRecognitionResult(
            transcript=transcript,
            confidence=0.82 + (audio_length % 18) / 100,  # Mock confidence 0.82-0.99
            language=language.value if language != LanguageCode.AUTO else "vi-VN",
            is_final=True,
            alternatives=[transcript + " alternative"],
        )
    
    async def _web_speech_recognize_audio(self, audio_data: bytes, language: LanguageCode) -> SpeechRecognitionResult:
        """Web Speech API recognition (placeholder)"""
        
        # Future: Actual Web Speech API integration
        return await self._mock_recognize_audio(audio_data, language)
    
    async def _whisper_recognize_audio(self, audio_data: bytes, language: LanguageCode) -> SpeechRecognitionResult:
        """OpenAI Whisper recognition (future implementation)"""
        
        # Future: Actual Whisper API integration
        return await self._mock_recognize_audio(audio_data, language)
    
    def _update_stats(self, result: SpeechRecognitionResult):
        """Update recognition statistics"""
        
        self.session_stats["total_recognitions"] += 1
        
        if result.confidence > 0.5:
            self.session_stats["successful_recognitions"] += 1
        
        # Update average confidence
        total = self.session_stats["total_recognitions"]
        current_avg = self.session_stats["average_confidence"]
        self.session_stats["average_confidence"] = (current_avg * (total - 1) + result.confidence) / total
        
        # Update average processing time
        current_time_avg = self.session_stats["average_processing_time"]
        self.session_stats["average_processing_time"] = (current_time_avg * (total - 1) + result.processing_time) / total
    
    def get_supported_languages(self) -> List[Dict[str, str]]:
        """Get list of supported languages"""
        
        return [
            {"code": "vi-VN", "name": "Tiếng Việt", "native": "Tiếng Việt"},
            {"code": "en-US", "name": "English (US)", "native": "English"},
            {"code": "auto", "name": "Auto Detect", "native": "Tự động"}
        ]
    
    def get_session_stats(self) -> Dict[str, Any]:
        """Get current session statistics"""
        
        stats = self.session_stats.copy()
        stats["engine"] = self.engine.value
        stats["is_listening"] = self.is_listening
        stats["success_rate"] = (
            stats["successful_recognitions"] / stats["total_recognitions"] 
            if stats["total_recognitions"] > 0 else 0.0
        )
        
        return stats
    
    def get_engine_info(self) -> Dict[str, Any]:
        """Get information about current engine"""
        
        engine_info = {
            SpeechEngine.MOCK: {
                "name": "Mock Engine",
                "description": "Testing và development engine",
                "features": ["Offline", "Fast", "Predictable"],
                "limitations": ["Not real recognition", "Limited vocabulary"]
            },
            SpeechEngine.WEB_SPEECH_API: {
                "name": "Web Speech API",
                "description": "Browser-based speech recognition",
                "features": ["Real-time", "No server required", "Good accuracy"],
                "limitations": ["Browser only", "Internet required", "Limited browser support"]
            },
            SpeechEngine.WHISPER: {
                "name": "OpenAI Whisper",
                "description": "AI-powered speech recognition",
                "features": ["High accuracy", "Multiple languages", "Robust"],
                "limitations": ["Requires API key", "Internet required", "Processing time"]
            }
        }
        
        return engine_info.get(self.engine, {"name": "Unknown Engine"})
    
    async def test_recognition(self) -> Dict[str, Any]:
        """Test speech recognition functionality"""
        
        logger.info("🧪 Testing speech recognition")
        
        test_results = {
            "engine": self.engine.value,
            "tests": []
        }
        
        # Test 1: Basic recognition
        test_audio = b"mock_audio_data_for_testing"
        result = await self.recognize_from_audio(test_audio, LanguageCode.VIETNAMESE)
        
        test_results["tests"].append({
            "test": "Basic Recognition",
            "success": len(result.transcript) > 0,
            "transcript": result.transcript,
            "confidence": result.confidence,
            "processing_time": result.processing_time
        })
        
        # Test 2: Language detection
        result_en = await self.recognize_from_audio(test_audio, LanguageCode.ENGLISH_US)
        
        test_results["tests"].append({
            "test": "Language Detection",
            "success": result_en.language == LanguageCode.ENGLISH_US.value,
            "detected_language": result_en.language,
            "transcript": result_en.transcript
        })
        
        # Test 3: Confidence scoring
        confidence_test = result.confidence > 0.0 and result.confidence <= 1.0
        
        test_results["tests"].append({
            "test": "Confidence Scoring",
            "success": confidence_test,
            "confidence_range": f"{result.confidence:.2f} (0.0-1.0)",
            "valid": confidence_test
        })
        
        # Overall test result
        test_results["overall_success"] = all(test["success"] for test in test_results["tests"])
        test_results["summary"] = f"Passed {sum(1 for t in test_results['tests'] if t['success'])}/{len(test_results['tests'])} tests"
        
        logger.info(f"✅ Speech recognition test complete: {test_results['summary']}")
        return test_results 