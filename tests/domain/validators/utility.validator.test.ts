// tests/domain/validators/utility.validator.test.ts

import { describe, it, expect } from 'vitest';
import { UtilityValidator } from '@domain/validators/utility.validator';

describe('UtilityValidator', () => {
  const validator = new UtilityValidator();

  it('should validate correct utilities configuration', () => {
    const config = [
      {
        prefix: 'bg',
        declaration: 'background: ${color}',
      },
      {
        prefix: 'text',
        declaration: 'color: ${color}',
      },
      {
        prefix: 'weight',
        declaration: 'font-weight: ${variant}',
        variants: { thin: 100, bold: 700 },
      },
    ];

    const errors = validator.validate(config);
    expect(errors).toHaveLength(0);
  });

  it('should detect duplicate prefixes', () => {
    const config = [
      {
        prefix: 'bg',
        declaration: 'background: ${color}',
      },
      {
        prefix: 'bg',
        declaration: 'background-color: ${color}',
      },
    ];

    const errors = validator.validate(config);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].field).toContain('prefix');
    expect(errors[0].message).toContain('Duplicate prefix');
  });

  it('should validate utility constraints', () => {
    const config = [
      {
        prefix: 'invalid',
        declaration: 'something: ${variant}',
        // Missing variants
      },
    ];

    const errors = validator.validate(config);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('no variants are defined');
  });

  it('should collect multiple errors', () => {
    const config = [
      {
        prefix: '',
        declaration: 'test',
      },
      {
        prefix: 'test',
        declaration: '',
      },
      {
        prefix: 'invalid',
        declaration: 'value: ${variant}',
      },
    ];

    const errors = validator.validate(config);
    expect(errors.length).toBe(3);
  });

  it('should handle empty configuration', () => {
    const errors = validator.validate([]);
    expect(errors).toHaveLength(0);
  });
});
