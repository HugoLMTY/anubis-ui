import { IColor } from '@interfaces/color.interface';
import { log } from '@tools/logger';

/**
 * Validates a single color value (hex color or 'transparent')
 */
const isValidColorValue = (value: string): boolean => {
    if (value === 'transparent') {
        return true;
    }
    // Validate hex color format (#RRGGBB or #RGB)
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
};

/**
 * Validates the colors configuration
 * Ensures each color has at least one valid theme (light or dark)
 * @throws Error if validation fails
 */
const validateColors = (colors: IColor): void => {
    const errors: string[] = [];

    Object.entries(colors).forEach(([colorName, colorConfig]) => {
        const { light, dark } = colorConfig;

        // Check if at least one theme is defined
        if (!light && !dark) {
            errors.push(
                `Color "${colorName}": must have at least one theme defined (light or dark)`
            );
            return;
        }

        // Validate light color if defined
        if (light && !isValidColorValue(light)) {
            errors.push(
                `Color "${colorName}": invalid light color value "${light}". Expected hex format (#RRGGBB) or "transparent"`
            );
        }

        // Validate dark color if defined
        if (dark && !isValidColorValue(dark)) {
            errors.push(
                `Color "${colorName}": invalid dark color value "${dark}". Expected hex format (#RRGGBB) or "transparent"`
            );
        }
    });

    if (errors.length > 0) {
        const errorMessage = [
            '❌ Color configuration validation failed:',
            ...errors.map(err => `  - ${err}`),
            '',
            'Please check your colors.config.json or anubis.config.json file.',
        ].join('\n');

        log(errorMessage);
        throw new Error('Invalid color configuration');
    }

    log(
        `✅ Color configuration validated (${
            Object.keys(colors).length
        } colors)`
    );
};

export { validateColors, isValidColorValue };
