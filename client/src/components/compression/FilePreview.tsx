import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Download, 
  FileText, 
  TrendingDown, 
  BarChart3, 
  Share, 
  Info,
  CheckCircle,
  Zap
} from 'lucide-react';
import { formatFileSize } from '../../lib/utils';

interface CompressionResult {
  id: string;
  fileName: string;
  originalSize: number;
  compressedSize: number;
  compressionRate: number;
  pageCount?: number;
  processingTime: number;
  quality: 'low' | 'medium' | 'high' | 'custom';
  downloadLink?: string;
  status: 'processing' | 'completed' | 'error';
}

interface FilePreviewProps {
  result: CompressionResult;
  onDownload?: (id: string) => void;
  onShare?: (id: string) => void;
  showPaywallPreview?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  result,
  onDownload,
  onShare,
  showPaywallPreview = false
}) => {
  const getSavingsColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 50) return 'text-blue-600';
    if (rate >= 30) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getSavingsBadgeVariant = (rate: number) => {
    if (rate >= 70) return 'default' as const;
    if (rate >= 50) return 'secondary' as const;
    return 'outline' as const;
  };

  const getQualityLabel = (quality: string) => {
    const labels = {
      low: 'Maximum Compression',
      medium: 'Balanced',
      high: 'High Quality',
      custom: 'Custom Settings'
    };
    return labels[quality as keyof typeof labels] || quality;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold truncate max-w-xs">
                {result.fileName}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={getSavingsBadgeVariant(result.compressionRate)}>
                  {result.compressionRate}% smaller
                </Badge>
                {result.status === 'completed' && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">Complete</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {result.status === 'completed' && (
            <div className="flex space-x-2">
              {onShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShare(result.id)}
                  className="flex items-center space-x-2"
                >
                  <Share className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              )}
              {onDownload && (
                <Button
                  onClick={() => onDownload(result.id)}
                  disabled={showPaywallPreview}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Size Comparison */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Size Comparison</span>
            </h4>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
              <span>Size reduction</span>
            </div>
          </div>

          {/* Visual size comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">Original</div>
              <div className="bg-red-100 rounded-lg p-4 relative">
                <div className="text-2xl font-bold text-red-700">
                  {formatFileSize(result.originalSize)}
                </div>
                <div className="text-xs text-red-600 mt-1">
                  100%
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">Compressed</div>
              <div className="bg-green-100 rounded-lg p-4 relative">
                <div className="text-2xl font-bold text-green-700">
                  {formatFileSize(result.compressedSize)}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {100 - result.compressionRate}%
                </div>
              </div>
            </div>
          </div>

          {/* Savings visualization */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Space Saved</span>
              <span className={`text-sm font-bold ${getSavingsColor(result.compressionRate)}`}>
                {formatFileSize(result.originalSize - result.compressedSize)}
              </span>
            </div>
            <Progress 
              value={result.compressionRate} 
              className="h-2"
            />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>0%</span>
              <span className={getSavingsColor(result.compressionRate)}>
                {result.compressionRate}% saved
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* File Information */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Pages</div>
            <div className="font-semibold">{result.pageCount || 'N/A'}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Quality</div>
            <div className="font-semibold text-xs">{getQualityLabel(result.quality)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Processing</div>
            <div className="font-semibold flex items-center justify-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>{result.processingTime}s</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="font-semibold text-green-600 capitalize">{result.status}</div>
          </div>
        </div>

        {/* Paywall Preview Message */}
        {showPaywallPreview && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Upgrade to Download
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Your file has been compressed successfully! Subscribe to any plan to download 
                  your compressed PDF and access unlimited compressions.
                </p>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.location.href = '/pricing'}
                >
                  View Plans
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Summary */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700 mb-1">
              {formatFileSize(result.originalSize - result.compressedSize)}
            </div>
            <div className="text-sm text-green-600">
              Total space saved • {result.compressionRate}% reduction
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Environmental impact: ~{((result.originalSize - result.compressedSize) / 1024 / 1024 * 0.1).toFixed(2)}g CO₂ saved
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilePreview;