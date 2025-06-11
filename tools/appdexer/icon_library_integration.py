#!/usr/bin/env python3
"""
Icon Library Integration for Review-Gate V2
Connects Review-Gate with Icon Library Worker API
"""

import asyncio
import json
import aiohttp
import os
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from urllib.parse import urlencode

logger = logging.getLogger(__name__)

class IconLibraryIntegration:
    """
    Integration layer between Review-Gate V2 and Icon Library Worker API
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize icon library integration"""
        self.config = config or {}
        self.api_base = self.config.get('api_url', 'https://icon-library.trungkientn.workers.dev')
        self.project_root = Path.cwd()
        self.icons_dir = Path(self.config.get('default_download_path', 'assets/icons'))
        self.session = None
        
        # Cache for performance
        self._cache = {
            'icon_sets': None,
            'search_results': {},
            'suggestions': {},
            'cache_time': None
        }
        
        logger.info(f"🎨 Icon Library Integration initialized")
        logger.info(f"📡 API Base: {self.api_base}")
        logger.info(f"📁 Icons Directory: {self.icons_dir}")

    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()

    def _clear_cache_if_needed(self):
        """Clear cache if older than 30 minutes"""
        import time
        now = time.time()
        if not self._cache['cache_time'] or now - self._cache['cache_time'] > 1800:
            self._cache = {
                'icon_sets': None,
                'search_results': {},
                'suggestions': {},
                'cache_time': now
            }

    async def search_icons(self, query: str, category: str = "", style: str = "", limit: int = 20) -> Dict[str, Any]:
        """
        Search for icons using the Icon Library API
        
        Args:
            query: Search query string
            category: Optional category filter (ui, social, etc.)
            style: Optional style filter (outlined, filled, etc.)
            limit: Maximum number of results to return
            
        Returns:
            Dictionary containing search results and metadata
        """
        try:
            self._clear_cache_if_needed()
            
            # Check cache first
            cache_key = f"{query}_{category}_{style}_{limit}"
            if cache_key in self._cache['search_results']:
                logger.info(f"🔍 Returning cached search results for: {query}")
                return self._cache['search_results'][cache_key]

            # Build API URL
            params = {'q': query}
            if category:
                params['category'] = category
            if style:
                params['style'] = style
                
            url = f"{self.api_base}/search"
            
            logger.info(f"🔍 Searching icons: {query} (category: {category}, style: {style})")
            
            if not self.session:
                self.session = aiohttp.ClientSession()
                
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Limit results
                    results = data.get('results', [])[:limit]
                    
                    formatted_results = {
                        'query': query,
                        'category': category,
                        'style': style,
                        'total': data.get('total', len(results)),
                        'displayed': len(results),
                        'results': self._format_icon_results(results)
                    }
                    
                    # Cache results
                    self._cache['search_results'][cache_key] = formatted_results
                    
                    logger.info(f"✅ Found {len(results)} icons for query: {query}")
                    return formatted_results
                    
                else:
                    logger.error(f"❌ Search API error: {response.status}")
                    return {'error': f'Search failed with status {response.status}'}
                    
        except Exception as e:
            logger.error(f"💥 Search error: {e}")
            return {'error': f'Search failed: {str(e)}'}

    async def suggest_icons(self, context: str, project_type: str = "", usage_hint: str = "", limit: int = 20) -> Dict[str, Any]:
        """
        Get AI-suggested icons based on context
        
        Args:
            context: Context description for icon suggestions
            project_type: Type of project (react, android, etc.)
            usage_hint: Hint about how icons will be used
            limit: Maximum number of suggestions
            
        Returns:
            Dictionary containing suggestions and metadata
        """
        try:
            self._clear_cache_if_needed()
            
            # Check cache
            cache_key = f"{context}_{project_type}_{usage_hint}_{limit}"
            if cache_key in self._cache['suggestions']:
                logger.info(f"🎯 Returning cached suggestions for: {context}")
                return self._cache['suggestions'][cache_key]

            # Build API URL
            params = {'context': context}
            if project_type:
                params['project_type'] = project_type
            if usage_hint:
                params['usage'] = usage_hint
                
            url = f"{self.api_base}/suggest"
            
            logger.info(f"🎯 Getting suggestions for context: {context}")
            
            if not self.session:
                self.session = aiohttp.ClientSession()
                
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Limit results
                    results = data.get('results', [])[:limit]
                    
                    formatted_suggestions = {
                        'context': context,
                        'project_type': project_type,
                        'usage_hint': usage_hint,
                        'total': data.get('total', len(results)),
                        'displayed': len(results),
                        'suggestions': self._format_icon_results(results),
                        'reasoning': data.get('reasoning', 'AI-suggested icons based on context')
                    }
                    
                    # Cache suggestions
                    self._cache['suggestions'][cache_key] = formatted_suggestions
                    
                    logger.info(f"✅ Got {len(results)} suggestions for context: {context}")
                    return formatted_suggestions
                    
                else:
                    logger.error(f"❌ Suggest API error: {response.status}")
                    return {'error': f'Suggestion failed with status {response.status}'}
                    
        except Exception as e:
            logger.error(f"💥 Suggestion error: {e}")
            return {'error': f'Suggestion failed: {str(e)}'}

    async def download_icon(self, icon_set_id: str, icon_name: str, target_path: str = None, organize: bool = True) -> Dict[str, Any]:
        """
        Download an icon to the project
        
        Args:
            icon_set_id: ID of the icon set
            icon_name: Name of the icon
            target_path: Optional custom target path
            organize: Whether to auto-organize into appropriate folder
            
        Returns:
            Dictionary containing download result and file info
        """
        try:
            # Get icon details first
            url = f"{self.api_base}/icon-sets/{icon_set_id}/icons/{icon_name}"
            
            logger.info(f"📥 Downloading icon: {icon_set_id}/{icon_name}")
            
            if not self.session:
                self.session = aiohttp.ClientSession()
                
            async with self.session.get(url) as response:
                if response.status == 200:
                    icon_data = await response.json()
                    
                    # Determine target directory
                    if target_path:
                        target_dir = Path(target_path).parent
                        filename = Path(target_path).name
                    else:
                        target_dir = self._get_target_directory(icon_data, organize)
                        filename = self._get_safe_filename(icon_name, icon_data.get('format', 'svg'))
                    
                    # Create directory if needed
                    full_target_dir = self.project_root / target_dir
                    full_target_dir.mkdir(parents=True, exist_ok=True)
                    
                    # Download actual icon file
                    icon_url = icon_data.get('url') or icon_data.get('svg_url')
                    if icon_url:
                        file_path = full_target_dir / filename
                        await self._download_file(icon_url, file_path)
                        
                        result = {
                            'success': True,
                            'icon_set_id': icon_set_id,
                            'icon_name': icon_name,
                            'file_path': str(file_path),
                            'relative_path': str(file_path.relative_to(self.project_root)),
                            'size': file_path.stat().st_size if file_path.exists() else 0,
                            'format': icon_data.get('format', 'svg'),
                            'category': icon_data.get('category', ''),
                            'tags': icon_data.get('tags', [])
                        }
                        
                        logger.info(f"✅ Icon downloaded: {file_path}")
                        return result
                    else:
                        logger.error(f"❌ No download URL found for icon: {icon_set_id}/{icon_name}")
                        return {'error': 'No download URL found for icon'}
                        
                else:
                    logger.error(f"❌ Icon details API error: {response.status}")
                    return {'error': f'Failed to get icon details: {response.status}'}
                    
        except Exception as e:
            logger.error(f"💥 Download error: {e}")
            return {'error': f'Download failed: {str(e)}'}

    async def batch_download(self, icons: List[Dict[str, str]], target_path: str = None, organize: bool = True) -> Dict[str, Any]:
        """
        Download multiple icons in batch
        
        Args:
            icons: List of icon dicts with 'icon_set_id' and 'icon_name'
            target_path: Optional base target path
            organize: Whether to auto-organize icons
            
        Returns:
            Dictionary containing batch download results
        """
        results = {
            'success': [],
            'failed': [],
            'total': len(icons),
            'downloaded': 0,
            'errors': []
        }
        
        logger.info(f"📦 Starting batch download of {len(icons)} icons")
        
        for i, icon in enumerate(icons):
            try:
                icon_set_id = icon.get('icon_set_id') or icon.get('set')
                icon_name = icon.get('icon_name') or icon.get('name')
                
                if not icon_set_id or not icon_name:
                    error_msg = f"Invalid icon data: {icon}"
                    results['errors'].append(error_msg)
                    results['failed'].append(icon)
                    continue
                
                # Download individual icon
                result = await self.download_icon(icon_set_id, icon_name, target_path, organize)
                
                if result.get('success'):
                    results['success'].append(result)
                    results['downloaded'] += 1
                    logger.info(f"✅ ({i+1}/{len(icons)}) Downloaded: {icon_set_id}/{icon_name}")
                else:
                    results['failed'].append({**icon, 'error': result.get('error')})
                    results['errors'].append(result.get('error'))
                    logger.error(f"❌ ({i+1}/{len(icons)}) Failed: {icon_set_id}/{icon_name}")
                
                # Small delay to avoid overwhelming the API
                await asyncio.sleep(0.1)
                
            except Exception as e:
                error_msg = f"Batch download error for {icon}: {e}"
                results['errors'].append(error_msg)
                results['failed'].append(icon)
                logger.error(error_msg)
        
        logger.info(f"📦 Batch download complete: {results['downloaded']}/{len(icons)} successful")
        return results

    def _format_icon_results(self, icons: List[Dict]) -> List[Dict]:
        """Format icon results for consistent output"""
        formatted = []
        
        for icon in icons:
            formatted_icon = {
                'icon_set_id': icon.get('icon_set_id') or icon.get('set'),
                'icon_name': icon.get('icon_name') or icon.get('name'),
                'display_name': icon.get('display_name') or icon.get('name', '').replace('-', ' ').title(),
                'category': icon.get('category', ''),
                'style': icon.get('style', ''),
                'tags': icon.get('tags', []),
                'preview_url': icon.get('preview_url') or icon.get('svg_url'),
                'download_url': icon.get('url') or icon.get('svg_url'),
                'format': icon.get('format', 'svg'),
                'size': icon.get('size', ''),
                'license': icon.get('license', ''),
                'attribution': icon.get('attribution', '')
            }
            formatted.append(formatted_icon)
        
        return formatted

    def _get_target_directory(self, icon_data: Dict, organize: bool = True) -> Path:
        """Determine target directory for icon based on its properties"""
        if not organize:
            return self.icons_dir
        
        category = icon_data.get('category', '').lower()
        style = icon_data.get('style', '').lower()
        
        # Create organized directory structure
        if category:
            if style:
                return self.icons_dir / category / style
            else:
                return self.icons_dir / category
        else:
            return self.icons_dir / 'misc'

    def _get_safe_filename(self, icon_name: str, format: str = 'svg') -> str:
        """Generate safe filename for icon"""
        # Clean icon name
        safe_name = icon_name.lower().replace(' ', '-').replace('_', '-')
        # Remove special characters
        safe_name = ''.join(c for c in safe_name if c.isalnum() or c == '-')
        # Ensure proper extension
        if not safe_name.endswith(f'.{format}'):
            safe_name = f"{safe_name}.{format}"
        return safe_name

    async def _download_file(self, url: str, target_path: Path):
        """Download file from URL to target path"""
        if not self.session:
            self.session = aiohttp.ClientSession()
            
        async with self.session.get(url) as response:
            if response.status == 200:
                content = await response.read()
                with open(target_path, 'wb') as f:
                    f.write(content)
            else:
                raise Exception(f"Failed to download file: {response.status}")

    async def get_icon_sets(self) -> Dict[str, Any]:
        """Get list of available icon sets"""
        try:
            self._clear_cache_if_needed()
            
            if self._cache['icon_sets']:
                return {'icon_sets': self._cache['icon_sets']}
            
            url = f"{self.api_base}/icon-sets"
            
            if not self.session:
                self.session = aiohttp.ClientSession()
                
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    self._cache['icon_sets'] = data.get('iconSets', [])
                    return data
                else:
                    return {'error': f'Failed to get icon sets: {response.status}'}
                    
        except Exception as e:
            logger.error(f"💥 Get icon sets error: {e}")
            return {'error': f'Failed to get icon sets: {str(e)}'}

    def analyze_context_for_icons(self, message: str) -> Dict[str, Any]:
        """
        Analyze user message to determine if they need icons
        
        Args:
            message: User message to analyze
            
        Returns:
            Dictionary with analysis results and suggestions
        """
        message_lower = message.lower()
        
        # Keywords that indicate icon needs
        icon_keywords = [
            'icon', 'icons', 'logo', 'symbol', 'graphic', 'image',
            'button', 'menu', 'navigation', 'ui', 'interface'
        ]
        
        # Context detection patterns
        contexts = {
            'navigation': ['nav', 'menu', 'header', 'navigation', 'route', 'link'],
            'social': ['social', 'facebook', 'twitter', 'instagram', 'linkedin', 'share'],
            'ui': ['button', 'form', 'input', 'ui', 'interface', 'component'],
            'mobile': ['mobile', 'app', 'android', 'ios', 'phone', 'device'],
            'web': ['web', 'website', 'html', 'css', 'react', 'vue'],
            'ecommerce': ['shop', 'cart', 'buy', 'product', 'payment', 'store'],
            'weather': ['weather', 'sun', 'rain', 'cloud', 'temperature'],
            'data': ['chart', 'graph', 'data', 'analytics', 'dashboard']
        }
        
        # Check if message contains icon-related keywords
        needs_icons = any(keyword in message_lower for keyword in icon_keywords)
        
        # Detect context
        detected_contexts = []
        for context, keywords in contexts.items():
            if any(keyword in message_lower for keyword in keywords):
                detected_contexts.append(context)
        
        # Extract potential search terms
        search_terms = []
        for keyword in icon_keywords:
            if keyword in message_lower:
                # Look for words around the keyword
                words = message_lower.split()
                if keyword in words:
                    idx = words.index(keyword)
                    # Get surrounding words
                    start = max(0, idx - 2)
                    end = min(len(words), idx + 3)
                    context_words = words[start:end]
                    search_terms.extend([w for w in context_words if w not in icon_keywords])
        
        return {
            'needs_icons': needs_icons,
            'confidence': 0.8 if needs_icons and detected_contexts else 0.3 if needs_icons else 0.1,
            'detected_contexts': detected_contexts,
            'suggested_searches': list(set(search_terms)),
            'reasoning': f"Detected icon need with contexts: {', '.join(detected_contexts)}" if detected_contexts else "No clear icon context detected"
        }

# Usage example and test functions
async def test_icon_integration():
    """Test function for icon library integration"""
    async with IconLibraryIntegration() as icon_lib:
        # Test search
        print("🔍 Testing icon search...")
        search_result = await icon_lib.search_icons("home", category="ui", limit=5)
        print(f"Search result: {json.dumps(search_result, indent=2)}")
        
        # Test suggestions
        print("\n🎯 Testing icon suggestions...")
        suggest_result = await icon_lib.suggest_icons("navigation menu for mobile app", limit=3)
        print(f"Suggestion result: {json.dumps(suggest_result, indent=2)}")
        
        # Test context analysis
        print("\n🧠 Testing context analysis...")
        analysis = icon_lib.analyze_context_for_icons("I need some icons for my navigation menu")
        print(f"Context analysis: {json.dumps(analysis, indent=2)}")

if __name__ == "__main__":
    # Run test
    asyncio.run(test_icon_integration()) 