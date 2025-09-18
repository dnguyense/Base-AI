import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import FileUpload from '../components/upload/FileUpload';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const UploadPage = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const fileUploadRef = useRef();

  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
  };

  const simulateUpload = async (file) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // Random progress between 5-20%
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          fileUploadRef.current?.updateFileStatus(file.id, 'completed');
          resolve();
        }
        
        fileUploadRef.current?.updateFileProgress(file.id, Math.floor(progress));
      }, 200);
      
      // Update status to uploading
      fileUploadRef.current?.updateFileStatus(file.id, 'uploading');
    });
  };

  const handleStartProcessing = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);

    try {
      // Simulate upload for each file
      for (const file of selectedFiles) {
        if (file.status === 'ready') {
          await simulateUpload(file);
        }
      }

      // Wait a bit then navigate to processing page
      setTimeout(() => {
        navigate('/compress', { 
          state: { 
            files: selectedFiles.filter(f => f.status === 'completed') 
          } 
        });
      }, 1000);

    } catch (error) {
      console.error('Upload failed:', error);
      setIsProcessing(false);
    }
  };

  const hasReadyFiles = selectedFiles.some(file => file.status === 'ready');
  const hasCompletedFiles = selectedFiles.some(file => file.status === 'completed');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Compress Your PDF Files
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Reduce file size while maintaining quality. Fast, secure, and easy to use.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm">Lightning fast</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm">100% secure</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm">Files deleted in 1 hour</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Upload PDF Files</CardTitle>
              <CardDescription>
                Select up to 5 PDF files (max 10MB each) to compress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                ref={fileUploadRef}
                onFilesSelected={handleFilesSelected}
                maxFiles={5}
                maxFileSize={10 * 1024 * 1024} // 10MB
              />
              
              {selectedFiles.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {hasCompletedFiles 
                        ? `${selectedFiles.filter(f => f.status === 'completed').length} file(s) uploaded successfully`
                        : `${selectedFiles.length} file(s) selected`
                      }
                    </div>
                    
                    <Button 
                      onClick={handleStartProcessing}
                      disabled={!hasReadyFiles || isProcessing}
                      className="gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Processing...
                        </>
                      ) : hasCompletedFiles ? (
                        <>
                          Continue to Compression
                          <ArrowRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Start Upload
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How it works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Upload your PDF files</p>
                    <p className="text-sm text-muted-foreground">Drag & drop or click to select</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Choose compression settings</p>
                    <p className="text-sm text-muted-foreground">Select quality level and options</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Download compressed files</p>
                    <p className="text-sm text-muted-foreground">Get your optimized PDFs instantly</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why choose us?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Secure & Private</p>
                    <p className="text-sm text-muted-foreground">All files are automatically deleted after 1 hour</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Fast Processing</p>
                    <p className="text-sm text-muted-foreground">Advanced algorithms for quick compression</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">No Registration</p>
                    <p className="text-sm text-muted-foreground">Start compressing immediately, no account needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;