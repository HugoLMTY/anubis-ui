// domain/validators/utility.validator.ts

import { Validator, ValidationError } from '@shared/types/validation.types';
import { UtilityConfig } from '@shared/types/utility.types';
import { Utility } from '@domain/models/Utility';

export class UtilityValidator implements Validator<UtilityConfig[]> {
  /**
   * Validate all utilities configuration
   */
  validate(utilities: UtilityConfig[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const seenPrefixes = new Set<string>();

    for (let i = 0; i < utilities.length; i++) {
      const config = utilities[i];

      // Check for duplicate prefixes
      if (seenPrefixes.has(config.prefix)) {
        errors.push({
          field: `utilities[${i}].prefix`,
          message: `Duplicate prefix "${config.prefix}" found`,
          value: config.prefix,
        });
      }
      seenPrefixes.add(config.prefix);

      // Try to create the utility (will validate)
      try {
        Utility.create(config);
      } catch (error) {
        errors.push({
          field: `utilities[${i}]`,
          message: error.message,
          value: config,
        });
      }
    }

    return errors;
  }
}
