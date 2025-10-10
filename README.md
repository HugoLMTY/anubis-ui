# AnubisUI
> powered by [__Improba__](https://improba.fr/)

AnubisUI (Autonomous Nominative Utility Based Intuitive Styler) is a Vite plugin that provides dynamic CSS class generation based on configuration files. It automatically generates CSS rules by scanning your source files and mapping utility classes to their corresponding styles.

> __⚠️ IMPORTANT__ - Dynamic classes like `` `bg-primary-${props.bg}` `` **will NOT work**
>
> Classes must be **EXPLICITLY written** in the code to allow the extraction to work correctly. The plugin uses regex pattern matching on your source files.
>
> Use the `force` configuration to generate specific classes even if they're not present in the code.


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
- 🌓 Built-in light/dark theme color system
- 🛠️ Customizable presets for:
  - Background & text colors
  - Border widths and styles
  - Inner borders (inset shadows)
  - Box shadows
  - Border radius
  - Transitions
  - Typography (size, weight)
  - Positioning & blur effects
- 🎯 State modifiers (hover, not-hover)
- 🔍 Smart class detection and parsing
- 📦 CSS variable generation for reusable values
- ⚙️ Export variations as CSS variables for custom styling

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

4. Colors are automatically defined from the configuration
   - AnubisUI generates CSS variables for all colors defined in `colors.config.json`
   - Colors support light/dark themes automatically
   - Each color is exposed as a CSS variable: `--primary`, `--secondary`, etc.
   - Pre-defined color levels: `lowest`, `lower`, `low`, `medium`, `high`, `higher`, `highest`

5. Start adding classes to your HTML files
```html
<div class="bg-primary-low border-neutral-medium hover:shadow-wide rounded-lg" />
<button class="bg-accent text-text-invert size-lg weight-bold smooth">Click me</button>
```
<sup>any .html file</sup>

6. Enjoy

> **Note**: Generated CSS variables (from colors and export-variations) are available for custom styling:
> ```css
> .custom-class {
>   background: var(--primary-low);
>   font-size: var(--size-xl);
>   font-weight: var(--weight-bold);
> }
> ```

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
  ],

  // force.config.json
  "force": [
    "bg-primary-10",
    "bg-primary-20",
    "bg-primary-30"
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
Define your color palette with light/dark theme support. Each color requires `light` and `dark` values.

**[View default colors config →](./src/config/colors.config.json)**

Full palette includes: `primary`, `secondary`, `accent`, `neutral`, `success`, `warning`, `danger` with levels: `lowest`, `lower`, `low`, `medium`, `high`, `higher`, `highest`.

**Color naming convention**: Colors are automatically converted to CSS variables as `--{color-name}`. Use semantic color levels to ensure proper theme adaptation.

---
### Files (`files.config.json`)
Specify which files to scan for classes using glob patterns.

**[View default files config →](./src/config/files.config.json)**

You can add multiple glob patterns to scan different file types:
```json
{
  "targets": [
    "**/*.html",
    "**/*.vue",
    "**/*.jsx"
  ]
}
```

---
### Presets (`presets.config.json`)
Configure common style presets that require both color and variation values.

**[View default presets config →](./src/config/presets.config.json)**

> **Note**: If overriding in your config, the default key/value are __REQUIRED__

Presets include:
- `bg` - Background colors (no variations)
- `text` - Text colors (no variations)
- `border` - Border with width variations
- `inner-border` - Inset box shadow with width variations
- `shadow` - Box shadow with spread variations

---
### Quality of Life (`qol.config.json`)
Define simple style rules that can have variations but don't require color values. These are CSS declarations that work independently.

**[View default QoL config →](./src/config/qol.config.json)**

QoL utilities include:
- `blur` - Backdrop filter blur effect
- `smooth` - Transition duration
- `rounded` - Border radius
- `border` - Border style (solid, dashed, dotted)
- `position` - CSS positioning (relative, absolute)
- `size` - Font sizes (2xs to 9xl) with CSS variable export
- `weight` - Font weights (thin to black) with CSS variable export

**Configuration options**:
1. `prefix` - The class name prefix
2. `declaration` - CSS rule using `${value}` placeholder for variations
3. `variations` - Key-value pairs of variation names and their CSS values
4. `standalone` (optional) - Allows usage without variation (uses `default` value)
5. `export-variations` (optional) - Generates CSS variables for all variations

**The `standalone` flag**:
- `standalone: true` → Can use `rounded` or `rounded-lg` (both valid)
- `standalone: false` or omitted → Must use `border-solid` (requires variation)

**The `export-variations` flag**:
- `export-variations: true` → Generates `--size-xs`, `--size-md`, etc. as CSS variables
- These can be used in custom CSS: `font-size: var(--size-xl)`

Example usage:
```html
<div class="rounded-lg smooth-slow border-dashed" />
<div class="rounded smooth blur" /> <!-- Standalone rules with default values -->
<p class="size-2xl weight-bold">Typography utilities</p>
```

### States (`states.config.json`)
Define state modifiers that can be applied to any utility class.

**[View default states config →](./src/config/states.config.json)**

Default states: `hover`, `not-hover`

### Force
Force the generation of specific CSS classes even if they're not found in your code. This is particularly useful for dynamic classes that can't be detected during the extraction process.

Add a `force` array to your `anubis.config.json`:
```json
{
  "force": [
    "bg-primary-lowest",
    "bg-primary-low",
    "bg-primary-medium",
    "hover:bg-secondary-high"
  ]
}
```

## Available Utility Classes

### Color-Based Classes
These utilities require a color from your config:

- `bg-{color}` - Background color
- `text-{color}` - Text color
- `border-{color}` - Border with color (also requires variation for width)
- `inner-border-{color}` - Inset box shadow (not compatible with `shadow-`)
- `shadow-{color}` - Box shadow (not compatible with `inner-border-`)

**Available colors**: `none`, `text`, `text-invert`, `text-link`, `primary`, `secondary`, `accent`, `neutral`, `success`, `warning`, `danger`

**Color levels**: Most colors have variants - `lowest`, `lower`, `low`, `medium`, `high`, `higher`, `highest`

Examples:
```html
<div class="bg-primary-low text-text-invert">Blue background with inverted text</div>
<div class="bg-success-lowest text-success-highest">Success themed element</div>
```

### Preset Variations (Color + Size)
Presets combine colors with size variations:

- `border-{color}-{variation}` - Border with color and width
  - Variations: `thinest`, `thiner`, `thin`, `default`, `thick`, `thicker`, `thickest`, `node`
- `inner-border-{color}-{variation}` - Inset shadow with color and width
  - Variations: `thinest`, `thiner`, `thin2`, `default`, `thick`, `thicker`, `thickest`, `node`
- `shadow-{color}-{variation}` - Box shadow with color and spread
  - Variations: `densest`, `lower`, `dense`, `default`, `wide`, `wider`, `widest`

Examples:
```html
<div class="border-neutral-thin">Thin neutral border</div>
<div class="inner-border-accent-thick">Thick accent inset border</div>
<div class="shadow-primary-wide hover:shadow-primary-widest">Shadow on hover</div>
```

### Quality of Life Classes (No Color Required)
Standalone utilities that work independently:

- `blur` / `blur-{default}` - Backdrop filter blur (default: 3px)
- `smooth` / `smooth-{variation}` - Transition duration
  - Variations: `quickest`, `quicker`, `quick`, `default`, `slow`, `slower`, `slowest`
- `rounded` / `rounded-{variation}` - Border radius
  - Variations: `square`, `xs`, `sm`, `md`, `lg`, `xl`, `very`, `full`, `half`
- `border-{style}` - Border style
  - Variations: `solid`, `dashed`, `dotted`
- `position-{type}` - CSS positioning
  - Variations: `relative`, `absolute`
- `size-{size}` - Font size (generates CSS variables)
  - Variations: `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`, `6xl`, `7xl`, `8xl`, `9xl`
- `weight-{weight}` - Font weight (generates CSS variables)
  - Variations: `thin`, `extra-light`, `light`, `normal`, `medium`, `semi-bold`, `bold`, `extra-bold`, `black`

Examples:
```html
<div class="rounded-lg smooth">Rounded with smooth transition</div>
<p class="size-xl weight-bold">Large bold text</p>
<div class="blur position-absolute">Blurred absolute positioned element</div>
```

### State Modifiers
Apply styles conditionally based on element state:

- `hover:{utility}` - Apply style on hover
- `not-hover:{utility}` - Apply style when not hovering

Examples:
```html
<button class="bg-primary hover:bg-primary-high">Darkens on hover</button>
<div class="shadow-none hover:shadow-accent-wide">Shadow appears on hover</div>
<span class="size-md hover:size-lg">Text grows on hover</span>
```

## Prefix/Declaration Relations

### Color Presets
| Prefix       | CSS Declaration                                                                 |
|--------------|---------------------------------------------------------------------------------|
| bg           | `background: var(--{color}) !important;`                                        |
| text         | `color: var(--{color}) !important;`                                             |
| border       | `border-width: {value} !important; border-color: var(--{color}) !important; border-style: solid;` |
| inner-border | `box-shadow: inset 0px 0px 0px {value} var(--{color}) !important;`             |
| shadow       | `box-shadow: {value} var(--{color}) !important;`                                |

### Quality of Life Utilities
| Prefix   | CSS Declaration                               |
|----------|-----------------------------------------------|
| blur     | `backdrop-filter: blur({value}) !important;`  |
| smooth   | `transition-duration: {value} !important;`    |
| rounded  | `border-radius: {value} !important;`          |
| border   | `border-style: {value} !important;`           |
| position | `position: {value} !important;`               |
| size     | `font-size: {value} !important;`              |
| weight   | `font-weight: {value} !important;`            |

**Note**: When `export-variations: true` is set, `{value}` becomes `var(--{prefix}-{variation})` instead of the direct value.

## Architecture

### Build Process Flow

1. **Configuration Initialization** (`src/tools/config.tool.ts`)
   - Loads default configs from `src/config/*.config.json`
   - Merges with user's `anubis.config.json` if present
   - User config completely replaces default sections (no deep merge)

2. **File Scanning** (`src/tools/fileStuff/file.tools.ts`)
   - Scans files matching glob patterns from `files.config.json`
   - Concurrent file reading with configurable limit (default: 10 files)

3. **Class Extraction** (`src/tools/extraction/extractClasses.ts`)
   - Builds dynamic regex from config (states, presets, qol prefixes)
   - Extracts classes matching pattern: `(state:)?(prefix-)(-?(color|variation))?`
   - Merges with forced classes from config
   - Deduplicates and returns unique classes

4. **Rule Generation** (`src/tools/mapping/mapClassIntoRule.ts`)
   - Parses each class to identify state, prefix, color, and variation
   - Validates color existence in config
   - Handles preset variations (direct values or CSS variables)
   - Generates CSS rules with proper selectors and declarations
   - Collects variants for CSS variable export

5. **CSS Output** (`src/tools/fileStuff/css.file.ts`)
   - Generates color CSS variables with light/dark theme support
   - Generates variation CSS variables (from `export-variations: true`)
   - Writes final CSS rules
   - Outputs to `src/css/_anubis.scss`

### Vite Plugin Integration

The plugin (`index.js`) provides:
- **`buildStart()` hook** - Runs full CSS generation on build
- **`configureServer()` hook** - Watches file changes and regenerates CSS
- **Hot reload** - Automatically reloads on `anubis.config.json` changes

### Core Components

- **Config System**: Manages configuration loading and merging
- **Class Extractor**: Regex-based pattern matching for class detection
- **Rule Mapper**: Complex parsing logic for class-to-CSS conversion
- **CSS Generator**: Generates variables and rules with proper formatting

### File Structure
```
├── dist/                           # Compiled output
├── src/
│   ├── config/                     # Default configuration files
│   │   ├── colors.config.json      # Color palette (light/dark themes)
│   │   ├── presets.config.json     # Color-based utilities
│   │   ├── qol.config.json         # Standalone utilities
│   │   ├── states.config.json      # State modifiers
│   │   └── files.config.json       # File scan patterns
│   ├── interfaces/                 # TypeScript type definitions
│   └── tools/
│       ├── extraction/             # Class extraction logic
│       ├── fileStuff/              # File I/O operations
│       ├── mapping/                # Class-to-CSS mapping
│       ├── config.tool.ts          # Configuration loader
│       └── logger.ts               # Logging utilities
└── index.js                        # Vite plugin entry point
```

### Key Design Decisions

**Regex-Based Extraction**: Classes must be literal strings in source code for detection to work. Dynamic string interpolation is not supported.

**CSS Variables**: Colors and exported variations use CSS variables (`var(--name)`) for better reusability and theme support.

**Configuration Override**: User configs completely replace default sections to avoid merge complexity and unexpected behavior.

**Concurrency Control**: File reading uses a concurrency limit to prevent system overload on large codebases.

**Caching**: Regex patterns are cached based on config hash to avoid recompilation on every file scan.


## Credits

This project was made possible thanks to the support and resources provided by [__Improba__](https://improba.fr/).
<br />
Their trust and commitment played a key role in bringing this idea to life, and i'm grateful for their involvement in making it happen.

## Licence

This project is licensed under the [MIT License](./LICENSE).