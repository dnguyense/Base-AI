import os
import json
import glob
from pathlib import Path
from typing import Dict, List, Optional, Set
from enum import Enum
import asyncio

class ProjectType(Enum):
    ANDROID = "android"
    IOS = "ios"
    REACT = "react"
    VUE = "vue"
    NODEJS = "nodejs"
    FLUTTER = "flutter"
    REACT_NATIVE = "react_native"
    ANGULAR = "angular"
    PYTHON = "python"
    UNKNOWN = "unknown"

class ProjectDetector:
    """Auto-detect project type và setup appropriate MCP tools"""
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.detected_types: Set[ProjectType] = set()
        self.confidence_scores: Dict[ProjectType, float] = {}
        
    async def detect_project_type(self) -> List[ProjectType]:
        """Scan project files và return detected types with confidence"""
        
        detectors = [
            (self._detect_android, ProjectType.ANDROID),
            (self._detect_ios, ProjectType.IOS),
            (self._detect_flutter, ProjectType.FLUTTER),
            (self._detect_react_native, ProjectType.REACT_NATIVE),
            (self._detect_react, ProjectType.REACT),
            (self._detect_vue, ProjectType.VUE),
            (self._detect_angular, ProjectType.ANGULAR),
            (self._detect_nodejs, ProjectType.NODEJS),
            (self._detect_python, ProjectType.PYTHON),
        ]
        
        # Run all detectors
        for detector_func, project_type in detectors:
            confidence = await detector_func()
            if confidence > 0:
                self.detected_types.add(project_type)
                self.confidence_scores[project_type] = confidence
                
        # Sort by confidence score
        sorted_types = sorted(
            self.detected_types, 
            key=lambda t: self.confidence_scores[t], 
            reverse=True
        )
        
        return sorted_types if sorted_types else [ProjectType.UNKNOWN]
    
    async def _detect_android(self) -> float:
        """Detect Android project with confidence score"""
        signals = [
            ("app/build.gradle", 0.4),
            ("build.gradle", 0.2), 
            ("AndroidManifest.xml", 0.3),
            ("app/src/main/AndroidManifest.xml", 0.4),
            ("gradle.properties", 0.1),
            ("app/src/main/java", 0.3),
            ("app/src/main/kotlin", 0.3),
        ]
        
        return self._calculate_confidence(signals)
    
    async def _detect_ios(self) -> float:
        """Detect iOS project with confidence score"""
        signals = []
        
        # Check for Xcode project files
        xcode_projects = list(self.project_root.glob("*.xcodeproj"))
        xcode_workspaces = list(self.project_root.glob("*.xcworkspace"))
        
        if xcode_projects:
            signals.append(("*.xcodeproj", 0.5))
        if xcode_workspaces:
            signals.append(("*.xcworkspace", 0.4))
            
        static_signals = [
            ("Info.plist", 0.2),
            ("ios/Info.plist", 0.3),
            ("ios/Podfile", 0.3),
            ("Podfile", 0.2),
        ]
        
        signals.extend(static_signals)
        return self._calculate_confidence(signals)
        
    async def _detect_flutter(self) -> float:
        """Detect Flutter project with confidence score"""
        signals = [
            ("pubspec.yaml", 0.5),
            ("lib/main.dart", 0.4),
            ("android/app/src/main/kotlin", 0.1),
            ("ios/Runner/Info.plist", 0.1),
        ]
        
        return self._calculate_confidence(signals)
        
    async def _detect_react_native(self) -> float:
        """Detect React Native project with confidence score"""
        if not (self.project_root / "package.json").exists():
            return 0.0
            
        # Check package.json for react-native
        try:
            with open(self.project_root / "package.json", 'r') as f:
                package_data = json.load(f)
                
            dependencies = package_data.get("dependencies", {})
            dev_dependencies = package_data.get("devDependencies", {})
            
            confidence = 0.0
            if "react-native" in dependencies:
                confidence += 0.6
            if "@react-native-community" in str(dependencies):
                confidence += 0.1
            if "metro-react-native-babel-preset" in dev_dependencies:
                confidence += 0.1
                
            # Check for RN specific files
            rn_signals = [
                ("metro.config.js", 0.1),
                ("android/app/src/main/java", 0.1),
                ("ios/Podfile", 0.1),
            ]
            
            confidence += self._calculate_confidence(rn_signals)
            return min(confidence, 1.0)
            
        except (json.JSONDecodeError, FileNotFoundError):
            return 0.0
        
    async def _detect_react(self) -> float:
        """Detect React project with confidence score"""
        if not (self.project_root / "package.json").exists():
            return 0.0
            
        try:
            with open(self.project_root / "package.json", 'r') as f:
                package_data = json.load(f)
                
            dependencies = package_data.get("dependencies", {})
            dev_dependencies = package_data.get("devDependencies", {})
            
            # Don't detect as React if it's React Native
            if "react-native" in dependencies:
                return 0.0
                
            confidence = 0.0
            if "react" in dependencies:
                confidence += 0.5
            if "react-dom" in dependencies:
                confidence += 0.2
            if "react-scripts" in dependencies or "react-scripts" in dev_dependencies:
                confidence += 0.2
                
            # Check for React specific files
            react_signals = [
                ("src/App.js", 0.1),
                ("src/App.jsx", 0.1),
                ("src/App.tsx", 0.1),
                ("public/index.html", 0.1),
            ]
            
            confidence += self._calculate_confidence(react_signals)
            return min(confidence, 1.0)
            
        except (json.JSONDecodeError, FileNotFoundError):
            return 0.0
        
    async def _detect_vue(self) -> float:
        """Detect Vue project with confidence score"""
        if not (self.project_root / "package.json").exists():
            return 0.0
            
        try:
            with open(self.project_root / "package.json", 'r') as f:
                package_data = json.load(f)
                
            dependencies = package_data.get("dependencies", {})
            dev_dependencies = package_data.get("devDependencies", {})
            
            confidence = 0.0
            if "vue" in dependencies:
                confidence += 0.5
            if "@vue/cli-service" in dev_dependencies:
                confidence += 0.2
                
            # Check for Vue specific files
            vue_signals = [
                ("vue.config.js", 0.1),
                ("src/App.vue", 0.2),
                ("src/main.js", 0.1),
            ]
            
            confidence += self._calculate_confidence(vue_signals)
            return min(confidence, 1.0)
            
        except (json.JSONDecodeError, FileNotFoundError):
            return 0.0
            
    async def _detect_angular(self) -> float:
        """Detect Angular project with confidence score"""
        signals = [
            ("angular.json", 0.4),
            ("src/app/app.module.ts", 0.3),
            ("src/app/app.component.ts", 0.2),
            ("package.json", 0.0),  # Will check content separately
        ]
        
        confidence = self._calculate_confidence(signals[:-1])  # Exclude package.json
        
        # Check package.json for Angular
        if (self.project_root / "package.json").exists():
            try:
                with open(self.project_root / "package.json", 'r') as f:
                    package_data = json.load(f)
                    
                dependencies = package_data.get("dependencies", {})
                if "@angular/core" in dependencies:
                    confidence += 0.4
                    
            except (json.JSONDecodeError, FileNotFoundError):
                pass
                
        return min(confidence, 1.0)
        
    async def _detect_nodejs(self) -> float:
        """Detect Node.js backend project with confidence score"""
        if not (self.project_root / "package.json").exists():
            return 0.0
            
        try:
            with open(self.project_root / "package.json", 'r') as f:
                package_data = json.load(f)
                
            dependencies = package_data.get("dependencies", {})
            
            # Don't detect as Node.js if it's a frontend framework
            frontend_indicators = ["react", "vue", "@angular/core", "react-native"]
            if any(indicator in dependencies for indicator in frontend_indicators):
                return 0.0
                
            confidence = 0.2  # Base score for having package.json
            
            # Backend-specific packages
            backend_packages = ["express", "fastify", "koa", "hapi", "nestjs"]
            for package in backend_packages:
                if package in dependencies:
                    confidence += 0.3
                    break
                    
            # Check for backend-specific files
            backend_signals = [
                ("server.js", 0.2),
                ("app.js", 0.1),
                ("index.js", 0.1),
                ("src/server.js", 0.2),
            ]
            
            confidence += self._calculate_confidence(backend_signals)
            return min(confidence, 1.0)
            
        except (json.JSONDecodeError, FileNotFoundError):
            return 0.0
            
    async def _detect_python(self) -> float:
        """Detect Python project with confidence score"""
        signals = [
            ("requirements.txt", 0.3),
            ("pyproject.toml", 0.3),
            ("setup.py", 0.2),
            ("Pipfile", 0.2),
            ("poetry.lock", 0.2),
            ("main.py", 0.1),
            ("app.py", 0.1),
        ]
        
        return self._calculate_confidence(signals)
    
    def _calculate_confidence(self, signals: List[tuple]) -> float:
        """Calculate confidence score based on file/directory existence"""
        total_confidence = 0.0
        
        for signal_path, weight in signals:
            if self._path_exists(signal_path):
                total_confidence += weight
                
        return min(total_confidence, 1.0)
    
    def _path_exists(self, path_pattern: str) -> bool:
        """Check if path exists, supporting glob patterns"""
        if "*" in path_pattern:
            # Use glob for wildcard patterns
            matches = list(self.project_root.glob(path_pattern))
            return len(matches) > 0
        else:
            # Direct path check
            return (self.project_root / path_pattern).exists()
    
    def get_project_info(self) -> Dict:
        """Get comprehensive project information"""
        return {
            "detected_types": [t.value for t in self.detected_types],
            "confidence_scores": {t.value: score for t, score in self.confidence_scores.items()},
            "primary_type": list(self.detected_types)[0].value if self.detected_types else ProjectType.UNKNOWN.value,
            "project_root": str(self.project_root),
            "is_multi_platform": len(self.detected_types) > 1
        }
        
    def get_resource_paths(self) -> Dict[ProjectType, str]:
        """Get appropriate resource paths for each detected project type"""
        
        path_mapping = {
            ProjectType.ANDROID: "app/src/main/res/drawable/",
            ProjectType.IOS: "Assets.xcassets/",
            ProjectType.REACT: "src/assets/icons/",
            ProjectType.VUE: "src/assets/icons/",
            ProjectType.ANGULAR: "src/assets/icons/",
            ProjectType.NODEJS: "public/assets/icons/",
            ProjectType.FLUTTER: "assets/icons/",
            ProjectType.REACT_NATIVE: "assets/icons/",
            ProjectType.PYTHON: "static/icons/",
        }
        
        return {pt: path_mapping.get(pt, "assets/icons/") for pt in self.detected_types} 