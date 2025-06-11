import asyncio
import importlib
from typing import Dict, List, Optional, Any, Callable
from pathlib import Path
import json
import logging

from .project_detector import ProjectType, ProjectDetector

logger = logging.getLogger(__name__)

class MCPToolsLoader:
    """Dynamically load MCP tools based on detected project types"""
    
    def __init__(self):
        self.loaded_tools: Dict[ProjectType, List[str]] = {}
        self.project_configs: Dict[ProjectType, Dict] = {}
        self.tool_handlers: Dict[str, Callable] = {}
        self.is_initialized = False
        
    async def setup_tools_for_project(self, project_types: List[ProjectType], project_root: str):
        """Setup MCP tools cho detected project types"""
        
        logger.info(f"Setting up tools for project types: {[pt.value for pt in project_types]}")
        
        for project_type in project_types:
            tools = await self._get_tools_for_type(project_type)
            config = await self._get_config_for_type(project_type, project_root)
            
            self.loaded_tools[project_type] = tools
            self.project_configs[project_type] = config
            
            # Load tool handlers
            await self._load_tool_handlers(project_type, tools)
            
        self.is_initialized = True
        logger.info(f"Successfully loaded tools for {len(project_types)} project types")
        
    async def _get_tools_for_type(self, project_type: ProjectType) -> List[str]:
        """Return list of MCP tools cho specific project type"""
        
        tool_mapping = {
            ProjectType.ANDROID: [
                "android_icon_search",
                "android_drawable_manager", 
                "android_resource_generator",
                "vector_drawable_converter",
                "android_manifest_updater"
            ],
            ProjectType.IOS: [
                "ios_asset_search",
                "ios_bundle_manager",
                "ios_icon_generator", 
                "ios_size_variants",
                "ios_info_plist_updater"
            ],
            ProjectType.REACT: [
                "react_icon_search",
                "react_component_generator",
                "svg_optimizer",
                "react_icon_import_generator",
                "jsx_component_creator"
            ],
            ProjectType.VUE: [
                "vue_icon_search", 
                "vue_component_generator",
                "svg_optimizer",
                "vue_icon_import_generator",
                "vue_sfc_creator"
            ],
            ProjectType.ANGULAR: [
                "angular_icon_search",
                "angular_component_generator", 
                "svg_optimizer",
                "angular_module_updater"
            ],
            ProjectType.NODEJS: [
                "web_asset_manager",
                "static_file_organizer",
                "svg_optimizer",
                "express_static_setup"
            ],
            ProjectType.FLUTTER: [
                "flutter_asset_manager",
                "flutter_icon_generator",
                "pubspec_updater",
                "flutter_widget_creator"
            ],
            ProjectType.REACT_NATIVE: [
                "rn_asset_manager",
                "rn_platform_manager", 
                "rn_icon_generator",
                "rn_bundle_manager"
            ],
            ProjectType.PYTHON: [
                "python_static_manager",
                "django_static_setup",
                "flask_static_setup",
                "svg_optimizer"
            ]
        }
        
        return tool_mapping.get(project_type, ["generic_asset_manager"])
        
    async def _get_config_for_type(self, project_type: ProjectType, project_root: str) -> Dict:
        """Generate configuration cho specific project type"""
        
        base_config = {
            "project_root": project_root,
            "project_type": project_type.value,
            "icon_library_api": "https://icon-library.leejungkiin.workers.dev",
            "auto_organize": True,
            "preferred_formats": ["svg"],
            "cache_enabled": True,
        }
        
        # Project-specific configurations
        project_specific = {
            ProjectType.ANDROID: {
                "resource_path": "app/src/main/res/drawable/",
                "preferred_formats": ["xml", "png"],
                "density_variants": ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"],
                "vector_drawable_support": True,
                "manifest_path": "app/src/main/AndroidManifest.xml"
            },
            ProjectType.IOS: {
                "resource_path": "Assets.xcassets/",
                "preferred_formats": ["png", "pdf"],
                "size_variants": ["@1x", "@2x", "@3x"],
                "asset_catalog_support": True,
                "info_plist_path": "Info.plist"
            },
            ProjectType.REACT: {
                "resource_path": "src/assets/icons/",
                "preferred_formats": ["svg", "png"],
                "component_style": "functional",
                "typescript_support": True,
                "styled_components": False
            },
            ProjectType.VUE: {
                "resource_path": "src/assets/icons/",
                "preferred_formats": ["svg", "png"],
                "component_style": "composition",
                "typescript_support": True,
                "vue_version": "3"
            },
            ProjectType.ANGULAR: {
                "resource_path": "src/assets/icons/",
                "preferred_formats": ["svg"],
                "component_style": "standalone",
                "typescript_support": True,
                "angular_material": False
            },
            ProjectType.NODEJS: {
                "resource_path": "public/assets/icons/",
                "preferred_formats": ["svg", "png"],
                "static_serving": True,
                "express_integration": True
            },
            ProjectType.FLUTTER: {
                "resource_path": "assets/icons/",
                "preferred_formats": ["svg", "png"],
                "pubspec_auto_update": True,
                "widget_generation": True
            },
            ProjectType.REACT_NATIVE: {
                "resource_path": "assets/icons/",
                "preferred_formats": ["png", "svg"],
                "platform_specific": True,
                "vector_icons": True
            },
            ProjectType.PYTHON: {
                "resource_path": "static/icons/",
                "preferred_formats": ["svg", "png"],
                "django_support": False,
                "flask_support": False
            }
        }
        
        # Merge base config with project-specific config
        config = {**base_config, **project_specific.get(project_type, {})}
        
        return config
        
    async def _load_tool_handlers(self, project_type: ProjectType, tools: List[str]):
        """Load tool handlers for specific project type"""
        
        for tool_name in tools:
            handler_func = await self._create_tool_handler(project_type, tool_name)
            if handler_func:
                self.tool_handlers[tool_name] = handler_func
                logger.debug(f"Loaded handler for tool: {tool_name}")
                
    async def _create_tool_handler(self, project_type: ProjectType, tool_name: str) -> Optional[Callable]:
        """Create handler function for specific tool"""
        
        async def tool_handler(*args, **kwargs):
            """Generic tool handler that delegates to specific implementation"""
            
            # Get project config
            config = self.project_configs.get(project_type, {})
            
            # Call appropriate tool implementation
            result = await self._execute_tool(project_type, tool_name, config, *args, **kwargs)
            
            return result
            
        return tool_handler
        
    async def _execute_tool(self, project_type: ProjectType, tool_name: str, config: Dict, *args, **kwargs) -> Dict:
        """Execute specific tool with project context"""
        
        # This is where we'll implement actual tool execution
        # For now, return mock response
        
        return {
            "tool": tool_name,
            "project_type": project_type.value,
            "status": "success",
            "config": config,
            "args": args,
            "kwargs": kwargs,
            "message": f"Tool {tool_name} executed for {project_type.value} project"
        }
        
    def get_available_tools(self, project_type: Optional[ProjectType] = None) -> List[str]:
        """Get list of available tools for project type"""
        
        if project_type:
            return self.loaded_tools.get(project_type, [])
        else:
            # Return all loaded tools
            all_tools = []
            for tools_list in self.loaded_tools.values():
                all_tools.extend(tools_list)
            return list(set(all_tools))  # Remove duplicates
            
    def get_tool_config(self, project_type: ProjectType) -> Dict:
        """Get configuration for specific project type"""
        return self.project_configs.get(project_type, {})
        
    async def call_tool(self, tool_name: str, *args, **kwargs) -> Dict:
        """Call specific tool by name"""
        
        if not self.is_initialized:
            raise RuntimeError("MCPToolsLoader not initialized. Call setup_tools_for_project() first.")
            
        if tool_name not in self.tool_handlers:
            raise ValueError(f"Tool '{tool_name}' not available. Available tools: {list(self.tool_handlers.keys())}")
            
        handler = self.tool_handlers[tool_name]
        return await handler(*args, **kwargs)
        
    def is_tool_available(self, tool_name: str) -> bool:
        """Check if tool is available"""
        return tool_name in self.tool_handlers
        
    def get_project_summary(self) -> Dict:
        """Get summary of loaded project configurations"""
        
        return {
            "initialized": self.is_initialized,
            "project_types": [pt.value for pt in self.loaded_tools.keys()],
            "total_tools": len(self.tool_handlers),
            "tools_by_type": {
                pt.value: tools for pt, tools in self.loaded_tools.items()
            }
        }

