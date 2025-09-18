# Test Files

This directory contains sample files used for E2E testing of the PDF compression application.

## Files Included

### sample.pdf
- **Size**: ~500 bytes
- **Pages**: 1
- **Content**: Simple text "Test PDF Document"
- **Usage**: Basic compression testing, file upload validation

### large-sample.pdf
- **Size**: ~1.5 KB
- **Pages**: 3
- **Content**: Multi-page document with Lorem ipsum text
- **Usage**: Large file compression testing, batch processing, progress tracking

## Usage in Tests

These files are referenced in the test data configuration and used across multiple test suites:

- **Authentication Tests**: No file usage
- **Compression Tests**: Both files used for various compression scenarios
- **Subscription Tests**: Files used to test compression limits
- **Settings Tests**: Files used to test API usage tracking
- **Visual Tests**: Files used for UI state verification

## File Generation

These PDF files were programmatically generated to ensure consistency across test runs. They contain minimal content to keep file sizes small while still being valid PDF documents that can be processed by the compression engine.

## Security Note

These are test-only files with no sensitive content. They should only be used in development and testing environments.