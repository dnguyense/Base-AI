import React, { useState, useCallback } from 'react';
import { 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Save,
  Palette,
  Type,
  Image as ImageIcon,
  FileText,
  Monitor,
  Smartphone,
  Printer,
  Eye,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';

const AdvancedCompressionSettings = ({ 
  onSettingsChange, 
  initialSettings = {},
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expertMode, setExpertMode] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('custom');

  // Default advanced settings
  const [settings, setSettings] = useState({
    // DPI Settings
    dpi: initialSettings.dpi || 150,
    customDPI: initialSettings.customDPI || 150,
    
    // Color Space Options
    colorSpace: initialSettings.colorSpace || 'auto',
    convertToGrayscale: initialSettings.convertToGrayscale || false,
    
    // Image Quality
    imageQuality: initialSettings.imageQuality || 60,
    downsampleImages: initialSettings.downsampleImages || true,
    imageCompression: initialSettings.imageCompression || 'jpeg',
    
    // Font Optimization
    optimizeFonts: initialSettings.optimizeFonts || true,
    embedFonts: initialSettings.embedFonts || true,
    fontSubsetting: initialSettings.fontSubsetting || true,
    
    // Metadata & Structure
    preserveMetadata: initialSettings.preserveMetadata || false,
    preserveBookmarks: initialSettings.preserveBookmarks || true,
    preserveAnnotations: initialSettings.preserveAnnotations || true,
    preserveFormFields: initialSettings.preserveFormFields || true,
    
    // Advanced Options
    linearize: initialSettings.linearize || false,
    removeUnusedObjects: initialSettings.removeUnusedObjects || true,
    compressStreams: initialSettings.compressStreams || true,
    
    ...initialSettings
  });

  // Preset configurations
  const presets = {
    web: {
      name: 'Web Optimized',
      description: 'Optimized for web viewing with smaller file sizes',
      icon: Monitor,
      settings: {
        dpi: 72,
        colorSpace: 'rgb',
        imageQuality: 50,
        downsampleImages: true,
        imageCompression: 'jpeg',
        optimizeFonts: true,
        embedFonts: false,
        fontSubsetting: true,
        preserveMetadata: false,
        preserveBookmarks: true,
        preserveAnnotations: false,
        linearize: true,
        removeUnusedObjects: true,
        compressStreams: true
      }
    },
    mobile: {
      name: 'Mobile Friendly',
      description: 'Optimized for mobile devices with minimal file sizes',
      icon: Smartphone,
      settings: {
        dpi: 96,
        colorSpace: 'rgb',
        imageQuality: 40,
        downsampleImages: true,
        imageCompression: 'jpeg',
        optimizeFonts: true,
        embedFonts: false,
        fontSubsetting: true,
        preserveMetadata: false,
        preserveBookmarks: false,
        preserveAnnotations: false,
        linearize: true,
        removeUnusedObjects: true,
        compressStreams: true
      }
    },
    print: {
      name: 'Print Quality',
      description: 'High quality for printing with larger file sizes',
      icon: Printer,
      settings: {
        dpi: 300,
        colorSpace: 'cmyk',
        imageQuality: 85,
        downsampleImages: false,
        imageCompression: 'lossless',
        optimizeFonts: true,
        embedFonts: true,
        fontSubsetting: false,
        preserveMetadata: true,
        preserveBookmarks: true,
        preserveAnnotations: true,
        linearize: false,
        removeUnusedObjects: false,
        compressStreams: true
      }
    },
    archive: {
      name: 'Archive Quality',
      description: 'Maximum quality preservation for long-term storage',
      icon: FileText,
      settings: {
        dpi: 300,
        colorSpace: 'auto',
        imageQuality: 95,
        downsampleImages: false,
        imageCompression: 'lossless',
        optimizeFonts: false,
        embedFonts: true,
        fontSubsetting: false,
        preserveMetadata: true,
        preserveBookmarks: true,
        preserveAnnotations: true,
        preserveFormFields: true,
        linearize: false,
        removeUnusedObjects: false,
        compressStreams: false
      }
    }
  };

  // Handle settings update
  const updateSettings = useCallback((newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    setSelectedPreset('custom');
    onSettingsChange?.(updatedSettings);
  }, [settings, onSettingsChange]);

  // Apply preset
  const applyPreset = useCallback((presetKey) => {
    const preset = presets[presetKey];
    if (preset) {
      setSettings(preset.settings);
      setSelectedPreset(presetKey);
      onSettingsChange?.(preset.settings);
    }
  }, [onSettingsChange]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    const defaultSettings = {
      dpi: 150,
      colorSpace: 'auto',
      imageQuality: 60,
      downsampleImages: true,
      imageCompression: 'jpeg',
      optimizeFonts: true,
      embedFonts: true,
      fontSubsetting: true,
      preserveMetadata: false,
      preserveBookmarks: true,
      preserveAnnotations: true,
      preserveFormFields: true,
      linearize: false,
      removeUnusedObjects: true,
      compressStreams: true
    };
    setSettings(defaultSettings);
    setSelectedPreset('custom');
    onSettingsChange?.(defaultSettings);
  }, [onSettingsChange]);

  return (
    <div className={cn("border rounded-lg bg-card", className)}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Advanced Compression Settings</h3>
          {!isExpanded && (
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
              {selectedPreset === 'custom' ? 'Custom' : presets[selectedPreset]?.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpertMode(!expertMode);
              }}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                expertMode 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              Expert Mode
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="border-t p-4 space-y-6">
          {/* Quick Presets */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Quick Presets</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(presets).map(([key, preset]) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-md border transition-colors text-center",
                      selectedPreset === key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card hover:bg-accent/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <div>
                      <p className="text-xs font-medium">{preset.name}</p>
                      <p className="text-xs text-muted-foreground hidden md:block">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DPI Settings */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              DPI Settings
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">DPI Resolution</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="72"
                    max="600"
                    step="24"
                    value={settings.dpi}
                    onChange={(e) => updateSettings({ dpi: parseInt(e.target.value) })}
                    className="flex-1 max-w-24"
                  />
                  <span className="text-xs text-muted-foreground w-12">{settings.dpi} DPI</span>
                </div>
              </div>
              {expertMode && (
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground">Custom DPI</label>
                  <input
                    type="number"
                    min="72"
                    max="1200"
                    value={settings.customDPI}
                    onChange={(e) => updateSettings({ customDPI: parseInt(e.target.value) || 150 })}
                    className="w-20 px-2 py-1 text-xs border rounded bg-background"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Color Space Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color Space
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">Color Profile</label>
                <select
                  value={settings.colorSpace}
                  onChange={(e) => updateSettings({ colorSpace: e.target.value })}
                  className="px-2 py-1 text-xs border rounded bg-background"
                >
                  <option value="auto">Auto Detect</option>
                  <option value="rgb">RGB</option>
                  <option value="cmyk">CMYK</option>
                  <option value="grayscale">Grayscale</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">Convert to Grayscale</label>
                <input
                  type="checkbox"
                  checked={settings.convertToGrayscale}
                  onChange={(e) => updateSettings({ convertToGrayscale: e.target.checked })}
                  className="rounded"
                />
              </div>
            </div>
          </div>

          {/* Image Quality */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Image Optimization
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">Image Quality</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={settings.imageQuality}
                    onChange={(e) => updateSettings({ imageQuality: parseInt(e.target.value) })}
                    className="flex-1 max-w-24"
                  />
                  <span className="text-xs text-muted-foreground w-8">{settings.imageQuality}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">Downsample Images</label>
                <input
                  type="checkbox"
                  checked={settings.downsampleImages}
                  onChange={(e) => updateSettings({ downsampleImages: e.target.checked })}
                  className="rounded"
                />
              </div>
              {expertMode && (
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground">Compression Method</label>
                  <select
                    value={settings.imageCompression}
                    onChange={(e) => updateSettings({ imageCompression: e.target.value })}
                    className="px-2 py-1 text-xs border rounded bg-background"
                  >
                    <option value="jpeg">JPEG</option>
                    <option value="jpeg2000">JPEG 2000</option>
                    <option value="lossless">Lossless</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Font Optimization */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Type className="h-4 w-4" />
              Font Optimization
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">Optimize Fonts</label>
                <input
                  type="checkbox"
                  checked={settings.optimizeFonts}
                  onChange={(e) => updateSettings({ optimizeFonts: e.target.checked })}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">Embed Fonts</label>
                <input
                  type="checkbox"
                  checked={settings.embedFonts}
                  onChange={(e) => updateSettings({ embedFonts: e.target.checked })}
                  className="rounded"
                />
              </div>
              {expertMode && (
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground">Font Subsetting</label>
                  <input
                    type="checkbox"
                    checked={settings.fontSubsetting}
                    onChange={(e) => updateSettings({ fontSubsetting: e.target.checked })}
                    className="rounded"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Metadata Preservation */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Info className="h-4 w-4" />
              Content Preservation
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">Preserve Metadata</label>
                <input
                  type="checkbox"
                  checked={settings.preserveMetadata}
                  onChange={(e) => updateSettings({ preserveMetadata: e.target.checked })}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">Preserve Bookmarks</label>
                <input
                  type="checkbox"
                  checked={settings.preserveBookmarks}
                  onChange={(e) => updateSettings({ preserveBookmarks: e.target.checked })}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">Preserve Annotations</label>
                <input
                  type="checkbox"
                  checked={settings.preserveAnnotations}
                  onChange={(e) => updateSettings({ preserveAnnotations: e.target.checked })}
                  className="rounded"
                />
              </div>
              {expertMode && (
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground">Preserve Form Fields</label>
                  <input
                    type="checkbox"
                    checked={settings.preserveFormFields}
                    onChange={(e) => updateSettings({ preserveFormFields: e.target.checked })}
                    className="rounded"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Expert Mode Advanced Options */}
          {expertMode && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Advanced Options
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground">Linearize PDF</label>
                  <input
                    type="checkbox"
                    checked={settings.linearize}
                    onChange={(e) => updateSettings({ linearize: e.target.checked })}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground">Remove Unused Objects</label>
                  <input
                    type="checkbox"
                    checked={settings.removeUnusedObjects}
                    onChange={(e) => updateSettings({ removeUnusedObjects: e.target.checked })}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground">Compress Streams</label>
                  <input
                    type="checkbox"
                    checked={settings.compressStreams}
                    onChange={(e) => updateSettings({ compressStreams: e.target.checked })}
                    className="rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t">
            <button
              onClick={resetToDefaults}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to Defaults
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpertMode(!expertMode)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded transition-colors",
                  expertMode 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                <Eye className="h-3 w-3 mr-1" />
                {expertMode ? 'Exit Expert Mode' : 'Expert Mode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedCompressionSettings;