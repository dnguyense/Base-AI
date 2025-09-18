import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const COMPRESSION_DEFAULTS = {
  quality: 'medium',
  removeMetadata: true,
  removeAnnotations: false,
  optimizeImages: true,
  imageQuality: 60,
  customDpi: 150,
};

const CompressionSettings = ({ value, onChange }) => {
  const [settings, setSettings] = useState({ ...COMPRESSION_DEFAULTS, ...value });
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authFetch } = useAuth();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await authFetch('/api/v1/pdf/options', {}, false);
        if (!response.ok) {
          throw new Error('Failed to load compression options');
        }
        const { options } = await response.json();
        setOptions(options);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    onChange?.(settings);
  }, [settings, onChange]);

  const updateSetting = (name, value) => {
    setSettings((previous) => ({ ...previous, [name]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compression Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading compression options…</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !options) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle>Compression Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">
            Failed to load compression settings. Default values will be applied.
          </p>
        </CardContent>
      </Card>
    );
  }

  const qualityOptions = options.quality.options;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Compression Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              Quality Level
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Choose how aggressively PDFs should be compressed.
                </TooltipContent>
              </Tooltip>
            </Label>
            <Select value={settings.quality} onValueChange={(value) => updateSetting('quality', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                {qualityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            <Switch
              checked={settings.removeMetadata}
              onCheckedChange={(checked) => updateSetting('removeMetadata', checked)}
            />
            <Label className="text-sm text-muted-foreground">Remove metadata to shrink file size</Label>

            <Switch
              checked={settings.removeAnnotations}
              onCheckedChange={(checked) => updateSetting('removeAnnotations', checked)}
            />
            <Label className="text-sm text-muted-foreground">Remove annotations</Label>

            <Switch
              checked={settings.optimizeImages}
              onCheckedChange={(checked) => updateSetting('optimizeImages', checked)}
            />
            <Label className="text-sm text-muted-foreground">Optimize embedded images</Label>
          </div>

          {settings.quality === 'custom' && (
            <div className="space-y-3">
              <Label>Image Quality ({settings.imageQuality}%)</Label>
              <Slider
                min={10}
                max={100}
                step={5}
                value={[settings.imageQuality]}
                onValueChange={([value]) => updateSetting('imageQuality', value)}
              />

              <Label>DPI ({settings.customDpi})</Label>
              <Slider
                min={72}
                max={300}
                step={12}
                value={[settings.customDpi]}
                onValueChange={([value]) => updateSetting('customDpi', value)}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default CompressionSettings;
