#!/bin/bash

# C Data Structures & Algorithms Platform Test Runner
# This script runs tests for specific tasks based on task ID

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if task ID is provided
if [ -z "$1" ]; then
    print_error "Task ID is required. Usage: ./run_tests.sh <task-id>"
    exit 1
fi

TASK_ID="$1"
TASK_DIR="tasks/$TASK_ID"

# Check if task directory exists
if [ ! -d "$TASK_DIR" ]; then
    print_error "Task directory '$TASK_DIR' does not exist."
    exit 1
fi

# Check if task description exists
if [ ! -f "$TASK_DIR/task_description.txt" ]; then
    print_error "Task description file not found: $TASK_DIR/task_description.txt"
    exit 1
fi

# Check if test file exists
if [ ! -f "$TASK_DIR/task_tests.js" ] && [ ! -f "$TASK_DIR/task_tests.py" ] && [ ! -f "$TASK_DIR/task_tests.ts" ]; then
    print_error "Test file not found in $TASK_DIR. Expected task_tests.js, task_tests.py, or task_tests.ts"
    exit 1
fi

print_status "Running tests for task: $TASK_ID"

# Display task information
echo ""
print_status "Task Information:"
echo "------------------------"
cat "$TASK_DIR/task_description.txt"
echo "------------------------"
echo ""

# Install dependencies if needed
if [ -f "package.json" ]; then
    print_status "Installing Node.js dependencies..."
    npm install
elif [ -f "requirements.txt" ]; then
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Run tests based on file type
TEST_SUCCESS=false

if [ -f "$TASK_DIR/task_tests.js" ]; then
    print_status "Running JavaScript tests with Jest..."
    if command -v jest &> /dev/null; then
        if npx jest "$TASK_DIR/task_tests.js" --verbose --coverage; then
            TEST_SUCCESS=true
        fi
    else
        print_error "Jest is not installed. Please install it first."
        exit 1
    fi
elif [ -f "$TASK_DIR/task_tests.py" ]; then
    print_status "Running Python tests with pytest..."
    if command -v pytest &> /dev/null; then
        if pytest "$TASK_DIR/task_tests.py" -v --tb=short; then
            TEST_SUCCESS=true
        fi
    else
        print_error "pytest is not installed. Please install it first."
        exit 1
    fi
elif [ -f "$TASK_DIR/task_tests.ts" ]; then
    print_status "Running TypeScript tests with Jest..."
    if command -v jest &> /dev/null; then
        if npx jest "$TASK_DIR/task_tests.ts" --verbose --coverage; then
            TEST_SUCCESS=true
        fi
    else
        print_error "Jest is not installed. Please install it first."
        exit 1
    fi
fi

# Check test results
if [ "$TEST_SUCCESS" = true ]; then
    print_success "All tests passed for task: $TASK_ID"
    
    # Generate test report
    REPORT_DIR="$TASK_DIR/reports"
    mkdir -p "$REPORT_DIR"
    
    REPORT_FILE="$REPORT_DIR/test_report_$(date +%Y%m%d_%H%M%S).txt"
    echo "Test Report for Task: $TASK_ID" > "$REPORT_FILE"
    echo "Date: $(date)" >> "$REPORT_FILE"
    echo "Status: PASSED" >> "$REPORT_FILE"
    echo "================================" >> "$REPORT_FILE"
    
    print_status "Test report generated: $REPORT_FILE"
    
    exit 0
else
    print_error "Tests failed for task: $TASK_ID"
    
    # Generate failure report
    REPORT_DIR="$TASK_DIR/reports"
    mkdir -p "$REPORT_DIR"
    
    REPORT_FILE="$REPORT_DIR/test_report_$(date +%Y%m%d_%H%M%S).txt"
    echo "Test Report for Task: $TASK_ID" >> "$REPORT_FILE"
    echo "Date: $(date)" >> "$REPORT_FILE"
    echo "Status: FAILED" >> "$REPORT_FILE"
    echo "================================" >> "$REPORT_FILE"
    
    print_status "Failure report generated: $REPORT_FILE"
    
    exit 1
fi
