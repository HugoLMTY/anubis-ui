// tests/domain/validators/color.validator.test.ts

import { describe, it, expect } from 'vitest';
import { ColorValidator } from '@domain/validators/color.validator';

describe('ColorValidator', () => {
  const validator = new ColorValidator();

  describe('valid configurations', () => {
    it('should validate colors with both themes', () => {
      const config = {
        primary: { light: '#0f84cb', dark: '#1a94db' },
        secondary: { light: '#3b5161', dark: '#4a5f6f' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(0);
    });

    it('should validate colors with only light theme', () => {
      const config = {
        primary: { light: '#0f84cb' },
        secondary: { light: '#3b5161' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(0);
    });

    it('should validate colors with only dark theme', () => {
      const config = {
        primary: { dark: '#1a94db' },
        secondary: { dark: '#4a5f6f' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(0);
    });

    it('should validate transparent keyword', () => {
      const config = {
        none: { light: 'transparent', dark: 'transparent' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(0);
    });

    it('should validate short hex format (#RGB)', () => {
      const config = {
        red: { light: '#f00', dark: '#a00' },
        blue: { light: '#00f', dark: '#00a' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(0);
    });

    it('should validate full hex format (#RRGGBB)', () => {
      const config = {
        primary: { light: '#0f84cb', dark: '#1a94db' },
        white: { light: '#ffffff', dark: '#000000' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(0);
    });

    it('should validate mixed case hex', () => {
      const config = {
        primary: { light: '#0F84CB', dark: '#1a94db' },
        mixed: { light: '#AaBbCc', dark: '#DdEeFf' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(0);
    });

    it('should handle empty configuration', () => {
      const errors = validator.validate({});
      expect(errors).toHaveLength(0);
    });
  });

  describe('invalid configurations', () => {
    it('should reject color without any theme', () => {
      const config = {
        invalid: {},
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('colors.invalid');
      expect(errors[0].message).toContain('must have at least one theme');
    });

    it('should reject invalid light color format', () => {
      const config = {
        invalid: { light: 'not-a-color' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('colors.invalid.light');
      expect(errors[0].message).toContain('invalid color value');
    });

    it('should reject invalid dark color format', () => {
      const config = {
        primary: { light: '#fff' },
        invalid: { dark: 'invalid-dark' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('colors.invalid.dark');
      expect(errors[0].message).toContain('invalid color value');
    });

    it('should reject hex without hash', () => {
      const config = {
        invalid: { light: 'ff00ff' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('invalid color value');
    });

    it('should reject hex with invalid length', () => {
      const config = {
        invalid1: { light: '#ff' },
        invalid2: { dark: '#ffff' },
        invalid3: { light: '#fffff' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(3);
    });

    it('should reject hex with invalid characters', () => {
      const config = {
        invalid1: { light: '#gggggg' },
        invalid2: { dark: '#xyz123' },
        invalid3: { light: '#12345g' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(3);
    });

    it('should reject RGB/RGBA format', () => {
      const config = {
        invalid1: { light: 'rgb(255, 0, 0)' },
        invalid2: { dark: 'rgba(0, 0, 255, 0.5)' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(2);
    });

    it('should reject named colors', () => {
      const config = {
        invalid1: { light: 'red' },
        invalid2: { dark: 'blue' },
        invalid3: { light: 'white' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(3);
    });

    it('should collect multiple errors', () => {
      const config = {
        invalid1: {},
        invalid2: { light: 'not-a-color' },
        valid: { light: '#fff' },
        invalid3: { dark: 'also-invalid' },
        invalid4: { light: '#gg0000' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(4);
      expect(errors.map(e => e.field)).toEqual([
        'colors.invalid1',
        'colors.invalid2.light',
        'colors.invalid3.dark',
        'colors.invalid4.light',
      ]);
    });
  });

  describe('edge cases', () => {
    it('should validate lowercase hex', () => {
      const config = {
        primary: { light: '#abcdef', dark: '#123456' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(0);
    });

    it('should validate uppercase hex', () => {
      const config = {
        primary: { light: '#ABCDEF', dark: '#123456' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(0);
    });

    it('should handle color names with special characters', () => {
      const config = {
        'primary-light': { light: '#fff' },
        'accent_color': { dark: '#000' },
        'color.special': { light: '#f0f' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(0);
    });

    it('should validate black and white', () => {
      const config = {
        black: { light: '#000000', dark: '#000' },
        white: { light: '#ffffff', dark: '#fff' },
      };

      const errors = validator.validate(config);
      expect(errors).toHaveLength(0);
    });
  });
});
