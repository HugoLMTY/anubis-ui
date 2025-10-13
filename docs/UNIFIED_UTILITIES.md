# Unified Utilities - Configuration Simplifiée

## Principe

**Un seul type de configuration** où le comportement est déduit automatiquement de la `declaration`.

## Placeholders

- `${color}` - Remplacé par `var(--colorName)`
- `${variant}` - Remplacé par la valeur du variant

## Types d'Utilities (Détection Automatique)

### Color Only

```json
{
  "prefix": "bg",
  "declaration": "background: ${color}"
}
```
**Usage** : `bg-primary`, `bg-accent-50`

### Variant Simple (Array)

```json
{
  "prefix": "border-style",
  "declaration": "border-style: ${variant}",
  "variants": ["solid", "dashed", "dotted"]
}
```
**Usage** : `border-style-solid`
**CSS** : `border-style: solid`

### Variant avec Mapping (Object)

```json
{
  "prefix": "weight",
  "declaration": "font-weight: ${variant}",
  "export-variants": true,
  "variants": {
    "thin": 100,
    "bold": 700
  }
}
```
**Usage** : `weight-bold`
**CSS** : `font-weight: var(--weight-bold)` (si export-variants: true)
**Variables** : `--weight-bold: 700`

### Variant avec Default (Standalone)

```json
{
  "prefix": "rounded",
  "declaration": "border-radius: ${variant}",
  "export-variants": true,
  "variants": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px"
  },
  "default-variant": "md"
}
```
**Usage** :
- `rounded` → utilise "md"
- `rounded-lg` → utilise "lg"

### Color + Variant

```json
{
  "prefix": "border",
  "declaration": "border-width: ${variant}; border-color: ${color}; border-style: solid;",
  "variants": {
    "thin": "1px",
    "thick": "4px"
  }
}
```
**Usage** : `border-primary-thick`

### Static (Aucun Placeholder)

```json
{
  "prefix": "flex",
  "declaration": "display: flex"
}
```
**Usage** : `flex`

## Structure TypeScript

```typescript
// shared/types/utility.types.ts

export type VariantDefinition =
  | string[]
  | Record<string, string | number>;

export interface UtilityConfig {
  prefix: string;
  declaration: string;
  variants?: VariantDefinition;
  defaultVariant?: string;
  exportVariants?: boolean;
}

export type UtilityContext = 'color' | 'variant' | 'both' | 'static';
```

## Domain Model

```typescript
// domain/models/Utility.ts

export class Utility {
  private readonly context: UtilityContext;
  private readonly hasColor: boolean;
  private readonly hasVariant: boolean;

  constructor(
    public readonly prefix: string,
    public readonly declaration: string,
    public readonly variants?: VariantDefinition,
    public readonly defaultVariant?: string,
    public readonly exportVariants: boolean = false
  ) {
    this.hasColor = declaration.includes('${color}');
    this.hasVariant = declaration.includes('${variant}');
    this.context = this.determineContext();
  }

  private determineContext(): UtilityContext {
    if (this.hasColor && this.hasVariant) return 'both';
    if (this.hasColor) return 'color';
    if (this.hasVariant) return 'variant';
    return 'static';
  }

  getContext(): UtilityContext {
    return this.context;
  }

  isStandalone(): boolean {
    return !!this.defaultVariant;
  }

  getNormalizedVariants(): Record<string, string> | null {
    if (!this.variants) return null;

    if (Array.isArray(this.variants)) {
      return Object.fromEntries(
        this.variants.map(v => [v, v])
      );
    }

    return Object.fromEntries(
      Object.entries(this.variants).map(([k, v]) => [k, String(v)])
    );
  }

  generateDeclaration(params: {
    color?: string;
    variant?: string;
  }): string {
    let declaration = this.declaration;

    // Remplacer ${color}
    if (params.color && this.hasColor) {
      declaration = declaration.replace('${color}', `var(--${params.color})`);
    }

    // Remplacer ${variant}
    if (this.hasVariant) {
      const variantName = params.variant || (this.isStandalone() ? this.defaultVariant : null);

      if (variantName) {
        const variants = this.getNormalizedVariants();
        const value = variants?.[variantName];

        if (value) {
          const replacement = this.exportVariants
            ? `var(--${this.prefix}-${variantName})`
            : value;

          declaration = declaration.replace('${variant}', replacement);
        }
      }
    }

    return declaration;
  }

  getExportedVariants(): Record<string, string> | null {
    if (!this.exportVariants || !this.hasVariant) return null;

    const variants = this.getNormalizedVariants();
    if (!variants) return null;

    return Object.fromEntries(
      Object.entries(variants).map(([name, value]) => [
        `${this.prefix}-${name}`,
        value
      ])
    );
  }
}
```

