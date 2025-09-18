import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { formatFileSize } from '../../lib/utils';

const FileUpload = ({ onFilesSelected, maxFiles = 5, maxFileSize = 10 * 1024 * 1024 }) => {
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const showError = useCallback((messages) => {
    setErrors(messages);
    setTimeout(() => setErrors([]), 4000);
  }, []);

  const validate = (file) => {
    if (file.type !== 'application/pdf') {
      return `${file.name} must be a PDF`;
    }
    if (file.size > maxFiles) {
      return `${file.name} exceeds ${formatFileSize(maxFileSize)}`;
    }
    return null;
  };

  const appendFiles = useCallback((incoming) => {
    const incomingList = Array.from(incoming);
    if (files.length + incomingList.length > maxFiles) {
      showError([`Maximum ${maxFiles} files allowed per upload`]);
      return;
    }

    const rejected = [];
    const accepted = incomingList.map((file) => {
      const validationError = validate(file);
      if (validationError) {
        rejected.push(validationError);
        return null;
      }
      return {
        id: `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    }).filter(Boolean);

    if (rejected.length) {
      showError(rejected);
    }

    if (accepted.length) {
      const next = [...files, ...accepted];
      setFiles(next);
      onFilesSelected?.(next);
    }
  }, [files, maxFiles, maxFileSize, onFilesSelected, showError]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files?.length) {
      appendFiles(event.dataTransfer.files);
    }
  }, [appendFiles]);

  const handleInputChange = useCallback((event) => {
    if (event.target.files?.length) {
      appendFiles(event.target.files);
    }
    event.target.value = '';
  }, [appendFiles]);

  const removeFile = useCallback((fileId) => {
    const next = files.filter((file) => file.id !== fileId);
    setFiles(next);
    onFilesSelected?.(next);
  }, [files, onFilesSelected]);

  return (
    <div className="space-y-6">
      <Card onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload PDF Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-gray-400"
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => event.key === 'Enter' && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={handleInputChange}
            />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 font-medium mb-2">
              Drag & drop PDF files here, or click to select (max {maxFiles} files)
            </p>
            <p className="text-sm text-gray-500">
              Each file must be a PDF and under {formatFileSize(maxFileSize)}
            </p>
          </div>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
              {errors.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Files ({files.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