class AppdexerCore:
    """Main Appdexer system coordinator"""
    
    def __init__(self, project_root: str):
        self.project_root = project_root
        self.detector = ProjectDetector(project_root)
        self.mcp_loader = MCPToolsLoader()
        self.project_types: List[ProjectType] = []
        self.is_setup = False
        
    async def auto_setup(self) -> Dict:
        """Auto-detect project and setup appropriate tools"""
        
        logger.info(f"Starting auto-setup for project: {self.project_root}")
        
        # Step 1: Detect project types
        self.project_types = await self.detector.detect_project_type()
        logger.info(f"Detected project types: {[pt.value for pt in self.project_types]}")
        
        # Step 2: Setup MCP tools
        await self.mcp_loader.setup_tools_for_project(self.project_types, self.project_root)
        
        self.is_setup = True
        
        # Return setup summary
        setup_info = {
            "project_root": self.project_root,
            "detected_types": [pt.value for pt in self.project_types],
            "confidence_scores": self.detector.confidence_scores,
            "primary_type": self.project_types[0].value if self.project_types else "unknown",
            "available_tools": self.mcp_loader.get_available_tools(),
            "resource_paths": self.detector.get_resource_paths(),
            "setup_complete": True
        }
        
        logger.info("Auto-setup completed successfully")
        return setup_info
        
    async def get_tools_for_context(self, context: str = "general") -> List[str]:
        """Get relevant tools based on context"""
        
        if not self.is_setup:
            await self.auto_setup()
            
        # Return tools based on context and project types
        relevant_tools = []
        
        for project_type in self.project_types:
            tools = self.mcp_loader.get_available_tools(project_type)
            
            # Filter tools based on context
            if context == "icon":
                icon_tools = [t for t in tools if "icon" in t.lower()]
                relevant_tools.extend(icon_tools)
            elif context == "resource":
                resource_tools = [t for t in tools if any(keyword in t.lower() for keyword in ["resource", "asset", "manager"])]
                relevant_tools.extend(resource_tools)
            else:
                relevant_tools.extend(tools)
                
        return list(set(relevant_tools))  # Remove duplicates
        
    async def call_tool(self, tool_name: str, *args, **kwargs) -> Dict:
        """Proxy call to MCP loader"""
        
        if not self.is_setup:
            await self.auto_setup()
            
        return await self.mcp_loader.call_tool(tool_name, *args, **kwargs) 