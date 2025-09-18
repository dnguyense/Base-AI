import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { 
  Download, 
  FileText, 
  TrendingDown, 
  Share2, 
  Eye,
  CheckCircle,
  BarChart3
} from 'lucide-react';

const FilePreview = ({ 
  originalFile, 
  compressedFile, 
  onDownload, 
  onShare,
  showPaywall = false 
}) => {
  // Calculate compression statistics
  const originalSize = originalFile?.size || 0;
  const compressedSize = compressedFile?.size || 0;
  const compressionRatio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize) * 100 : 0;
  const sizeSaved = originalSize - compressedSize;

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get compression level badge
  const getCompressionBadge = () => {
    if (compressionRatio >= 50) return { text: 'Excellent', variant: 'default', color: 'text-green-600' };
    if (compressionRatio >= 30) return { text: 'Good', variant: 'secondary', color: 'text-blue-600' };
    if (compressionRatio >= 15) return { text: 'Moderate', variant: 'outline', color: 'text-orange-600' };
    return { text: 'Minimal', variant: 'destructive', color: 'text-gray-600' };
  };

  const compressionBadge = getCompressionBadge();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {originalFile?.name || 'Compressed File'}
              </CardTitle>
              <CardDescription>
                Compression results and file comparison
              </CardDescription>
            </div>
          </div>
          <Badge variant={compressionBadge.variant} className="gap-1">
            <TrendingDown className="h-3 w-3" />
            {compressionBadge.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Size Comparison Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Original Size */}
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-muted-foreground">
              {formatFileSize(originalSize)}
            </div>
            <div className="text-sm text-muted-foreground">Original Size</div>
          </div>

          {/* Compressed Size */}
          <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="text-2xl font-bold text-primary">
              {formatFileSize(compressedSize)}
            </div>
            <div className="text-sm text-muted-foreground">Compressed Size</div>
          </div>

          {/* Size Saved */}
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {formatFileSize(sizeSaved)}
            </div>
            <div className="text-sm text-muted-foreground">Space Saved</div>
          </div>
        </div>

        {/* Compression Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Compression Ratio</span>
            <span className={`text-sm font-bold ${compressionBadge.color}`}>
              {Math.round(compressionRatio)}%
            </span>
          </div>
          <Progress value={compressionRatio} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <Separator />

        {/* File Information Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">File Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">File Name:</span>
              <p className="font-medium">{originalFile?.name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">File Type:</span>
              <p className="font-medium">PDF Document</p>
            </div>
            <div>
              <span className="text-muted-foreground">Pages:</span>
              <p className="font-medium">{compressedFile?.pages || originalFile?.pages || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Processed:</span>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Visual Size Comparison Chart */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Size Comparison
          </h4>
          <div className="space-y-2">
            {/* Original File Bar */}
            <div className="flex items-center gap-3">
              <div className="w-16 text-xs text-muted-foreground">Original</div>
              <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                <div 
                  className="bg-muted-foreground h-full rounded-full"
                  style={{ width: '100%' }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  {formatFileSize(originalSize)}
                </div>
              </div>
            </div>
            
            {/* Compressed File Bar */}
            <div className="flex items-center gap-3">
              <div className="w-16 text-xs text-muted-foreground">Compressed</div>
              <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.max(10, 100 - compressionRatio)}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  {formatFileSize(compressedSize)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Savings Statistics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Savings Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-lg font-bold text-green-600">
                {Math.round(compressionRatio)}%
              </div>
              <div className="text-xs text-green-700">Size Reduction</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-lg font-bold text-blue-600">
                {formatFileSize(sizeSaved)}
              </div>
              <div className="text-xs text-blue-700">Space Saved</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-lg font-bold text-purple-600">
                ≈{Math.round(sizeSaved / (1024 * 1024) * 10) / 10}x
              </div>
              <div className="text-xs text-purple-700">Bandwidth Saved</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-lg font-bold text-orange-600">
                {Math.round((sizeSaved / originalSize) * 1000) / 10}%
              </div>
              <div className="text-xs text-orange-700">Storage Saved</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {!showPaywall ? (
            <>
              {/* Download Preview (Free) */}
              <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="text-sm font-medium">Download Preview</h4>
                      <p className="text-xs text-muted-foreground">
                        See compression results before download
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Preview
                  </Button>
                </div>
              </div>

              {/* Download Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => onDownload && onDownload(compressedFile)}
                  className="flex-1 gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Compressed File
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => onShare && onShare(compressedFile)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            /* Paywall State */
            <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border">
              <div className="text-center space-y-4">
                <div className="p-3 bg-primary/20 rounded-full w-fit mx-auto">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Compression Complete!</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upgrade to download your compressed file
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button className="gap-2">
                    <Download className="h-4 w-4" />
                    Upgrade to Download
                  </Button>
                  <Button variant="outline" size="sm">
                    Share Results
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shareable Results Link */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Share Results</h4>
              <p className="text-xs text-muted-foreground">
                Share your compression results with others
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-3 w-3" />
              Copy Link
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilePreview;