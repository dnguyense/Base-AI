import React from 'react';
import { Settings, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const CompressionSettings = ({ 
  settings, 
  onSettingsChange, 
  onCompress, 
  isProcessing, 
  hasFiles 
}) => {
  const qualityOptions = [
    { value: 'low', label: 'Low Quality (Smallest size)', description: 'Maximum compression' },
    { value: 'medium', label: 'Medium Quality (Balanced)', description: 'Good balance of size and quality' },
    { value: 'high', label: 'High Quality (Larger size)', description: 'Minimal compression' },
    { value: 'custom', label: 'Custom Quality', description: 'Set your own quality level' }
  ];

  const handleQualityChange = (value) => {
    onSettingsChange(prev => ({
      ...prev,
      quality: value
    }));
  };

  const handleCustomQualityChange = (e) => {
    const value = parseInt(e.target.value);
    onSettingsChange(prev => ({
      ...prev,
      customQuality: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Compression Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Compression Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Level
            </label>
            <Select value={settings.quality} onValueChange={handleQualityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select quality level" />
              </SelectTrigger>
              <SelectContent>
                {qualityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {settings.quality === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Quality ({settings.customQuality}%)
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={settings.customQuality}
                onChange={handleCustomQualityChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Smallest</span>
                <span>Balanced</span>
                <span>Original</span>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-1">Quality Guide:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Low:</strong> 50-70% size reduction</li>
              <li>• <strong>Medium:</strong> 30-50% size reduction</li>
              <li>• <strong>High:</strong> 10-30% size reduction</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Compress Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={onCompress}
            disabled={!hasFiles || isProcessing}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Compressing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Compress PDF{hasFiles && ` (${hasFiles} file${hasFiles > 1 ? 's' : ''})`}
              </>
            )}
          </Button>
          
          {!hasFiles && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Upload PDF files to start compression
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• PDFs with images compress better than text-only PDFs</li>
            <li>• Large PDFs (>5MB) see the most dramatic size reduction</li>
            <li>• Medium quality offers the best balance for most uses</li>
            <li>• All compression is done securely and files are deleted after download</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompressionSettings;