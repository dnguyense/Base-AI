#!/bin/bash

# E2E Test Runner Script for PDF Compressor Application
# This script provides various options for running the E2E test suite

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
BROWSER="chromium"
HEADED=false
DEBUG=false
WORKERS=3
RETRIES=1
TEST_TYPE="all"
ENVIRONMENT="local"
REPORT_DIR="test-results"

# Function to display usage
usage() {
    echo -e "${BLUE}PDF Compressor E2E Test Runner${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -b, --browser BROWSER     Browser to run tests on (chromium, firefox, webkit, all)"
    echo "  -h, --headed              Run tests in headed mode (visible browser)"
    echo "  -d, --debug               Run tests in debug mode"
    echo "  -w, --workers NUM         Number of parallel workers (default: 3)"
    echo "  -r, --retries NUM         Number of retries for failed tests (default: 1)"
    echo "  -t, --type TYPE           Test type (auth, compression, subscription, settings, visual, performance, all)"
    echo "  -e, --environment ENV     Environment (local, staging, production)"
    echo "  --report-dir DIR          Directory for test reports (default: test-results)"
    echo "  --update-snapshots        Update visual regression snapshots"
    echo "  --help                    Display this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Run all tests with default settings"
    echo "  $0 -b firefox -h                     # Run all tests in Firefox with headed mode"
    echo "  $0 -t auth,compression                # Run only auth and compression tests"
    echo "  $0 -e staging -w 1                   # Run tests against staging environment with 1 worker"
    echo "  $0 --update-snapshots                # Update visual regression snapshots"
}

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -b|--browser)
            BROWSER="$2"
            shift 2
            ;;
        -h|--headed)
            HEADED=true
            shift
            ;;
        -d|--debug)
            DEBUG=true
            shift
            ;;
        -w|--workers)
            WORKERS="$2"
            shift 2
            ;;
        -r|--retries)
            RETRIES="$2"
            shift 2
            ;;
        -t|--type)
            TEST_TYPE="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --report-dir)
            REPORT_DIR="$2"
            shift 2
            ;;
        --update-snapshots)
            UPDATE_SNAPSHOTS=true
            shift
            ;;
        --help)
            usage
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate browser option
case $BROWSER in
    chromium|firefox|webkit|all)
        ;;
    *)
        error "Invalid browser: $BROWSER. Must be one of: chromium, firefox, webkit, all"
        exit 1
        ;;
esac

# Validate environment
case $ENVIRONMENT in
    local|staging|production)
        ;;
    *)
        error "Invalid environment: $ENVIRONMENT. Must be one of: local, staging, production"
        exit 1
        ;;
esac

# Set environment variables based on environment
case $ENVIRONMENT in
    local)
        export BASE_URL="http://localhost:3000"
        export API_URL="http://localhost:5001"
        ;;
    staging)
        export BASE_URL="https://staging.pdfcompressor.com"
        export API_URL="https://api-staging.pdfcompressor.com"
        ;;
    production)
        export BASE_URL="https://pdfcompressor.com"
        export API_URL="https://api.pdfcompressor.com"
        ;;
esac

log "Starting E2E tests with configuration:"
log "Browser: $BROWSER"
log "Environment: $ENVIRONMENT ($BASE_URL)"
log "Test Type: $TEST_TYPE"
log "Workers: $WORKERS"
log "Retries: $RETRIES"
log "Headed Mode: $HEADED"
log "Debug Mode: $DEBUG"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    log "Installing dependencies..."
    npm install
fi

# Install browsers if needed
log "Installing/updating browsers..."
npx playwright install

# Prepare test command
PLAYWRIGHT_CMD="npx playwright test"

# Add browser option
if [ "$BROWSER" != "all" ]; then
    PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --project=$BROWSER"
fi

# Add headed mode
if [ "$HEADED" = true ]; then
    PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --headed"
fi

# Add debug mode
if [ "$DEBUG" = true ]; then
    PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --debug"
    WORKERS=1  # Debug mode should use single worker
fi

# Add workers
PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --workers=$WORKERS"

