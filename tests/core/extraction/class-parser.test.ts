// tests/core/extraction/class-parser.test.ts

import { describe, it, expect } from 'vitest';
import { ClassParser } from '@core/extraction/class-parser';
import { Utility } from '@domain/models/Utility';

describe('ClassParser', () => {
  const utilities = [
    Utility.create({
      prefix: 'bg',
      declaration: 'background: ${color}',
    }),
    Utility.create({
      prefix: 'text',
      declaration: 'color: ${color}',
    }),
    Utility.create({
      prefix: 'rounded',
      declaration: 'border-radius: ${variant}',
      variants: { sm: '4px', md: '8px', lg: '12px' },
      'default-variant': 'md',
    }),
    Utility.create({
      prefix: 'weight',
      declaration: 'font-weight: ${variant}',
      variants: { thin: 100, bold: 700 },
    }),
    Utility.create({
      prefix: 'border',
      declaration: 'border-width: ${variant}; border-color: ${color}',
      variants: { thin: '1px', thick: '4px' },
    }),
    Utility.create({
      prefix: 'flex',
      declaration: 'display: flex',
    }),
  ];

  const parser = new ClassParser(utilities);

  describe('static utilities', () => {
    it('should parse static utility', () => {
      const parsed = parser.parse('flex');

      expect(parsed).not.toBeNull();
      expect(parsed?.prefix).toBe('flex');
      expect(parsed?.utility.getContext()).toBe('static');
    });
  });

  describe('color-only utilities', () => {
    it('should parse simple color class', () => {
      const parsed = parser.parse('bg-primary');

      expect(parsed).not.toBeNull();
      expect(parsed?.prefix).toBe('bg');
      expect(parsed?.color).toBe('primary');
      expect(parsed?.opacity).toBeUndefined();
    });

    it('should parse color class with opacity', () => {
      const parsed = parser.parse('bg-primary-50');

      expect(parsed).not.toBeNull();
      expect(parsed?.prefix).toBe('bg');
      expect(parsed?.color).toBe('primary');
      expect(parsed?.opacity).toBe(50);
    });

    it('should parse multi-word color', () => {
      const parsed = parser.parse('text-dark-blue');

      expect(parsed).not.toBeNull();
      expect(parsed?.prefix).toBe('text');
      expect(parsed?.color).toBe('dark-blue');
    });
  });

  describe('variant-only utilities', () => {
    it('should parse variant class', () => {
      const parsed = parser.parse('weight-bold');

      expect(parsed).not.toBeNull();
      expect(parsed?.prefix).toBe('weight');
      expect(parsed?.variant).toBe('bold');
    });

    it('should parse standalone utility without variant', () => {
      const parsed = parser.parse('rounded');

      expect(parsed).not.toBeNull();
      expect(parsed?.prefix).toBe('rounded');
      expect(parsed?.variant).toBeUndefined();
    });

    it('should parse standalone utility with variant', () => {
      const parsed = parser.parse('rounded-lg');

      expect(parsed).not.toBeNull();
      expect(parsed?.prefix).toBe('rounded');
      expect(parsed?.variant).toBe('lg');
    });
  });

  describe('color+variant utilities', () => {
    it('should parse color+variant class', () => {
      const parsed = parser.parse('border-primary-thick');

      expect(parsed).not.toBeNull();
      expect(parsed?.prefix).toBe('border');
      expect(parsed?.color).toBe('primary');
      expect(parsed?.variant).toBe('thick');
      expect(parsed?.opacity).toBeUndefined();
    });

    it('should parse color+opacity+variant', () => {
      const parsed = parser.parse('border-primary-50-thin');

      expect(parsed).not.toBeNull();
      expect(parsed?.prefix).toBe('border');
      expect(parsed?.color).toBe('primary');
      expect(parsed?.opacity).toBe(50);
      expect(parsed?.variant).toBe('thin');
    });
  });

  describe('state modifiers', () => {
    it('should parse class with state', () => {
      const parsed = parser.parse('hover:bg-primary');

      expect(parsed).not.toBeNull();
      expect(parsed?.state).toBe('hover');
      expect(parsed?.prefix).toBe('bg');
      expect(parsed?.color).toBe('primary');
    });

    it('should parse complex class with state', () => {
      const parsed = parser.parse('hover:border-accent-50-thick');

      expect(parsed).not.toBeNull();
      expect(parsed?.state).toBe('hover');
      expect(parsed?.prefix).toBe('border');
      expect(parsed?.color).toBe('accent');
      expect(parsed?.opacity).toBe(50);
      expect(parsed?.variant).toBe('thick');
    });
  });

  describe('invalid classes', () => {
    it('should return null for unknown prefix', () => {
      const parsed = parser.parse('unknown-class');
      expect(parsed).toBeNull();
    });

    it('should return null for invalid format', () => {
      const parsed = parser.parse('bg');
      expect(parsed).toBeNull();
    });

    it('should return null for non-existent variant', () => {
      const parsed = parser.parse('weight-invalid');
      expect(parsed).toBeNull();
    });
  });

  describe('original class name', () => {
    it('should preserve original class name', () => {
      const parsed = parser.parse('hover:bg-primary-50');

      expect(parsed).not.toBeNull();
      expect(parsed?.original).toBe('hover:bg-primary-50');
    });
  });
});
