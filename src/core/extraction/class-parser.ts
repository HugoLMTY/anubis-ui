// core/extraction/class-parser.ts

import { Utility } from '@domain/models/Utility';
import { RegexCache } from '@infrastructure/cache/regex-cache';

export interface ParsedClass {
  original: string;
  state?: string;
  prefix: string;
  color?: string;
  variant?: string;
  opacity?: number;
  utility: Utility;
}

export class ClassParser {
  private readonly regexCache: RegexCache;

  constructor(private readonly utilities: Utility[]) {
    this.regexCache = new RegexCache();
  }

  /**
   * Parse a class string into its components
   * Format: [state:]prefix[-color[-opacity]][-variant]
   */
  parse(className: string): ParsedClass | null {
    // Extract state modifier (e.g., "hover:")
    let state: string | undefined;
    let remaining = className;

    const stateRegex = this.regexCache.getOrCreate('^([^:]+):');
    const stateMatch = className.match(stateRegex);
    if (stateMatch) {
      state = stateMatch[1];
      remaining = className.substring(state.length + 1);
    }

    // Try to match against utilities
    for (const utility of this.utilities) {
      const parsed = this.tryParseWithUtility(remaining, utility);
      if (parsed) {
        return {
          original: className,
          state,
          ...parsed,
          utility,
        };
      }
    }

    return null;
  }

  /**
   * Try to parse a class with a specific utility
   */
  private tryParseWithUtility(
    className: string,
    utility: Utility
  ): Omit<ParsedClass, 'original' | 'state' | 'utility'> | null {
    // Check if class starts with utility prefix
    if (!className.startsWith(utility.prefix)) {
      return null;
    }

    const context = utility.getContext();

    // Static utility (no color or variant)
    if (context === 'static') {
      return className === utility.prefix
        ? { prefix: utility.prefix }
        : null;
    }

    // Extract remaining part after prefix
    let remaining = className.substring(utility.prefix.length);

    // Must start with dash if there's more content
    if (remaining && !remaining.startsWith('-')) {
      // Check for standalone utility
      if (utility.isStandalone() && className === utility.prefix) {
        return { prefix: utility.prefix };
      }
      return null;
    }

    remaining = remaining.substring(1); // Remove leading dash

    const result: Omit<ParsedClass, 'original' | 'state' | 'utility'> = {
      prefix: utility.prefix,
    };

    // Parse based on context
    switch (context) {
      case 'color':
        return this.parseColorOnly(remaining, result);

      case 'variant':
        return this.parseVariantOnly(remaining, utility, result);

      case 'both':
        return this.parseColorAndVariant(remaining, utility, result);

      default:
        return null;
    }
  }

  /**
   * Parse color-only utility (e.g., bg-primary-50)
   */
  private parseColorOnly(
    remaining: string,
    result: Omit<ParsedClass, 'original' | 'state' | 'utility'>
  ): typeof result | null {
    if (!remaining) return null;

    // Check for opacity suffix (e.g., "primary-50")
    const opacityRegex = this.regexCache.getOrCreate('^(.+)-(\\d+)$');
    const opacityMatch = remaining.match(opacityRegex);
    if (opacityMatch) {
      result.color = opacityMatch[1];
      result.opacity = parseInt(opacityMatch[2], 10);
    } else {
      result.color = remaining;
    }

    return result;
  }

  /**
   * Parse variant-only utility (e.g., rounded-lg)
   */
  private parseVariantOnly(
    remaining: string,
    utility: Utility,
    result: Omit<ParsedClass, 'original' | 'state' | 'utility'>
  ): typeof result | null {
    if (!remaining) {
      // Standalone utility without variant
      if (utility.isStandalone()) {
        return result;
      }
      return null;
    }

    const variants = utility.getNormalizedVariants();
    if (!variants || !variants[remaining]) {
      return null;
    }

    result.variant = remaining;
    return result;
  }

  /**
   * Parse color+variant utility (e.g., border-primary-thick)
   */
  private parseColorAndVariant(
    remaining: string,
    utility: Utility,
    result: Omit<ParsedClass, 'original' | 'state' | 'utility'>
  ): typeof result | null {
    if (!remaining) return null;

    const variants = utility.getNormalizedVariants();
    if (!variants) return null;

    // Try each variant as a suffix
    const opacityRegex = this.regexCache.getOrCreate('^(.+)-(\\d+)$');

    for (const variantName of Object.keys(variants)) {
      if (remaining.endsWith(`-${variantName}`)) {
        const colorPart = remaining.substring(0, remaining.length - variantName.length - 1);

        if (!colorPart) continue;

        // Check for opacity in color part
        const opacityMatch = colorPart.match(opacityRegex);
        if (opacityMatch) {
          result.color = opacityMatch[1];
          result.opacity = parseInt(opacityMatch[2], 10);
        } else {
          result.color = colorPart;
        }

        result.variant = variantName;
        return result;
      }
    }

    return null;
  }
}
