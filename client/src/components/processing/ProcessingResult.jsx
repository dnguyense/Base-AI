import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Progress } from '../ui/progress';
import { formatFileSize } from '../../lib/utils';

const ProcessingResult = ({ results, onDownloadAll }) => {
  if (!results?.length) {
    return null;
  }

  const successCount = results.filter((file) => file.success).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Compression Results</span>
          <Button onClick={onDownloadAll} disabled={successCount === 0} className="gap-2">
            <Download className="h-4 w-4" />
            Download All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {results.map((file) => {
          const isProcessing = file.status === 'processing' || file.status === 'pending';
          const isFailed = file.status === 'failed';

          return (
            <div key={file.id} className="border rounded-md p-3 bg-muted/20">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {file.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : isFailed ? (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{file.originalName}</p>
                    {file.success && file.compressedSize != null ? (
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.originalSize)} → {formatFileSize(file.compressedSize)}
                        {file.compressionRatio ? ` (${file.compressionRatio}% smaller)` : ''}
                      </p>
                    ) : isFailed ? (
                      <p className="text-sm text-destructive">
                        {file.error || 'Compression failed'}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {isProcessing ? `Processing… ${Math.round(file.progress ?? 0)}%` : 'Queued'}
                      </p>
                    )}
                  </div>
                </div>
                {file.success && file.downloadUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = file.downloadUrl;
                      link.download = file.fileName || file.id;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    Download
                  </Button>
                )}
              </div>
              {isProcessing && (
                <div className="mt-3">
                  <Progress value={file.progress ?? 0} className="h-2" />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ProcessingResult;
