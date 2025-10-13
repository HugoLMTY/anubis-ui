// domain/validators/color.validator.ts

import { Validator, ValidationError } from '@shared/types/validation.types';
import { IColor } from '@shared/types/color.types';
import { COLOR_HEX_PATTERN } from '@shared/constants/regex-patterns';

export class ColorValidator implements Validator<IColor> {
  /**
   * Validate colors configuration
   */
  validate(colors: IColor): ValidationError[] {
    const errors: ValidationError[] = [];

    Object.entries(colors).forEach(([colorName, colorConfig]) => {
      const { light, dark } = colorConfig;

      // Check if at least one theme is defined
      if (!light && !dark) {
        errors.push({
          field: `colors.${colorName}`,
          message: `must have at least one theme defined (light or dark)`,
          value: colorConfig,
        });
        return;
      }

      // Validate light color if defined
      if (light && !this.isValidColorValue(light)) {
        errors.push({
          field: `colors.${colorName}.light`,
          message: `invalid color value "${light}". Expected hex format (#RRGGBB) or "transparent"`,
          value: light,
        });
      }

      // Validate dark color if defined
      if (dark && !this.isValidColorValue(dark)) {
        errors.push({
          field: `colors.${colorName}.dark`,
          message: `invalid color value "${dark}". Expected hex format (#RRGGBB) or "transparent"`,
          value: dark,
        });
      }
    });

    return errors;
  }

  /**
   * Check if a color value is valid
   */
  private isValidColorValue(value: string): boolean {
    return value === 'transparent' || COLOR_HEX_PATTERN.test(value);
  }
}
