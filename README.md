# AnubisUI
> powered by [__Improba__](https://improba.fr/)

AnubisUI (Autonomous Nominative Utility Based Intuitive Styler) is a Vite plugin that provides dynamic CSS class generation based on configuration files. It automatically generates CSS rules by scanning your Vue files and mapping utility classes to their corresponding styles.

## Table of Contents
1. [Features](#features)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Usage](#usage)
5. [Architecture](#architecture)

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

3. Still in the config file, add the generated file to the css usage
```js
css: [
  'app.scss',
  '~anubis-ui/dist/_anubis.scss'
],
```
<sup>quasar.config.js</sup>


4. Start adding classes to your *.vue files
```html
<div class="bg-primary border-neutral-low hover:shadow-low" />
```
<sup>any .vue file</sup>

5. Declare your project colors in the DOM ::root in anyway you want
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

@mixin setGlobalColors($light, $dark, $name) {
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

@include defineColorLightAndDark('primary', $blue-500, $blue-400);
@include defineColorLightAndDark('secondary', $blue-grey-500, $blue-grey-400);
@include defineColorLightAndDark('accent', $blue-500, $blue-400);
@include defineColorLightAndDark('neutral', $slate-500, $slate-500);
@include defineColorLightAndDark('success', $green-500, $green-400);
@include defineColorLightAndDark('danger', $red-500, $red-400);
```
<sup>src/css/_colors_.scss</sup>

6. Enjoy

## Configuration
AnubisUI uses several configuration files located in the `src/config` directory:
<br />
Customisation from root file `anubis.config.json` will appear in future updates

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
<details>
<summary>Default config</summary>

```json
{
  "border": [
    { "default": "4px" },
    { "thinest": "1px" },
    { "thiner": "2px" },
    { "thin": "3px" },
    { "thick": "6px" },
    { "thicker": "8px" },
    { "thickest": "10px" },
  ],

  "innerBorder": [
    { "default": "4px" },
    { "thinest": "1px" },
    { "thiner": "2px" },
    { "thin": "3px" },
    { "thick": "6px" },
    { "thicker": "8px" },
    { "thickest": "10px" },
  ],

  "shadow": [
    { "default": "0px 0px 7px 1px" },
    { "densest": "0px 0px 3px 1px" },
    { "denser": "0px 0px 5px 1px" },
    { "dense": "0px 0px 5px 1px" },
    { "wide": "0px 0px 10px 1px" },
    { "wider": "0px 0px 15px 1px" },
    { "widest": "0px 0px 20px 1px" }
  ]
}
```
</details>


---
### Selectors (`selectors.config.json`)
Define available states and style prefixes

<details>
<summary>Default config</summary>

```json
{
  "states": [
      "hover",
      "not-hover"
  ],
  "prefixes": [
      "bg",
      "text",
      "border",
      "inner-border",
      "shadow"
  ]
}
```
</details>


## Available Utility Classes
#### Colors
- `bg-{color}` - Background color
- `text-{color}` - Text color
- `border-{color}` - Border color
- `shadow-{color}` - Box shadow color

#### States
- `hover:{utility}` - Apply style on hover
- `not-hover:{utility}` - Apply style when not hovering

#### Presets
- `bg-{color}-{(10-90)}` - Background opacity
- `border-{color}-{preset}` - Border width
- `shadow-{color}-{preset}` - Box shadow spread
- `inner-border-{color}-{preset}` - Box shadow inset width

## Architecture
### Core Components
- **Vite Plugin**: Handles file watching and build process
- **Class Extractor**: Scans files for utility classes
- **Rule Generator**: Converts utility classes to CSS rules
- **Configuration System**: Manages user preferences and presets

### File Structure
```
</details>src/

├── config/ # Configuration files
├── interfaces/ # TypeScript interfaces
├── manual/ # Manually trigger anubis actions
├── tools/
│ ├── extract/ # Class extraction logic
│ ├── mapping/ # Class to CSS rule mapping
│ └── declaration/ # Style declaration handlers
└── index.ts # Plugin entry point
```


## Credits

This project was made possible thanks to the support and resources provided by [__Improba__](https://improba.fr/).
<br />
Their trust and commitment played a key role in bringing this idea to life, and i'm grateful for their involvement in making it happen.