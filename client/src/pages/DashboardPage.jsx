import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/toast';

const DashboardPage = () => {
  const { user, subscription, isPremium } = useAuth();
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== newFiles.length) {
      toast.warning('Only PDF files are supported');
    }

    // Check file size limits
    const maxSize = isPremium ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB pro, 10MB free
    const validFiles = pdfFiles.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max size: ${isPremium ? '50MB' : '10MB'}`);
        return false;
      }
      return true;
    });

    // Check daily limits for free users
    if (!isPremium) {
      const today = new Date().toDateString();
      const todayUploads = files.filter(f => f.uploadDate === today).length;
      
      if (todayUploads + validFiles.length > 3) {
        toast.error('Free plan limited to 3 files per day. Upgrade to Pro for unlimited files.');
        return;
      }
    }

    const processedFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      originalSize: file.size,
      compressedSize: null,
      status: 'pending', // pending, processing, completed, error
      progress: 0,
      downloadUrl: null,
      uploadDate: new Date().toDateString(),
      file: file
    }));

    setFiles(prev => [...prev, ...processedFiles]);
    
    if (validFiles.length > 0) {
      toast.success(`Added ${validFiles.length} file(s) for compression`);
    }
  };

  const startCompression = (fileId) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, status: 'processing', progress: 0 }
        : file
    ));

    // Simulate compression process
    const simulateProgress = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Simulate completion
          setFiles(prev => prev.map(file => 
            file.id === fileId 
              ? { 
                  ...file, 
                  status: 'completed', 
                  progress: 100,
                  compressedSize: Math.floor(file.originalSize * (0.3 + Math.random() * 0.4)), // 30-70% compression
                  downloadUrl: '#' // This would be actual download URL from backend
                }
              : file
          ));
          
          toast.success('File compressed successfully!');
        } else {
          setFiles(prev => prev.map(file => 
            file.id === fileId 
              ? { ...file, progress }
              : file
          ));
        }
      }, 200);
    };

    simulateProgress();
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompressionRatio = (original, compressed) => {
    if (!compressed) return 0;
    return Math.round(((original - compressed) / original) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || user?.email}</p>
        </div>

        {/* Subscription Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Subscription Status
              </h2>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isPremium 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {isPremium ? 'Pro Plan' : 'Free Plan'}
                </span>
                {isPremium && (
                  <span className="text-sm text-gray-600">
                    Expires: {subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : 'Never'}
                  </span>
                )}
              </div>
            </div>
            {!isPremium && (
              <Link
                to="/pricing"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {files.filter(f => f.uploadDate === new Date().toDateString()).length}
                {!isPremium && ' / 3'}
              </div>
              <div className="text-sm text-gray-600">Files Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatFileSize(files.reduce((acc, file) => acc + (file.originalSize - (file.compressedSize || file.originalSize)), 0))}
              </div>
              <div className="text-sm text-gray-600">Space Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {files.filter(f => f.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Files Compressed</div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload PDF Files</h2>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-primary'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Drop PDF files here</h3>
            <p className="text-gray-500 mb-4">or click to browse files</p>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Select Files
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Max file size: {isPremium ? '50MB' : '10MB'} | 
              {isPremium ? ' Unlimited files' : ' 3 files per day'}
            </p>
          </div>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Your Files</h2>
            </div>
            <div className="divide-y">
              {files.map(file => (
                <div key={file.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formatFileSize(file.originalSize)}</span>
                            {file.compressedSize && (
                              <>
                                <span>→</span>
                                <span className="text-green-600 font-medium">
                                  {formatFileSize(file.compressedSize)} 
                                  ({getCompressionRatio(file.originalSize, file.compressedSize)}% smaller)
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {file.status === 'processing' && (
                        <div className="mt-2">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Processing... {Math.round(file.progress)}%</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {file.status === 'pending' && (
                        <button
                          onClick={() => startCompression(file.id)}
                          className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          Compress
                        </button>
                      )}
                      
                      {file.status === 'completed' && (
                        <a
                          href={file.downloadUrl}
                          download
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Download
                        </a>
                      )}
                      
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No files uploaded</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by uploading your first PDF file.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;