# AnubisUI Tests

This directory contains all tests for the AnubisUI project.

## Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI/production)
npm run test:run

# Run tests with UI
npm run test:ui
```

## Test Structure

```
tests/
└── validation/
    └── color.validation.test.ts   # Color configuration validation tests
```

## Test Coverage

### Color Validation (`color.validation.test.ts`)

Tests the color configuration validation logic to ensure:
- Valid colors pass validation
- Invalid colors are properly rejected
- Edge cases are handled correctly

**Test groups:**
1. **Valid configurations** - Tests all supported color formats
2. **Invalid configurations** - Ensures improper configs are rejected
3. **Helper functions** - Tests individual validation utilities

## Adding New Tests

1. Create a new test file in the appropriate subdirectory
2. Use the `.test.ts` extension
3. Import test utilities from Vitest:
   ```typescript
   import { describe, it, expect } from 'vitest';
   ```

## Test Framework

We use [Vitest](https://vitest.dev/) for testing:
- **Fast** - Native ESM and TypeScript support
- **Compatible** - Jest-like API
- **Modern** - Built for Vite projects
