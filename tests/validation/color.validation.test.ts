import { describe, it, expect } from 'vitest';
import {
    validateColors,
    isValidColorValue,
} from '@validation/color.validation';
import { IColor } from '@interfaces/color.interface';

describe('isValidColorValue', () => {
    it('should accept valid hex colors (#RRGGBB)', () => {
        expect(isValidColorValue('#ff00ff')).toBe(true);
        expect(isValidColorValue('#0f84cb')).toBe(true);
        expect(isValidColorValue('#000000')).toBe(true);
        expect(isValidColorValue('#ffffff')).toBe(true);
    });

    it('should accept valid short hex colors (#RGB)', () => {
        expect(isValidColorValue('#f0f')).toBe(true);
        expect(isValidColorValue('#0ff')).toBe(true);
        expect(isValidColorValue('#000')).toBe(true);
        expect(isValidColorValue('#fff')).toBe(true);
    });

    it('should accept transparent keyword', () => {
        expect(isValidColorValue('transparent')).toBe(true);
    });

    it('should accept mixed case hex values', () => {
        expect(isValidColorValue('#FF00FF')).toBe(true);
        expect(isValidColorValue('#Ff00fF')).toBe(true);
    });

    it('should reject invalid hex colors', () => {
        expect(isValidColorValue('not-a-color')).toBe(false);
        expect(isValidColorValue('#ff')).toBe(false);
        expect(isValidColorValue('#fffffff')).toBe(false);
        expect(isValidColorValue('ff00ff')).toBe(false);
        expect(isValidColorValue('#gggggg')).toBe(false);
        expect(isValidColorValue('#xyz')).toBe(false);
    });
});

describe('validateColors', () => {
    describe('Valid configurations', () => {
        it('should accept color with both light and dark themes', () => {
            const colors: IColor = {
                primary: { light: '#0f84cb', dark: '#1a94db' },
            };
            expect(() => validateColors(colors)).not.toThrow();
        });

        it('should accept color with only light theme', () => {
            const colors: IColor = {
                'custom-light': { light: '#ff00ff' },
            };
            expect(() => validateColors(colors)).not.toThrow();
        });

        it('should accept color with only dark theme', () => {
            const colors: IColor = {
                'custom-dark': { dark: '#00ffff' },
            };
            expect(() => validateColors(colors)).not.toThrow();
        });

        it('should accept transparent colors', () => {
            const colors: IColor = {
                none: { light: 'transparent', dark: 'transparent' },
            };
            expect(() => validateColors(colors)).not.toThrow();
        });

        it('should accept short hex format (#RGB)', () => {
            const colors: IColor = {
                'short-hex': { light: '#f0f', dark: '#0ff' },
            };
            expect(() => validateColors(colors)).not.toThrow();
        });

        it('should accept multiple valid colors', () => {
            const colors: IColor = {
                primary: { light: '#0f84cb', dark: '#1a94db' },
                secondary: { light: '#3b5161', dark: '#4a5f6f' },
                accent: { light: '#0f84cb' },
            };
            expect(() => validateColors(colors)).not.toThrow();
        });

        it('should accept empty colors object', () => {
            const colors: IColor = {};
            expect(() => validateColors(colors)).not.toThrow();
        });

        it('should accept uppercase hex values', () => {
            const colors: IColor = {
                uppercase: { light: '#FF00FF', dark: '#00FFFF' },
            };
            expect(() => validateColors(colors)).not.toThrow();
        });

        it('should accept mixed case hex values', () => {
            const colors: IColor = {
                mixed: { light: '#Ff00fF', dark: '#00FfFf' },
            };
            expect(() => validateColors(colors)).not.toThrow();
        });
    });

    describe('Invalid configurations', () => {
        it('should reject empty color object (no light or dark)', () => {
            const colors: IColor = {
                'test-empty': {},
            };
            expect(() => validateColors(colors)).toThrow(
                'Invalid color configuration'
            );
        });

        it('should reject invalid hex color format', () => {
            const colors: IColor = {
                'test-invalid': { light: 'not-a-color' },
            };
            expect(() => validateColors(colors)).toThrow(
                'Invalid color configuration'
            );
        });

        it('should reject invalid short hex (#XX)', () => {
            const colors: IColor = {
                'test-short': { light: '#ff' },
            };
            expect(() => validateColors(colors)).toThrow(
                'Invalid color configuration'
            );
        });

        it('should reject hex color without #', () => {
            const colors: IColor = {
                'test-no-hash': { light: 'ff00ff' },
            };
            expect(() => validateColors(colors)).toThrow(
                'Invalid color configuration'
            );
        });

        it('should reject invalid characters in hex', () => {
            const colors: IColor = {
                'test-invalid-chars': { light: '#gggggg' },
            };
            expect(() => validateColors(colors)).toThrow(
                'Invalid color configuration'
            );
        });

        it('should reject when both light and dark are invalid', () => {
            const colors: IColor = {
                'test-both-invalid': { light: 'invalid', dark: 'also-invalid' },
            };
            expect(() => validateColors(colors)).toThrow(
                'Invalid color configuration'
            );
        });

        it('should reject when mixing valid and invalid colors', () => {
            const colors: IColor = {
                valid: { light: '#ff00ff' },
                invalid: { light: 'not-valid' },
            };
            expect(() => validateColors(colors)).toThrow(
                'Invalid color configuration'
            );
        });

        it('should reject when only dark color is invalid', () => {
            const colors: IColor = {
                'test-dark-invalid': { light: '#ff00ff', dark: 'not-valid' },
            };
            expect(() => validateColors(colors)).toThrow(
                'Invalid color configuration'
            );
        });
    });
});
