# AnubisUI
> powered by [__Improba__](https://improba.fr/)

AnubisUI (Autonomous Nominative Utility Based Intuitive Styler) is a Vite plugin that provides dynamic CSS class generation based on configuration files. It automatically generates CSS rules by scanning your Vue files and mapping utility classes to their corresponding styles.

> __THIS DOESN'T WORK__ ```<div :class="`bg-primary-${props.bg || 'low'}\`" />```
> <br />
> Classes must be EXPLICITY written in the code to allow the extraction to work correctly, dynamic classes will not work
> <br />
> In the future, some config will allow to generate a bunch of specified classes even if not present in the code
> <br />
> Until then, you can create a decoy .vue file filled with the dynamic classes you want
> <br />

## Table of Contents
1. [Features](#features)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Available Utility Classes](#available-utility-classes)
5. [Prefix/Declaration relations](#prefixdeclaration-relations)
6. [Architecture](#architecture)
7. [Credits](#credits)
8. [Licence](#licence)

## Features
- 🎨 Dynamic CSS generation based on utility classes
- 🔄 Hot-reloading support through Vite plugin
- 📦 Configurable color system
- 🛠️ Customizable presets for:
  - Background opacities
  - Border widths
  - Inner borders
  - Shadows
- 🎯 State modifiers (hover, not-hover)
- 🔍 Smart class detection and parsing

# Installation

1. Add the package to your project
<br />
`npm install anubis-ui`

2. In the config file, add the package in the plugin section
```js
vitePlugins: [
  [
    anubisUI(),
    ...
  ]
]
```
<sup>quasar.config.js</sup>

3. Still in the config file, add the generated file to the css usage (rules are generated in `src/css/_anubis.scss`, file is auto-created)
```js
css: [
  'app.scss',
  '_anubis.scss'
],
```
<sup>quasar.config.js</sup>

4. Declare your project colors in the DOM ::root in anyway you want
<br />
Personnaly, i use the following method based on a mixin declaration

```scss
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

@mixin setGlobalColors($name, $light, $dark) {
  @include setRootColors($name, $light, 'body--light');
  @include setRootColors($name, $dark, 'body--dark');
}

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
```
<sup>src/css/_mixins.scss</sup>

```scss
@import './mixins';

/**...highest... */
/**...higher... */
/**...high... */
@include setGlobalColors('primary', $blue-500, $blue-400);
/**...low... */
/**...lower... */
/**...lowest... */

@include setGlobalColors('secondary', $blue-grey-500, $blue-grey-400);
@include setGlobalColors('accent', $blue-500, $blue-400);
@include setGlobalColors('neutral', $slate-500, $slate-500);
@include setGlobalColors('success', $green-500, $green-400);
@include setGlobalColors('danger', $red-500, $red-400);
```
<sup>src/css/_colors_.scss</sup>


5. Start adding classes however you want to (in *.vue files)
```html
<div class="bg-primary border-neutral-low hover:shadow-low" />
```
<sup>any .vue file</sup>

6. Enjoy

## Configuration
AnubisUI uses several configuration files located in the `src/config` directory:
<br />
To override default configuration, add a `anubis.config.json` in project root folder.
>Overriding completly replaces default configuration. You need to copy/paste it and add yours if you want to keep the default too.
<br />

For every config you want to change, add the corresponding section in your config file:

```js
{
  // files.config.json
  "files": {
    "targets": ["/.vue"],
    "ignore": []
  },

  // colors.config.json
  "colors": ["primary", "secondary"],

  // states.config.json
  "states": ["hover"],

  // qol.config.json
  "qol": [
    {
      "prefix": "bg",
      "declaration": "background: ${color}"
    }
  ],

  // presets.config.json
  "presets": [
    {
      "prefix": "border",
      "declaration": "border-width: ${value} !important; border-color: ${color} !important; border-style: solid;",
      "variations": {
        "default": "4px",
        "thin": "2px"
      }
    }
  ]
}
```
<sup>anubis.config.json (example)</sup>

Only the sections you want to override need to be included - other sections will use default values. Not every
> Presets is still unstable, use at your own risks
<br />
You __MUST__ use the exact same [presets](#presets-presetsconfigjson) names syntax to keep it working, but variations key/values can change.
<br />
Copy-paste is recommanded

---
### Colors (`colors.config.json`)
Define your color palette
<details>
<summary>Default config</summary>

```json
[
  "primary",
  "secondary",
  "accent",
  "neutral",
  "success",
  "warning",
  "danger"
]
```
</details>

---
### Files (`files.config.json`)
Specify which files to scan for classes
<details>
<summary>Default config</summary>

```json
{
  "targets": [
    "/.vue"
  ]
}
```
</details>

---
### Presets (`presets.config.json`)
Configure common style presets
> If overrided in config, default key/value are __REQUIRED__

<details>
<summary>Default config</summary>

```json
[
  {
    "prefix": "bg",
    "declaration": "background: ${color}"
  },
  {
    "prefix": "border",
    "declaration": "border-width: ${value} !important; border-color: ${color} !important; border-style: solid;",
    "variations": {
      "default": "4px",
      "thinest": "1px",
      "thiner": "2px",
      "thin": "3px",
      "thick": "6px",
      "thicker": "8px",
      "thickest": "10px",
      "node": "0.2rem"
    }
  },
  {
    "prefix": "inner-border",
    "declaration": "box-shadow: inset 0px 0px 0px ${value} ${color}",
    "variations": {
      "default": "4px",
      "thinest": "1px",
      "thiner": "2px",
      "thin": "3px",
      "thick": "6px",
      "thicker": "8px",
      "thickest": "10px",
      "node": "0.2rem"
    }
  },
  {
    "prefix": "shadow",
    "declaration": "box-shadow: ${value} ${color}",
    "variations": {
      "default": "0px 0px 7px 1px",
      "densest": "0px 0px 3px 1px",
      "denser": "0px 0px 5px 1px",
      "dense": "0px 0px 5px 1px",
      "wide": "0px 0px 10px 1px",
      "wider": "0px 0px 15px 1px",
      "widest": "0px 0px 20px 1px"
    }
  }
]
```
</details>

---
### Quality of Life (`qol.config.json`)
Define simple style rules that can have variations but don't require color values. These are CSS declarations that work independently.
<details>
<summary>Default config</summary>

```json
[
  {
    "prefix": "smooth",
    "standalone": true,
    "declaration": "transition-duration: ${value}",
    "variations": {
      "default": "0.1s",
      "slowest": "0.5s",
      "slower": "0.3s",
      "slow": "0.2s",
      "quick": "0.07s",
      "quicker": "0.05s",
      "quickest": "0.03s"
    }
  },
  {
    "prefix": "rounded",
    "standalone": true,
    "declaration": "border-radius: ${value}",
    "variations": {
      "default": "8px",
      "square": "0px",
      "xs": "2px",
      "sm": "4px",
      "md": "8px",
      "lg": "12px",
      "xl": "16px",
      "very": "9999px",
      "full": "50%",
      "half": "100%"
    }
  },
  {
    "prefix": "border",
    "declaration": "border-style: ${value}",
    "variations": {
      "solid": "solid",
      "dashed": "dashed",
      "dotted": "dotted"
    }
  }
]
```
</details>

QoL rules can have:
1. A prefix
2. A declaration that uses ${value} for variations
3. Optional variations with default values
4. Optional `standalone` flag to allow usage without variations

The `standalone` flag allows a QoL rule to be used without any variation. When set to `true`, the rule can be used:
- With a variation: `rounded-lg`, `smooth-slow`
- Without a variation: `rounded`, `smooth` (will use the default value)

When `standalone` is `false` or not specified, the rule must always include a variation (e.g., `border-dashed`).

Example usage:
```html
<div class="rounded-lg smooth-slow border-dashed" />
<div class="rounded smooth" /> <!-- Works because these are standalone -->
```

## Available Utility Classes
#### Colors
- `bg-{color}` - Background color
- `text-{color}` - Text color
- `border-{color}` - Border color
- `inner-border-{color}` - Inner border color (inset box shadow, not compatible with `shadow-`)
- `shadow-{color}` - Box shadow color (not compatible with `inner-border-`)

#### Presets variations
- `bg-{color}-{(10-90)}` - Background opacity
- `border-{color}-{presetKey}` - Border width
- `shadow-{color}-{presetKey}` - Box shadow spread
- `inner-border-{color}-{presetKey}` - Box shadow inset width

#### States
- `hover:{utility}` - Apply style on hover
- `not-hover:{utility}` - Apply style when not hovering

## Prefix/Declaration relations
| prefix       | declaration                                                                 |
|--------------|-----------------------------------------------------------------------------|
| bg           | `background: {color} important;`                                            |
| text         | `color: {color} important;`                                                 |
| border       | `border-width: {presetValue \|\| default} !important; border-color: {color} !important; border-style: solid;` |
| inner-border | `box-shadow: inset {presetValue \|\| default} {color} !important;`            |
| shadow       | `box-shadow: {presetValue \|\| default} {color} !important;`                  |

## Architecture
### Core Components
- **Vite Plugin**: Handles file watching and build process
- **Class Extractor**: Scans files for utility classes
- **Rule Generator**: Converts utility classes to CSS rules
- **Configuration System**: Manages user preferences and presets

### File Structure
```
├── dist/ # Compiled and generated output
├── src/
│ ├── config/ # Configuration files
│ ├── interfaces/ # TypeScript interfaces
│ └── tools/
│   ├── extraction/ # Class extraction logic
│   ├── fileStuff/ # File handling utilities
│   └── mapping/ # Class to CSS rule mapping
└── index.js # Plugin entry point
```


## Credits

This project was made possible thanks to the support and resources provided by [__Improba__](https://improba.fr/).
<br />
Their trust and commitment played a key role in bringing this idea to life, and i'm grateful for their involvement in making it happen.

## Licence

This project is licensed under the [MIT License](./LICENSE).