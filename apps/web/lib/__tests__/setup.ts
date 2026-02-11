import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock environment variables
vi.stubEnv('HUGGINGFACE_API_KEY', 'test-hf-key');
vi.stubEnv('ALPACA_API_KEY_ID', 'test-alpaca-key');
vi.stubEnv('ALPACA_API_SECRET', 'test-alpaca-secret');

// Mock fetch for API calls
global.fetch = vi.fn();

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
