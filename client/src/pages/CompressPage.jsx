import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import CompressionSettings from '../components/compression/CompressionSettings';
import ProcessingResult from '../components/processing/ProcessingResult';
import { formatFileSize } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const CompressPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [settings, setSettings] = useState({
    quality: 'medium',
    removeMetadata: true,
    removeAnnotations: false,
    optimizeImages: true,
    imageQuality: 60,
    customDpi: 150,
  });
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const { authFetch, isAuthenticated, authError } = useAuth();
  const [jobId, setJobId] = useState(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    const files = location.state?.files;
    if (!files?.length) {
      navigate('/upload');
      return;
    }
    setSelectedFiles(files);
  }, [location.state, navigate]);

  const totalSize = useMemo(
    () => selectedFiles.reduce((sum, file) => sum + (file.size || 0), 0),
    [selectedFiles],
  );

  const resetErrors = () => setError(null);

  const closeEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => () => closeEventSource(), [closeEventSource]);

  const createDownloadUrl = useCallback(
    async (file, result) => {
      if (!result?.success || !result?.outputPath) {
        return null;
      }

      try {
        const response = await authFetch('/api/v1/download/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileId: file.id,
            fileName: result.fileName || file.originalName,
            filePath: result.outputPath,
          }),
        });

        const payload = await response.json().catch(() => ({}));
        if (response.ok && payload?.success && payload?.data?.downloadToken) {
          return `/api/v1/download/${payload.data.downloadToken}`;
        }
      } catch (tokenError) {
        console.error('Failed to create download token:', tokenError);
      }

      return null;
    },
    [authFetch],
  );

  const handleFileCompleted = useCallback(
    async (payload) => {
      const { file } = payload;
      const downloadUrl = await createDownloadUrl(file, file.result);

      setResults((previous) =>
        previous.map((entry) =>
          entry.id === file.id
            ? {
                ...entry,
                status: file.status,
                progress: file.progress,
                success: file.result?.success ?? false,
                originalSize: file.result?.originalSize ?? entry.originalSize,
                compressedSize: file.result?.compressedSize ?? entry.compressedSize,
                compressionRatio: file.result?.compressionRatio ?? entry.compressionRatio,
                downloadUrl,
                error: file.error || file.result?.error || null,
              }
            : entry,
        ),
      );
    },
    [createDownloadUrl],
  );

  const applyJobSnapshot = useCallback(
    (job) => {
      setJobStatus(job.status);
      setJobProgress(job.progress ?? 0);

      if (Array.isArray(job.files) && job.files.length > 0) {
        setResults(
          job.files.map((file, index) => {
            const result = job.results?.[index];
            return {
              id: file.id,
              originalName: file.originalName,
              status: file.status,
              progress: file.progress,
              success: result?.success ?? false,
              originalSize: result?.originalSize ?? file.size,
              compressedSize: result?.compressedSize ?? null,
              compressionRatio: result?.compressionRatio ?? null,
              downloadUrl: result?.downloadUrl ?? null,
              error: file.error || result?.error || null,
            };
          }),
        );
      }
    },
    [],
  );

  const subscribeToJob = useCallback(
    (jobIdentifier) => {
      closeEventSource();

      const source = new EventSource(`/api/v1/batch/events/${jobIdentifier}`);
      eventSourceRef.current = source;

      source.onmessage = async (event) => {
        try {
          const payload = JSON.parse(event.data);
          switch (payload.type) {
            case 'status':
              applyJobSnapshot(payload.job);
              break;
            case 'progress':
              setJobStatus('processing');
              setJobProgress(payload.data.progress ?? 0);
              break;
            case 'fileCompleted':
              await handleFileCompleted(payload.data);
              break;
            case 'completed': {
              applyJobSnapshot(payload.job);
              setSubmitting(false);
              closeEventSource();

              if (Array.isArray(payload.job.results)) {
                const enriched = await Promise.all(
                  payload.job.files.map(async (file, index) => {
                    const result = payload.job.results?.[index];
                    const downloadUrl = result?.success
                      ? await createDownloadUrl(file, result)
                      : null;
                    return {
                      id: file.id,
                      originalName: file.originalName,
                      status: result?.success ? 'completed' : 'failed',
                      progress: 100,
                      success: !!result?.success,
                      originalSize: result?.originalSize ?? file.size,
                      compressedSize: result?.compressedSize ?? null,
                      compressionRatio: result?.compressionRatio ?? null,
                      downloadUrl,
                      error: result?.error || file.error || null,
                    };
                  }),
                );
                setResults(enriched);
              }
              break;
            }
            case 'jobError':
              setError(payload.data?.error || 'Compression job failed.');
              setSubmitting(false);
              closeEventSource();
              break;
            default:
              break;
          }
        } catch (eventError) {
          console.error('Failed to process job event:', eventError);
        }
      };

      source.onerror = () => {
        console.error('Compression progress stream disconnected');
        setError((prev) => prev || 'Lost connection to progress stream.');
        closeEventSource();
      };
    },
    [applyJobSnapshot, closeEventSource, createDownloadUrl, handleFileCompleted],
  );

  const submitCompression = async () => {
    try {
      setSubmitting(true);
      resetErrors();
      setResults([]);
      setJobProgress(0);
      setJobStatus('pending');
      setJobId(null);

      if (!isAuthenticated) {
        setError(authError || 'Please sign in to compress files.');
        return;
      }

      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file.file ?? file);
      });

       formData.append('quality', settings.quality);
       formData.append('removeMetadata', String(settings.removeMetadata));
       formData.append('removeAnnotations', String(settings.removeAnnotations));
       formData.append('optimizeImages', String(settings.optimizeImages));
       formData.append('imageQuality', String(settings.imageQuality));
       formData.append('customDPI', String(settings.customDpi));

      const uploadResponse = await authFetch('/api/v1/batch/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const body = await uploadResponse.json().catch(() => ({}));
        throw new Error(body.error || 'Upload failed.');
      }

      const payload = await uploadResponse.json().catch(() => ({}));
      if (!payload.success || !payload.jobId) {
        throw new Error(payload.error || 'Failed to start compression job.');
      }

      setJobId(payload.jobId);
      subscribeToJob(payload.jobId);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unexpected error');
    } finally {
      // submitting will be cleared when job completes or errors
    }
  };

  const downloadAll = () => {
    results
      .filter((file) => file.success && file.downloadUrl)
      .forEach((file) => {
        const link = document.createElement('a');
        link.href = file.downloadUrl;
        link.download = file.fileName || file.id;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  };

  if (!selectedFiles.length) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/upload')} className="gap-2" disabled={submitting}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Compress PDF Files</h1>
              <p className="text-muted-foreground">
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected • Total size {formatFileSize(totalSize)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <CompressionSettings value={settings} onChange={setSettings} />

          {jobId && (
            <Card>
              <CardHeader>
                <CardTitle>Compression Progress</CardTitle>
                <CardDescription>
                  {jobStatus === 'completed'
                    ? 'Job completed successfully.'
                    : jobStatus === 'failed'
                      ? 'Job failed. Check results for errors.'
                      : 'Processing your files in real time.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={jobProgress} className="h-2" />
                <p className="text-sm text-muted-foreground">{jobProgress}% complete</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Files to compress</CardTitle>
              <CardDescription>Review files before you start compression.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">Original size: {formatFileSize(file.size)}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">Ready</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <p className="text-sm text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Compress {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} with {settings.quality} quality settings
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" onClick={() => navigate('/upload')} disabled={submitting}>
                    Add More Files
                  </Button>
                  <Button className="gap-2" onClick={submitCompression} disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Starting…
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Start Compression
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <ProcessingResult results={results} onDownloadAll={downloadAll} />
        </div>
      </div>
    </div>
  );
};

export default CompressPage;
