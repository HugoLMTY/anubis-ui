import packageJson from '../../../package.json';
const { version } = packageJson;

const header = `/**
 * Anubis v.${version}
 * Improba
 * Released under the MIT License.
 */`;

const mixin = `
$background-opacity: (
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
}
`;

const defineColor = (colorName: string, light?: string, dark?: string) => {
    // Handle cases where only dark is provided
    if (!light && dark) {
        return `@include setRootColors('${colorName}', null, ${dark});`;
    }
    // Handle cases where only light is provided or both are provided
    return `@include setRootColors('${colorName}', ${light}${
        dark ? ', ' + dark : ''
    });`;
};

const getHeader = () => {
    return `${header}${mixin}`;
};

export { getHeader, defineColor };
