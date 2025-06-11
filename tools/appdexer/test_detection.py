#!/usr/bin/env python3
"""
Test script để kiểm tra Appdexer project detection
"""

import asyncio
import sys
import os
from pathlib import Path

# Add current directory to path để import modules
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from core.project_detector import ProjectDetector, ProjectType
from core.mcp_loader import AppdexerCore

async def test_current_project():
    """Test detection trên current Base-AI-Project"""
    
    # Get project root (3 levels up từ current file)
    project_root = Path(__file__).parent.parent.parent.parent
    
    print("🔍 Testing Appdexer Project Detection")
    print("=" * 50)
    print(f"📁 Project Root: {project_root}")
    print()
    
    # Test Project Detector
    print("🤖 Running Project Detection...")
    detector = ProjectDetector(str(project_root))
    
    detected_types = await detector.detect_project_type()
    
    print(f"✅ Detected Project Types: {[pt.value for pt in detected_types]}")
    print(f"📊 Confidence Scores:")
    for project_type, score in detector.confidence_scores.items():
        print(f"   - {project_type.value}: {score:.2f}")
    
    print()
    print("📋 Project Info:")
    project_info = detector.get_project_info()
    for key, value in project_info.items():
        print(f"   - {key}: {value}")
    
    print()
    print("📂 Resource Paths:")
    resource_paths = detector.get_resource_paths()
    for project_type, path in resource_paths.items():
        print(f"   - {project_type.value}: {path}")
    
    return detected_types

async def test_appdexer_core():
    """Test full Appdexer Core setup"""
    
    project_root = Path(__file__).parent.parent.parent.parent
    
    print("\n" + "=" * 50)
    print("🚀 Testing Appdexer Core Auto-Setup")
    print("=" * 50)
    
    # Initialize Appdexer Core
    appdexer = AppdexerCore(str(project_root))
    
    # Run auto-setup
    setup_info = await appdexer.auto_setup()
    
    print("✅ Auto-Setup Complete!")
    print(f"📊 Setup Summary:")
    for key, value in setup_info.items():
        if key == "confidence_scores":
            print(f"   - {key}:")
            for pt, score in value.items():
                print(f"     * {pt}: {score:.2f}")
        elif isinstance(value, list) and len(value) > 3:
            print(f"   - {key}: {len(value)} items")
        else:
            print(f"   - {key}: {value}")
    
    print()
    print("🛠️ Available Tools by Context:")
    
    contexts = ["general", "icon", "resource"]
    for context in contexts:
        tools = await appdexer.get_tools_for_context(context)
        print(f"   - {context}: {len(tools)} tools")
        if tools:
            for tool in tools[:3]:  # Show first 3 tools
                print(f"     * {tool}")
            if len(tools) > 3:
                print(f"     * ... and {len(tools) - 3} more")
    
    return setup_info

async def test_tool_calling():
    """Test calling specific tools"""
    
    project_root = Path(__file__).parent.parent.parent.parent
    
    print("\n" + "=" * 50)
    print("🔧 Testing Tool Calling")
    print("=" * 50)
    
    appdexer = AppdexerCore(str(project_root))
    await appdexer.auto_setup()
    
    # Get available tools
    available_tools = appdexer.mcp_loader.get_available_tools()
    
    if available_tools:
        # Test calling first available tool
        test_tool = available_tools[0]
        print(f"🧪 Testing tool: {test_tool}")
        
        try:
            result = await appdexer.call_tool(test_tool, query="test", limit=5)
            print(f"✅ Tool call successful!")
            print(f"📄 Result:")
            for key, value in result.items():
                if key not in ["args", "kwargs"]:  # Skip verbose output
                    print(f"   - {key}: {value}")
                    
        except Exception as e:
            print(f"❌ Tool call failed: {e}")
    else:
        print("❌ No tools available to test")

async def main():
    """Main test function"""
    
    print("🎯 Appdexer System Test Suite")
    print("=" * 50)
    
    try:
        # Test 1: Project Detection
        detected_types = await test_current_project()
        
        # Test 2: Core Setup
        setup_info = await test_appdexer_core()
        
        # Test 3: Tool Calling
        await test_tool_calling()
        
        print("\n" + "=" * 50)
        print("✅ All Tests Completed Successfully!")
        print("🎉 Appdexer Core System is Working!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test Failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1) 