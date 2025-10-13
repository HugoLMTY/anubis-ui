// core/config/config-validator.ts

import { ValidationResult, ValidationError } from '@shared/types/validation.types';
import { Config } from './config-loader';
import { UtilityValidator } from '@domain/validators/utility.validator';
import { ColorValidator } from '@domain/validators/color.validator';

export class ConfigValidator {
  private utilityValidator = new UtilityValidator();
  private colorValidator = new ColorValidator();

  /**
   * Validate entire configuration
   */
  validate(config: Config): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate utilities
    const utilityErrors = this.utilityValidator.validate(config.utilities);
    errors.push(...utilityErrors);

    // Validate colors
    const colorErrors = this.colorValidator.validate(config.colors);
    errors.push(...colorErrors);

    // Validate states
    if (!Array.isArray(config.states) || config.states.length === 0) {
      errors.push({
        field: 'states',
        message: 'States configuration must be a non-empty array',
        value: config.states,
      });
    }

    // Validate files
    if (!Array.isArray(config.files.include) || config.files.include.length === 0) {
      errors.push({
        field: 'files.include',
        message: 'Files include configuration must be a non-empty array',
        value: config.files.include,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