## Configuration Complète

```json
// config/utilities.config.json
[
  // Color only
  {
    "prefix": "bg",
    "declaration": "background: ${color}"
  },
  {
    "prefix": "text",
    "declaration": "color: ${color}"
  },

  // Variant simple
  {
    "prefix": "border-style",
    "declaration": "border-style: ${variant}",
    "variants": ["solid", "dashed", "dotted"]
  },

  // Variant avec mapping
  {
    "prefix": "weight",
    "declaration": "font-weight: ${variant}",
    "export-variants": true,
    "variants": {
      "thin": 100,
      "light": 300,
      "normal": 400,
      "bold": 700
    }
  },

  // Variant standalone
  {
    "prefix": "rounded",
    "declaration": "border-radius: ${variant}",
    "export-variants": true,
    "variants": {
      "sm": "4px",
      "md": "8px",
      "lg": "12px"
    },
    "default-variant": "md"
  },

  // Color + Variant
  {
    "prefix": "border",
    "declaration": "border-width: ${variant}; border-color: ${color}; border-style: solid;",
    "variants": {
      "thin": "1px",
      "default": "2px",
      "thick": "4px"
    },
    "default-variant": "default"
  },

  // Static
  {
    "prefix": "flex",
    "declaration": "display: flex"
  }
]
```

## Migration depuis Presets/QoL

```typescript
export function migrateToUtilities(
  presets: PresetConfig[],
  qol: QolConfig[]
): UtilityConfig[] {
  const utilities: UtilityConfig[] = [];

  // Presets
  for (const preset of presets) {
    const declaration = preset.declaration.replace(/\$\{value\}/g, '${variant}');

    utilities.push({
      prefix: preset.prefix,
      declaration,
      variants: preset.variations,
      exportVariants: preset['export-variations'],
    });
  }

  // QoL
  for (const item of qol) {
    const declaration = item.declaration.replace(/\$\{value\}/g, '${variant}');

    utilities.push({
      prefix: item.prefix,
      declaration,
      variants: item.variations,
      defaultVariant: item.standalone ? 'default' : undefined,
      exportVariants: item['export-variations'],
    });
  }

  return utilities;
}
```

## Exemples d'Usage

```html
<!-- Color -->
<div class="bg-primary text-white"></div>

<!-- Variant simple -->
<div class="border-style-dashed"></div>

<!-- Variant mapping -->
<p class="weight-bold"></p>

<!-- Variant standalone -->
<div class="rounded"></div>
<div class="rounded-lg"></div>

<!-- Color + Variant -->
<div class="border-primary-thick"></div>

<!-- Static -->
<div class="flex"></div>
```

## Comparaison

### Avant (2 configs)
```json
// presets.config.json
{ "prefix": "bg", "declaration": "background: ${color}" }

// qol.config.json
{
  "prefix": "rounded",
  "declaration": "border-radius: ${value}",
  "standalone": true,
  "variations": { "md": "8px" }
}
```

### Après (1 config)
```json
// utilities.config.json
[
  { "prefix": "bg", "declaration": "background: ${color}" },
  {
    "prefix": "rounded",
    "declaration": "border-radius: ${variant}",
    "variants": { "md": "8px" },
    "default-variant": "md"
  }
]
```
