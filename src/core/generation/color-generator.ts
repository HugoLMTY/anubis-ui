// core/generation/color-generator.ts

import { IColor } from '@shared/types/color.types';

export class ColorGenerator {
  /**
   * Generate SCSS mixin for colors with opacity variations
   */
  generateColorMixin(): string {
    return `$background-opacity: (
  10: 0.1,
  20: 0.2,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  80: 0.8,
  90: 0.9
);

// Mixin that will autimatically generate colors for light and/or dark themes (with opacity variations)
@mixin setRootColors ($name, $lightColor: null, $darkColor: null) {
  :root {
    @if $lightColor != null {
      body.body--light {
        #{"--"+$name}: $lightColor;

        // Only generate opacity variations for non transparent colors
        @if $lightColor != transparent {
          @each $opacity, $multiplier in $background-opacity {
            #{"--"+$name+"-"+$opacity}: #{rgba(red($lightColor), green($lightColor), blue($lightColor), $multiplier)};
          }
        }
      }
    }

    @if $darkColor != null {
      body.body--dark {
        #{"--"+$name}: $darkColor;

        // Only generate opacity variations for non transparent colors
        @if $darkColor != transparent {
          @each $opacity, $multiplier in $background-opacity {
            #{"--"+$name+"-"+$opacity}: #{rgba(red($darkColor), green($darkColor), blue($darkColor), $multiplier)};
          }
        }
      }
    }
  }
}`;
  }

  /**
   * Generate @include statements for all colors
   */
  generateColorIncludes(colors: IColor): string {
    const includes: string[] = [];

    for (const [name, definition] of Object.entries(colors)) {
      const light = definition.light || 'null';
      const dark = definition.dark || 'null';
      includes.push(`@include setRootColors('${name}', ${light}, ${dark});`);
    }

    return includes.join('\n');
  }
}
