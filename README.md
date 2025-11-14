# AnubisUI
> powered by [__Improba__](https://improba.fr/)

AnubisUI (Autonomous Nominative Utility Based Intuitive Styler) is a Vite plugin that provides dynamic CSS class generation based on configuration files. It automatically generates CSS rules by scanning your source files and mapping utility classes to their corresponding styles.

## 🚀 Quick Start

AnubisUI automatically generates the CSS classes you need, simply by using them in your code. No need to write CSS manually!

### Concrete Example

**In your Vue/HTML component:**
```html
<template>
  <div class="bg-primary-low text-primary rounded-lg smooth hover:shadow-accent-wide">
    <button class="bg-accent text-primary size-lg weight-bold hover:bg-accent-high">
      Click me
    </button>
  </div>
</template>
```

**AnubisUI automatically generates the CSS:**
```css
.bg-primary-low { background: var(--primary-low) !important; }
.text-primary { color: var(--primary) !important; }
.rounded-lg { border-radius: 12px !important; }
.smooth { transition-duration: 0.1s !important; }
.hover\:shadow-accent-wide:hover { box-shadow: 0px 0px 10px 2px var(--accent) !important; }
/* ... and much more */
```

### Key Benefits

✅ **Zero CSS to write** - Use classes, AnubisUI generates the CSS\
✅ **Light/dark themes** - Automatic support with CSS variables\
✅ **Hot-reload** - Classes are detected and generated on the fly\
✅ **Optimized** - Only used classes are generated\
✅ **Customizable** - Configure your colors, variations and presets

### Typical Use Cases

```html
<!-- Card with border and shadow on hover -->
<div class="bg-neutral-lowest border-neutral-thin rounded-lg hover:shadow-primary-wide smooth">
  <h2 class="text-primary size-2xl weight-bold">Title</h2>
  <p class="text-neutral-medium size-md">Description</p>
</div>

<!-- Button with states -->
<button class="bg-success text-primary rounded smooth hover:bg-success-high">
  Validate
</button>

<!-- Badge with inner borders -->
<span class="bg-warning-lowest inner-border-warning-thin rounded-full text-warning-high size-sm">
  New
</span>
```

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
7. [Development](#development)
8. [Credits](#credits)
9. [Licence](#licence)

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

5. Start adding classes to your .vue files
```html
<div class="bg-primary-low border-neutral-medium hover:shadow-wide rounded-lg" />
<button class="bg-accent text-primary size-lg weight-bold smooth">Click me</button>
```
<sup>any .vue file</sup>

6. Enjoy

> **Note**: Generated CSS variables (from colors and export) are available for custom styling:
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

Only the sections you want to override need to be included - other sections will use default values.\
For every config you want to change, add the corresponding section in your config file
<br />

### Some examples:
```js
{
  // files.config.json
  "files": {
    "targets": ["/.vue"],
    "ignore": ["**/*specificFile.vue"]
  },

  // colors.config.json
  "colors": ["primary", "secondary", "..."],

  // utilities.config.json
  "utilities": [
    {
      "prefix": "bg",
      "declaration": "background: ${color}",
      "export": "all"
    }
    {
      "prefix": "border",
      "declaration": "border-width: ${value} !important; border-color: ${color} !important; border-style: solid;",
      "variations": {
        "default": "4px",
        "thin": "2px"
      },
      "export": "variation"
    },
    {
      "prefix": "rounded",
      "declaration": "border-radius: ${value}",
      "variations": {
        "default": "8px",
        "lg": "12px"
      },
    }
  ],

  // force.config.json
  "force": [
    "bg-primary-10",
    "hover:border-neutral-thin",
    "text-danger"
  ]
}
```
<sup>anubis.config.json (example)</sup>

---
### Colors (`colors.config.json`)
Define your color palette with light/dark theme support. Colors can be defined in three different ways:

**[View default colors config →](./src/config/colors.config.json)**

**Color generation modes**:
1. **Both themes** - Define both `light` and `dark` values:
   ```json
   "primary": {
     "light": "#0f84cb",
     "dark": "#1a94db"
   }
   ```
   <sup>Generates color variables for both light and dark themes with opacity variations.</sup>

2. **Light theme only** - Define only `light` value:
   ```json
   "custom-light": {
     "light": "#ff00ff"
   }
   ```
   <sup>Generates color variables only for light theme. Dark theme will not have this color defined.</sup>

3. **Dark theme only** - Define only `dark` value:
   ```json
   "custom-dark": {
     "dark": "#00ffff"
   }
   ```
   <sup>Generates color variables only for dark theme. Light theme will not have this color defined.</sup>

Full palette includes:\
<b>Colors</b>
<ul>
  <li>primary</li>
  <li>secondary</li>
  <li>accent</li>
  <li>neutral</li>
  <li>success</li>
  <li>warning</li>
  <li>danger</lu>
</ul>

<b>Levels</b>
<ul>
  <li>lowest <i>- lighest</i></li>
  <li>lower</li>
  <li>low</li>
  <li>medium</li>
  <li>high</li>
  <li>higher</li>
  <li>highest <i>- darkest</i></li>
</ul>

**Color naming convention**: Colors are automatically converted to CSS variables as `--{color-name}`. Use semantic color levels to ensure proper theme adaptation.

**Opacity variations**: For non-transparent colors, AnubisUI automatically generates opacity variants (10 to 90) accessible via `--{color-name}-{opacity}` (e.g., `--primary-50` for 50% opacity).

**Color validation**: AnubisUI automatically validates your color configuration on build:
- Each color must have at least one theme defined (`light` or `dark`)
- Color values must be valid hex format (`#RRGGBB` or `#RGB`) or `transparent`
- Invalid configurations will throw an error with detailed messages

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
### Utilities (`utilities.config.json`)
Configure all utility classes. This includes both color-based utilities and standalone utilities.

**[View default utilities config →](./src/config/utilities.config.json)**

**Color-based utilities** (require a color):
- `bg` - Background colors
- `text` - Text colors
- `border` - Border with width variations and color
- `inner-border` - Inset box shadow with width variations and color
- `shadow` - Box shadow with spread variations and color


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
4. `export` (optional) - Controls how variations are exported as CSS variables

**The `export` flag**:
- `export: "variation"` → Generates CSS variables every variations
- `export: "all"` → Generates classes for every possible color
- These can be used in custom CSS: `font-size: var(--size-xl)`

**Color support**:
- Use `${color}` in declaration to indicate the utility requires a color
- Colors are automatically injected as CSS variables: `var(--{color})`

**Standalone usage**:
- Utilities with a `default` variation and no color requirement can be used without specifying a variation (e.g., `rounded` uses `rounded-default`)

Example usage:
```html
<div class="bg-primary-low border-neutral-medium hover:shadow-wide rounded-lg" />
<div class="rounded smooth blur" /> <!-- Uses default variations -->
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
<div class="bg-primary-low text-primary">Blue background with primary text</div>
<div class="bg-success-lowest text-success-highest">Success themed element</div>
```

### Utility Variations (Color + Size)
Utilities can combine colors with size variations:

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

### Color-based Utilities
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

**Note**: When `export: "variation"` is set, `{value}` becomes `var(--{prefix}-{variation})` instead of the direct value.

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
   - Builds dynamic regex from config (states, utilities prefixes)
   - Extracts classes matching pattern: `(state:)?(prefix-)(-?(color|variation))?`
   - Merges with forced classes from config
   - Deduplicates and returns unique classes

4. **Rule Generation** (`src/tools/mapping/mapClassIntoRule.ts`)
   - Parses each class to identify state, prefix, color, and variation
   - Validates color existence in config
   - Handles utility variations (direct values or CSS variables)
   - Generates CSS rules with proper selectors and declarations
   - Collects variants for CSS variable export

5. **CSS Output** (`src/tools/fileStuff/css.file.ts`)
   - Generates color CSS variables with light/dark theme support
   - Generates variation CSS variables (from `export: "variation"` or `export: "all"`)
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
│   │   ├── utilities.config.json   # All utility classes (bg, text, border, etc.)
│   │   ├── states.config.json       # State modifiers
│   │   ├── files.config.json       # File scan patterns
│   │   └── force.config.json       # Force specific classes
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

## Development

### Running Tests

AnubisUI uses [Vitest](https://vitest.dev/) for testing:

```bash
# Run tests in watch mode (recommended for development)
npm test

# Run tests once (CI/production)
npm run test:run

# Run tests with UI
npm run test:ui
```

### Test Coverage

- **Color Validation** - Tests for configuration validation logic
- Located in `tests/validation/`

See [tests/README.md](./tests/README.md) for more information.

## Credits

This project was made possible thanks to the support and resources provided by [__Improba__](https://improba.fr/).
<br />
Their trust and commitment played a key role in bringing this idea to life, and i'm grateful for their involvement in making it happen.

## Licence

This project is licensed under the [MIT License](./LICENSE).