#!/bin/bash

# Task-specific test runner for task-001
# This script runs the specific tests for this task

set -e

echo "Running tests for task-001: Basic Array Operations API"

# Check if we're in the correct directory
if [ ! -f "task_tests.py" ]; then
    echo "Error: task_tests.py not found. Please run this script from the task directory."
    exit 1
fi

# Check if the server is running
if ! curl -sf http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "Error: Server is not running. Please start the server first."
    echo "Run: cd ../../ && node server/index.js"
    exit 1
fi

# Run the Python tests
echo "Running Python tests with pytest..."
python3 -m pytest -v task_tests.py

echo "Task-001 tests completed!"
