// Test setup file for Jest
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/c-ds-algo-test';

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set timeout for async operations
jest.setTimeout(10000);