# Add retries
PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --retries=$RETRIES"

# Add report directory
PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --reporter=html --output-dir=$REPORT_DIR"

# Add update snapshots flag
if [ "$UPDATE_SNAPSHOTS" = true ]; then
    PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --update-snapshots"
fi

# Add test type filter
if [ "$TEST_TYPE" != "all" ]; then
    case $TEST_TYPE in
        auth)
            PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD tests/auth.spec.ts"
            ;;
        compression)
            PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD tests/compression.spec.ts"
            ;;
        subscription)
            PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD tests/subscription.spec.ts"
            ;;
        settings)
            PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD tests/settings.spec.ts"
            ;;
        visual)
            PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD tests/visual.spec.ts"
            ;;
        performance)
            PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD tests/performance.spec.ts"
            ;;
        *)
            # Handle comma-separated list
            IFS=',' read -ra TEST_TYPES <<< "$TEST_TYPE"
            TEST_FILES=""
            for type in "${TEST_TYPES[@]}"; do
                case $type in
                    auth|compression|subscription|settings|visual|performance)
                        TEST_FILES="$TEST_FILES tests/${type}.spec.ts"
                        ;;
                    *)
                        error "Invalid test type: $type"
                        exit 1
                        ;;
                esac
            done
            PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD $TEST_FILES"
            ;;
    esac
fi

# Start local servers if running against local environment
if [ "$ENVIRONMENT" = "local" ]; then
    log "Starting local development servers..."
    
    # Check if client is running
    if ! curl -s http://localhost:3000 > /dev/null; then
        warn "Client server not running at localhost:3000"
        warn "Please start the client server with: cd ../client && npm run dev"
        
        # Optionally start client server in background
        read -p "Start client server automatically? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cd ../client && npm run dev &
            CLIENT_PID=$!
            log "Started client server with PID: $CLIENT_PID"
            sleep 5  # Wait for server to start
        else
            error "Client server is required for local testing"
            exit 1
        fi
    fi
    
    # Check if server is running
    if ! curl -s http://localhost:5001/health > /dev/null; then
        warn "API server not running at localhost:5001"
        warn "Please start the API server with: cd ../server && npm run dev"
        
        # Optionally start API server in background
        read -p "Start API server automatically? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cd ../server && npm run dev &
            SERVER_PID=$!
            log "Started API server with PID: $SERVER_PID"
            sleep 10  # Wait for server to start
        else
            error "API server is required for local testing"
            exit 1
        fi
    fi
fi

# Create report directory
mkdir -p "$REPORT_DIR"

# Run the tests
log "Running E2E tests..."
log "Command: $PLAYWRIGHT_CMD"

if eval $PLAYWRIGHT_CMD; then
    log "All tests completed successfully! ✅"
    
    # Display results
    if [ -f "$REPORT_DIR/index.html" ]; then
        log "Test report available at: $REPORT_DIR/index.html"
        
        # Open report in browser if in headed mode
        if [ "$HEADED" = true ]; then
            case "$(uname -s)" in
                Darwin)
                    open "$REPORT_DIR/index.html"
                    ;;
                Linux)
                    xdg-open "$REPORT_DIR/index.html" 2>/dev/null || true
                    ;;
            esac
        fi
    fi
    
    EXIT_CODE=0
else
    error "Some tests failed! ❌"
    log "Check the test report at: $REPORT_DIR/index.html"
    EXIT_CODE=1
fi

# Cleanup background processes if started
if [ ! -z "$CLIENT_PID" ]; then
    log "Stopping client server (PID: $CLIENT_PID)..."
    kill $CLIENT_PID 2>/dev/null || true
fi

if [ ! -z "$SERVER_PID" ]; then
    log "Stopping API server (PID: $SERVER_PID)..."
    kill $SERVER_PID 2>/dev/null || true
fi

# Display summary
log "Test execution completed."
log "Environment: $ENVIRONMENT"
log "Browser(s): $BROWSER"
log "Report: $REPORT_DIR/index.html"

exit $EXIT_CODE