# E2E Testing Suite for PDF Compressor Pro

Complete end-to-end testing solution using Playwright with comprehensive coverage of all application features and user flows.

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Client and server applications running
- Test dependencies installed

### Installation
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

#### Basic Test Execution
```bash
# Run all tests
npm test

# Run specific test suite
npm run test:auth
npm run test:compression
npm run test:subscription
npm run test:visual
npm run test:performance
```

#### Using Test Runner Script
```bash
# Run with default settings
./scripts/run-tests.sh

# Run specific browser
./scripts/run-tests.sh --browser firefox --headed

# Run specific test types
./scripts/run-tests.sh --type auth,compression

# Run with performance testing
./scripts/run-tests.sh --type performance --workers 1

# Update visual snapshots
./scripts/run-tests.sh --update-snapshots
```

## Test Coverage

### Authentication Tests (auth.spec.ts)
- User registration and login flows
- Social authentication (Google, Facebook)
- Two-factor authentication
- Password reset functionality
- Account verification
- Session management

### Compression Tests (compression.spec.ts)
- File upload and validation
- PDF compression with different settings
- Batch file processing
- Download processed files
- Compression quality settings
- File size optimization
- Error handling for invalid files

### Subscription Tests (subscription.spec.ts)
- Plan selection and comparison
- Payment processing with Stripe
- Subscription upgrades/downgrades
- Billing history and invoices
- Usage tracking and limits
- Cancellation and renewal
- Free trial management

### Settings Tests (settings.spec.ts)
- User profile management
- Account preferences
- Notification settings
- Privacy and security settings
- Data export and deletion
- API key management
- Theme and language preferences

### Visual Tests (visual.spec.ts)
- Screenshot comparison testing
- UI component consistency
- Responsive design validation
- Cross-browser visual testing
- Dark/light theme testing
- Loading states and animations

### Performance Tests (performance.spec.ts)
- Page load performance
- Core Web Vitals measurement
- API response times
- File upload/download speed
- Memory usage monitoring
- Network performance testing

## Test Architecture

### Page Object Model
All tests use the Page Object Model pattern for maintainability:

```
fixtures/page-objects/
├── BasePage.ts          # Base functionality
├── HomePage.ts          # Homepage interactions
├── AuthPage.ts          # Authentication flows
├── CompressPage.ts      # Compression features
├── SubscriptionPage.ts  # Subscription management
├── SettingsPage.ts      # User settings
└── PricingPage.ts       # Pricing and plans
```

### Test Data Management
```
fixtures/test-files/
├── sample.pdf           # Small test file (500 bytes)
├── large-sample.pdf     # Larger test file (1.6KB)
└── README.md           # Test file documentation
```

## Configuration

### Browser Support
- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)

### Environment Variables
- `BASE_URL`: Application base URL (default: http://localhost:3000)
- `API_URL`: API base URL (default: http://localhost:5001)

### Test Configuration
See `playwright.config.ts` for detailed configuration including:
- Timeout settings
- Retry policies
- Reporter configuration
- Global setup/teardown

## CI/CD Integration

Tests are configured to run automatically in GitHub Actions:

### Workflow Triggers
- Pull requests to main branch
- Push to main branch
- Manual workflow dispatch
- Scheduled daily runs

### Test Reports
- HTML reports generated in `test-results/`
- Screenshots and videos for failed tests
- Performance metrics and lighthouse reports
- Visual diff reports for regression tests

## Best Practices

### Writing Tests
1. Use descriptive test names that explain the expected behavior
2. Follow the AAA pattern (Arrange, Act, Assert)
3. Keep tests atomic and independent
4. Use page objects for UI interactions
5. Include both positive and negative test cases

### Test Data
1. Use realistic but minimal test data
2. Clean up test data after each test
3. Use fixtures for reusable test data
4. Avoid dependencies on external data

### Assertions
1. Use specific assertions that clearly indicate what failed
2. Wait for elements to be in the expected state
3. Test user-visible behavior, not implementation details
4. Include accessibility checks where appropriate

## Troubleshooting

### Common Issues
1. **Tests failing due to timing**: Increase timeouts or add explicit waits
2. **Visual tests failing**: Update snapshots or check for actual UI changes
3. **File upload tests failing**: Verify test files exist and are accessible
4. **Authentication tests failing**: Check test credentials and API endpoints

### Debug Mode
```bash
# Run tests in debug mode
npx playwright test --debug

# Run specific test in debug mode
npx playwright test auth.spec.ts --debug

# Generate trace files
npx playwright test --trace on
```

### Test Reports
```bash
# Open latest HTML report
npx playwright show-report

# View test results
npx playwright show-trace trace.zip
```

## Performance Monitoring

### Metrics Tracked
- First Contentful Paint (FCP) < 1.8s
- Largest Contentful Paint (LCP) < 2.5s
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1
- Time to Interactive (TTI) < 3.8s

### Performance Budgets
- Homepage load time < 3s
- API response time < 500ms
- File upload processing < 5s
- Page navigation < 2s

## Contributing

### Adding New Tests
1. Create new spec file in `tests/` directory
2. Extend existing page objects or create new ones
3. Follow existing naming conventions
4. Add test documentation
5. Update CI/CD pipeline if needed

### Updating Page Objects
1. Keep page objects focused on single responsibility
2. Use getter methods for element selectors
3. Add methods for common user actions
4. Include error handling for edge cases

### Test Maintenance
1. Review and update tests regularly
2. Remove obsolete tests when features are removed
3. Keep test dependencies up to date
4. Monitor test execution times and optimize slow tests

---

For more detailed information about specific test suites or troubleshooting, please refer to individual test files or contact the development team.