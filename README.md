# Anubis UI
> powered by [__Improba__](https://improba.fr/)

Anubis UI (Autonomous Nominative Utility Based Intuitive Styler) is a Vite plugin that provides dynamic CSS class generation based on configuration files. It automatically generates CSS rules by scanning your Vue files and mapping utility classes to their corresponding styles.

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
`npm install anubis-ui`

## Configuration
Anubis UI uses several configuration files located in the `src/config` directory:

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


---### Selectors (`selectors.config.json`)
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