// core/generation/rule-generator.ts

import { ParsedClass } from '@core/extraction/class-parser';

export interface CSSRule {
  selector: string;
  declaration: string;
}

export class RuleGenerator {
  /**
   * Generate CSS rule from parsed class
   */
  generate(parsed: ParsedClass): CSSRule {
    const { original, state, utility, color, variant, opacity } = parsed;

    // Build selector
    let selector = `.${original}`;
    if (state) {
      selector = `.${original.replace(`${state}:`, '')}:${state}`;
    }

    // Adjust color for opacity
    let finalColor = color;
    if (color && opacity !== undefined) {
      // Extract base color name (without opacity)
      const baseColor = color;
      // Color with opacity will use rgba or css variable with opacity
      finalColor = baseColor;
    }

    // Generate declaration using utility
    let declaration = utility.generateDeclaration({
      color: finalColor,
      variant,
    });

    // Apply opacity if present
    if (opacity !== undefined && color) {
      // Replace the color variable with opacity version
      const colorVar = `var(--${finalColor})`;
      const opacityValue = opacity / 100;

      // Convert to rgba with opacity
      // For now, we'll keep the variable and add opacity in a different property
      // A better approach would be to use CSS color-mix or rgba
      declaration = declaration.replace(
        colorVar,
        `rgba(var(--${finalColor}-rgb), ${opacityValue})`
      );
    }

    return {
      selector,
      declaration,
    };
  }

  /**
   * Generate CSS string from rules
   */
  generateCSS(rules: CSSRule[]): string {
    return rules
      .map(rule => `${rule.selector} { ${rule.declaration} }`)
      .join('\n');
  }
}
