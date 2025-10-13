// tests/domain/models/Utility.test.ts

import { describe, it, expect } from 'vitest';
import { Utility, DomainError } from '@domain/models/Utility';

describe('Utility Domain Model', () => {
  describe('create - static utilities', () => {
    it('should create static utility (no placeholders)', () => {
      const utility = Utility.create({
        prefix: 'flex',
        declaration: 'display: flex',
      });

      expect(utility.prefix).toBe('flex');
      expect(utility.getContext()).toBe('static');
      expect(utility.requiresColor()).toBe(false);
      expect(utility.requiresVariant()).toBe(false);
    });
  });

  describe('create - color-only utilities', () => {
    it('should create color-only utility', () => {
      const utility = Utility.create({
        prefix: 'bg',
        declaration: 'background: ${color}',
      });

      expect(utility.prefix).toBe('bg');
      expect(utility.getContext()).toBe('color');
      expect(utility.requiresColor()).toBe(true);
      expect(utility.requiresVariant()).toBe(false);
    });

    it('should generate declaration with color', () => {
      const utility = Utility.create({
        prefix: 'text',
        declaration: 'color: ${color}',
      });

      const declaration = utility.generateDeclaration({ color: 'primary' });
      expect(declaration).toBe('color: var(--primary)');
    });
  });

  describe('create - variant-only utilities', () => {
    it('should create variant utility with array', () => {
      const utility = Utility.create({
        prefix: 'border-style',
        declaration: 'border-style: ${variant}',
        variants: ['solid', 'dashed', 'dotted'],
      });

      expect(utility.getContext()).toBe('variant');
      expect(utility.requiresVariant()).toBe(true);
    });

    it('should create variant utility with object', () => {
      const utility = Utility.create({
        prefix: 'weight',
        declaration: 'font-weight: ${variant}',
        variants: {
          thin: 100,
          bold: 700,
        },
      });

      expect(utility.getContext()).toBe('variant');
      const normalized = utility.getNormalizedVariants();
      expect(normalized).toEqual({
        thin: '100',
        bold: '700',
      });
    });

    it('should create standalone utility with default variant', () => {
      const utility = Utility.create({
        prefix: 'rounded',
        declaration: 'border-radius: ${variant}',
        variants: { md: '8px', lg: '12px' },
        'default-variant': 'md',
      });

      expect(utility.isStandalone()).toBe(true);
      expect(utility.requiresVariant()).toBe(false);
    });

    it('should throw if variant placeholder but no variants', () => {
      expect(() =>
        Utility.create({
          prefix: 'invalid',
          declaration: 'something: ${variant}',
        })
      ).toThrow(DomainError);
      expect(() =>
        Utility.create({
          prefix: 'invalid',
          declaration: 'something: ${variant}',
        })
      ).toThrow('no variants are defined');
    });

    it('should throw if default-variant not in variants', () => {
      expect(() =>
        Utility.create({
          prefix: 'invalid',
          declaration: 'border-radius: ${variant}',
          variants: { sm: '4px' },
          'default-variant': 'md',
        })
      ).toThrow(DomainError);
      expect(() =>
        Utility.create({
          prefix: 'invalid',
          declaration: 'border-radius: ${variant}',
          variants: { sm: '4px' },
          'default-variant': 'md',
        })
      ).toThrow('not found in variants');
    });
  });

  describe('create - color+variant utilities', () => {
    it('should create color+variant utility', () => {
      const utility = Utility.create({
        prefix: 'border',
        declaration: 'border-width: ${variant}; border-color: ${color}',
        variants: { thin: '1px', thick: '4px' },
      });

      expect(utility.getContext()).toBe('both');
      expect(utility.requiresColor()).toBe(true);
      expect(utility.requiresVariant()).toBe(true);
    });

    it('should generate declaration with color and variant', () => {
      const utility = Utility.create({
        prefix: 'shadow',
        declaration: 'box-shadow: ${variant} ${color}',
        variants: { wide: '0px 0px 10px 1px' },
      });

      const declaration = utility.generateDeclaration({
        color: 'primary',
        variant: 'wide',
      });

      expect(declaration).toBe('box-shadow: 0px 0px 10px 1px var(--primary)');
    });
  });

  describe('create - validation', () => {
    it('should throw if prefix is empty', () => {
      expect(() =>
        Utility.create({
          prefix: '',
          declaration: 'test',
        })
      ).toThrow(DomainError);
      expect(() =>
        Utility.create({
          prefix: '',
          declaration: 'test',
        })
      ).toThrow('prefix cannot be empty');
    });

    it('should throw if declaration is empty', () => {
      expect(() =>
        Utility.create({
          prefix: 'test',
          declaration: '',
        })
      ).toThrow(DomainError);
      expect(() =>
        Utility.create({
          prefix: 'test',
          declaration: '',
        })
      ).toThrow('declaration cannot be empty');
    });
  });

  describe('generateDeclaration', () => {
    it('should use default variant for standalone utility', () => {
      const utility = Utility.create({
        prefix: 'rounded',
        declaration: 'border-radius: ${variant}',
        variants: { md: '8px' },
        'default-variant': 'md',
      });

      const declaration = utility.generateDeclaration({});
      expect(declaration).toBe('border-radius: 8px');
    });

    it('should generate with exported variants', () => {
      const utility = Utility.create({
        prefix: 'size',
        declaration: 'font-size: ${variant}',
        variants: { lg: '18px' },
        'export-variants': true,
      });

      const declaration = utility.generateDeclaration({ variant: 'lg' });
      expect(declaration).toBe('font-size: var(--size-lg)');
    });
  });

  describe('getExportedVariants', () => {
    it('should return null if not exporting', () => {
      const utility = Utility.create({
        prefix: 'rounded',
        declaration: 'border-radius: ${variant}',
        variants: { md: '8px' },
      });

      expect(utility.getExportedVariants()).toBeNull();
    });

    it('should export variants with prefix', () => {
      const utility = Utility.create({
        prefix: 'weight',
        declaration: 'font-weight: ${variant}',
        variants: { thin: '100', bold: '700' },
        'export-variants': true,
      });

      const exported = utility.getExportedVariants();
      expect(exported).toEqual({
        'weight-thin': '100',
        'weight-bold': '700',
      });
    });
  });

  describe('toConfig', () => {
    it('should convert back to config format', () => {
      const config = {
        prefix: 'bg',
        declaration: 'background: ${color}',
      };

      const utility = Utility.create(config);
      const result = utility.toConfig();

      expect(result).toEqual(config);
    });

    it('should include all properties', () => {
      const config = {
        prefix: 'size',
        declaration: 'font-size: ${variant}',
        variants: { lg: '18px' },
        'default-variant': 'lg',
        'export-variants': true,
      };

      const utility = Utility.create(config);
      const result = utility.toConfig();

      expect(result).toEqual(config);
    });
  });
});
