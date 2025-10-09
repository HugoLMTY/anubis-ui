const { version } = require('./../../../package.json')

const header = `/*!
 * * Anubis v.${version}
 * * Improba
 * * Released under the MIT License.
 * */`

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

@mixin setRootColors ($name, $color, $theme) {
  :root {
    body.#{$theme} {
      #{"--"+$name}: $color;

      @if $color != transparent {
        @each $opacity, $multiplier in $background-opacity {
          #{"--"+$name+"-"+$opacity}: #{rgba(red($color), green($color), blue($color), $multiplier)};
        }
      }
    }
  }
}
`

const defineColor = (colorName: string, light: string, dark?: string) => {
  let definition = `@include setRootColors('${colorName}', ${light}, 'body--light');`

  if (dark) {
    definition += `\n@include setRootColors('${colorName}', ${dark}, 'body--dark');`
  }

  return definition
}

const getHeader = () => {
  return `${header}${mixin}`
}

export {
  getHeader,
  defineColor,
}