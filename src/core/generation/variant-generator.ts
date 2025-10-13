// core/generation/variant-generator.ts

import { Utility } from '@domain/models/Utility';

export class VariantGenerator {
  /**
   * Generate CSS variables for utilities with export-variants
   */
  generateVariables(utilities: Utility[]): string {
    const variables: string[] = [];

    for (const utility of utilities) {
      const exportedVars = utility.getExportedVariants();
      if (exportedVars) {
        for (const [name, value] of Object.entries(exportedVars)) {
          variables.push(`  --${name}: ${value};`);
        }
      }
    }

    if (variables.length === 0) {
      return '';
    }

    return `:root {\n${variables.join('\n')}\n}\n`;
  }
}
