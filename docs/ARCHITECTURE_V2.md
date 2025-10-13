# Architecture V2 - AnubisUI avec Utilities Unifiées

## Vue d'ensemble

Architecture basée sur les principes DDD (Domain-Driven Design) avec **Utilities unifiées** remplaçant presets/qol.

## Structure Proposée

```
src/
├── core/                           # Logique métier principale
│   ├── config/
│   │   ├── loader.ts              # Chargement configuration
│   │   ├── merger.ts              # Fusion user + default
│   │   └── validator.ts           # Orchestration validation
│   ├── extraction/
│   │   ├── class-extractor.ts     # Extraction classes des fichiers
│   │   ├── regex-builder.ts       # Construction regex dynamique
│   │   └── class-parser.ts        # Parsing des classes extraites
│   └── generation/
│       ├── rule-generator.ts      # Génération règles CSS
│       ├── color-generator.ts     # Génération variables couleurs
│       └── variant-generator.ts   # Génération variants exportés
│
├── domain/                         # Modèle de domaine
│   ├── models/
│   │   ├── Color.ts               # Entité Color
│   │   ├── Utility.ts             # Entité Utility (remplace Preset + Qol)
│   │   ├── Rule.ts                # Value Object Rule
│   │   └── Config.ts              # Agrégat Config
│   └── validators/
│       ├── color.validator.ts
│       ├── utility.validator.ts   # Validation utilities
│       └── config.validator.ts
│
├── infrastructure/                 # Couche infrastructure
│   ├── filesystem/
│   │   ├── file-reader.ts         # Lecture fichiers
│   │   ├── file-writer.ts         # Écriture fichiers
│   │   └── file-scanner.ts        # Scan glob patterns
│   ├── cache/
│   │   └── regex-cache.ts         # Cache pour regex
│   └── output/
│       ├── css-writer.ts          # Écriture CSS
│       └── scss-templates.ts      # Templates SCSS
│
├── shared/                         # Code partagé
│   ├── types/
│   │   ├── config.types.ts
│   │   ├── color.types.ts
│   │   ├── utility.types.ts       # Types Utility
│   │   ├── rule.types.ts
│   │   └── validation.types.ts
│   ├── constants/
│   │   ├── state-selectors.ts
│   │   ├── regex-patterns.ts
│   │   └── defaults.ts
│   └── utils/
│       ├── logger.ts
│       └── validation-helpers.ts
│
└── config/                         # Configs par défaut
    ├── colors.config.json
    ├── utilities.config.json       # Remplace presets + qol
    ├── states.config.json
    └── files.config.json
```

## Changements Majeurs vs V1

### 1. Utilities Unifiées

**Avant (V1)** :
```
├── config/
│   ├── presets.config.json
│   └── qol.config.json
├── domain/models/
│   ├── Preset.ts
│   └── Qol.ts
```

**Après (V2)** :
```
├── config/
│   └── utilities.config.json      # Configuration unique
├── domain/models/
│   └── Utility.ts                 # Modèle unique
```

### 2. Détection Automatique du Contexte

Le contexte (color/variant/both/static) est **déduit automatiquement** de la `declaration` :

```typescript
// domain/models/Utility.ts

export class Utility {
  private readonly context: UtilityContext;

  constructor(
    public readonly prefix: string,
    public readonly declaration: string,
    public readonly variants?: VariantDefinition,
    public readonly defaultVariant?: string,
    public readonly exportVariants: boolean = false
  ) {
    // Détection automatique
    this.context = this.detectContext(declaration);
  }

  private detectContext(declaration: string): UtilityContext {
    const hasColor = declaration.includes('${color}');
    const hasVariant = declaration.includes('${variant}');

    if (hasColor && hasVariant) return 'both';
    if (hasColor) return 'color';
    if (hasVariant) return 'variant';
    return 'static';
  }
}
```

### 3. Parsing Simplifié

**Avant (V1)** : Logique séparée pour presets et qol

**Après (V2)** : Parser unique basé sur le contexte

```typescript
// core/extraction/class-parser.ts

export class ClassParser {
  parse(className: string): ParsedClass | null {
    const utility = this.findUtility(className);
    if (!utility) return null;

    // Routing basé sur le contexte détecté
    switch (utility.getContext()) {
      case 'color':
        return this.parseColorContext(utility, className);
      case 'variant':
        return this.parseVariantContext(utility, className);
      case 'both':
        return this.parseBothContext(utility, className);
      case 'static':
        return { utility };
    }
  }
}
```

## Configuration

### Structure Minimale

```typescript
// shared/types/utility.types.ts

export type VariantDefinition =
  | string[]                           // Simple: ["solid", "dashed"]
  | Record<string, string | number>;   // Mapping: { "bold": 700 }

export interface UtilityConfig {
  prefix: string;
  declaration: string;
  variants?: VariantDefinition;
  defaultVariant?: string;
  exportVariants?: boolean;
}
```

### Exemple de Configuration

```json
// config/utilities.config.json
[
  // Color only
  {
    "prefix": "bg",
    "declaration": "background: ${color}"
  },

  // Variant simple
  {
    "prefix": "border-style",
    "declaration": "border-style: ${variant}",
    "variants": ["solid", "dashed", "dotted"]
  },

  // Variant avec mapping + export
  {
    "prefix": "weight",
    "declaration": "font-weight: ${variant}",
    "export-variants": true,
    "variants": {
      "thin": 100,
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
      "thick": "4px"
    }
  },

  // Static
  {
    "prefix": "flex",
    "declaration": "display: flex"
  }
]
```

## Domain Layer

### Utility Model

```typescript
// domain/models/Utility.ts

export type UtilityContext = 'color' | 'variant' | 'both' | 'static';

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

  static create(config: UtilityConfig): Utility {
    // Validation
    if (!config.prefix) {
      throw new DomainError('Utility must have a prefix');
    }
    if (!config.declaration) {
      throw new DomainError('Utility must have a declaration');
    }

    return new Utility(
      config.prefix,
      config.declaration,
      config.variants,
      config.defaultVariant,
      config.exportVariants ?? false
    );
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

  requiresColor(): boolean {
    return this.context === 'color' || this.context === 'both';
  }

  requiresVariant(): boolean {
    return this.context === 'variant' || this.context === 'both';
  }

  isStandalone(): boolean {
    return !!this.defaultVariant;
  }

  getNormalizedVariants(): Record<string, string> | null {
    if (!this.variants) return null;

    if (Array.isArray(this.variants)) {
      return Object.fromEntries(this.variants.map(v => [v, v]));
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

    // Substitution color
    if (params.color && this.hasColor) {
      declaration = declaration.replace('${color}', `var(--${params.color})`);
    }

    // Substitution variant
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

### Utility Validator

```typescript
// domain/validators/utility.validator.ts

export class UtilityValidator implements Validator<UtilityConfig[]> {
  validate(utilities: UtilityConfig[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const prefixes = new Set<string>();

    for (const config of utilities) {
      try {
        // Créer l'utility pour validation
        Utility.create(config);

        // Vérifier unicité du prefix
        if (prefixes.has(config.prefix)) {
          errors.push({
            field: `utilities.${config.prefix}`,
            message: `Duplicate prefix "${config.prefix}"`,
            value: config
          });
        }
        prefixes.add(config.prefix);

        // Vérifier cohérence variants
        if (config.defaultVariant && !config.variants) {
          errors.push({
            field: `utilities.${config.prefix}`,
            message: 'default-variant requires variants',
            value: config
          });
        }

        // Vérifier cohérence export
        if (config.exportVariants && !config.declaration.includes('${variant}')) {
          errors.push({
            field: `utilities.${config.prefix}`,
            message: 'export-variants requires ${variant} placeholder',
            value: config
          });
        }

      } catch (error) {
        errors.push({
          field: `utilities.${config.prefix || 'unknown'}`,
          message: error.message,
          value: config
        });
      }
    }

    return errors;
  }
}
```

## Core Layer

### Config Service

```typescript
// core/config/index.ts

export class ConfigService {
  constructor(
    private loader: ConfigLoader,
    private merger: ConfigMerger,
    private validator: ConfigValidator
  ) {}

  initialize(): Config {
    const defaults = this.loader.loadDefaults();
    const user = this.loader.loadUserConfig();
    const merged = this.merger.merge(defaults, user);

    // Validation incluant utilities
    const validation = this.validator.validate(merged);

    if (!validation.valid) {
      this.logErrors(validation.errors);
      throw new ValidationError('Invalid configuration');
    }

    return merged as Config;
  }

  private logErrors(errors: ValidationError[]): void {
    log('❌ Configuration validation failed:');
    for (const error of errors) {
      log(`  - ${error.field}: ${error.message}`);
    }
  }
}
```

### Class Parser

```typescript
// core/extraction/class-parser.ts

export interface ParsedClass {
  utility: Utility;
  state?: string;
  color?: string;
  variant?: string;
}

export class ClassParser {
  constructor(
    private utilities: Utility[],
    private states: string[],
    private colors: Color[]
  ) {}

  parse(className: string): ParsedClass | null {
    // 1. Extraire état
    const { state, cleanClass } = this.extractState(className);

    // 2. Trouver utility
    const utility = this.findUtility(cleanClass);
    if (!utility) return null;

    // 3. Parser selon contexte
    const remaining = cleanClass.substring(utility.prefix.length + 1);

    switch (utility.getContext()) {
      case 'color':
        return this.parseColor(utility, state, remaining);

      case 'variant':
        return this.parseVariant(utility, state, remaining);

      case 'both':
        return this.parseBoth(utility, state, remaining);

      case 'static':
        return { utility, state };
    }
  }

  private extractState(className: string): {
    state?: string;
    cleanClass: string;
  } {
    const state = this.states.find(s => className.startsWith(`${s}:`));
    return {
      state,
      cleanClass: state ? className.substring(state.length + 1) : className,
    };
  }

  private findUtility(className: string): Utility | undefined {
    return this.utilities.find(u =>
      className === u.prefix || className.startsWith(`${u.prefix}-`)
    );
  }

  private parseColor(
    utility: Utility,
    state: string | undefined,
    remaining: string
  ): ParsedClass | null {
    const color = this.findColor(remaining);
    if (!color) return null;

    return { utility, state, color: color.name };
  }

  private parseVariant(
    utility: Utility,
    state: string | undefined,
    remaining: string
  ): ParsedClass | null {
    // Cas standalone sans variant spécifique
    if (!remaining && utility.isStandalone()) {
      return { utility, state };
    }

    // Vérifier que le variant existe
    const variants = utility.getNormalizedVariants();
    if (!variants?.[remaining]) return null;

    return { utility, state, variant: remaining };
  }

  private parseBoth(
    utility: Utility,
    state: string | undefined,
    remaining: string
  ): ParsedClass | null {
    // Format: "color-variant" (ex: "primary-thick")
    const parts = remaining.split('-');
    const variants = utility.getNormalizedVariants();

    // Essayer de matcher variant depuis la fin
    for (let i = parts.length - 1; i > 0; i--) {
      const possibleVariant = parts.slice(i).join('-');
      const possibleColor = parts.slice(0, i).join('-');

      if (variants?.[possibleVariant]) {
        const color = this.findColor(possibleColor);
        if (color) {
          return {
            utility,
            state,
            color: color.name,
            variant: possibleVariant,
          };
        }
      }
    }

    return null;
  }

  private findColor(name: string): Color | undefined {
    // Gérer opacité (primary-50)
    const opacityMatch = name.match(/^(.+)-(\d{2})$/);
    if (opacityMatch) {
      const [, baseName] = opacityMatch;
      return this.colors.find(c => c.name === baseName);
    }

    return this.colors.find(c => c.name === name);
  }
}
```

### Rule Generator

```typescript
// core/generation/rule-generator.ts

export class RuleGenerator {
  generate(parsedClasses: ParsedClass[]): CSSRule[] {
    return parsedClasses.map(parsed => this.generateRule(parsed));
  }

  private generateRule(parsed: ParsedClass): CSSRule {
    const { utility, state, color, variant } = parsed;

    // Générer selector
    const selector = this.buildSelector(parsed);

    // Générer declaration
    const declaration = utility.generateDeclaration({ color, variant });

    return new CSSRule(selector, declaration);
  }

  private buildSelector(parsed: ParsedClass): string {
    const { utility, state, color, variant } = parsed;

    let selector = utility.prefix;

    if (color) selector += `-${color}`;
    if (variant) selector += `-${variant}`;

    if (state) {
      const stateSelector = STATE_SELECTORS[state] || '';
      selector = `${state}\\:${selector}${stateSelector}`;
    }

    return selector;
  }
}
```

### Variant Generator

```typescript
// core/generation/variant-generator.ts

export class VariantGenerator {
  generate(utilities: Utility[]): Record<string, string> {
    const variants: Record<string, string> = {};

    for (const utility of utilities) {
      const exported = utility.getExportedVariants();
      if (exported) {
        Object.assign(variants, exported);
      }
    }

    return variants;
  }

  generateCSS(variants: Record<string, string>): string {
    const entries = Object.entries(variants)
      .map(([name, value]) => `  --${name}: ${value};`)
      .join('\n');

    return `:root {\n${entries}\n}`;
  }
}
```

## Migration

### Script de Migration

```typescript
// tools/migration/migrate-to-v2.ts

export function migrateToV2(oldConfig: {
  presets: PresetConfig[];
  qol: QolConfig[];
}): {
  utilities: UtilityConfig[];
} {
  const utilities: UtilityConfig[] = [];

  // Migrer presets
  for (const preset of oldConfig.presets) {
    const declaration = preset.declaration.replace(/\$\{value\}/g, '${variant}');

    utilities.push({
      prefix: preset.prefix,
      declaration,
      variants: preset.variations,
      exportVariants: preset['export-variations'],
    });
  }

  // Migrer qol
  for (const qol of oldConfig.qol) {
    const declaration = qol.declaration.replace(/\$\{value\}/g, '${variant}');

    utilities.push({
      prefix: qol.prefix,
      declaration,
      variants: qol.variations,
      defaultVariant: qol.standalone ? 'default' : undefined,
      exportVariants: qol['export-variations'],
    });
  }

  return { utilities };
}
```

## Avantages V2 vs V1

| Aspect | V1 | V2 |
|--------|----|----|
| **Configuration** | 2 fichiers (presets + qol) | 1 fichier (utilities) |
| **Modèles** | 2 classes (Preset + Qol) | 1 classe (Utility) |
| **Logique** | Séparée presets/qol | Unifiée par contexte |
| **Détection** | Manuelle (champs séparés) | Automatique (declaration) |
| **Maintenance** | Code dupliqué | Code mutualisé |
| **Extensibilité** | Ajouter nouveau type | Ajouter nouveau placeholder |

## Plan de Migration

### Phase 1: Foundation (2h)
1. Créer structure `shared/types/utility.types.ts`
2. Créer `domain/models/Utility.ts`
3. Créer `domain/validators/utility.validator.ts`
4. Tests unitaires

### Phase 2: Core (3h)
1. Implémenter `ClassParser` unifié
2. Implémenter `RuleGenerator`
3. Implémenter `VariantGenerator`
4. Tests intégration

### Phase 3: Migration Config (1h)
1. Créer script migration
2. Migrer `config/` vers `utilities.config.json`
3. Valider output identique

### Phase 4: Cleanup (1h)
1. Supprimer anciens models (Preset, Qol)
2. Supprimer anciens configs
3. Mettre à jour documentation

**Total: ~7h**

## Comparaison Fichiers

### Avant V2
```
src/
├── config/
│   ├── presets.config.json    ← 2 fichiers
│   └── qol.config.json        ←
├── domain/models/
│   ├── Preset.ts              ← 2 modèles
│   └── Qol.ts                 ←
└── core/extraction/
    ├── preset-parser.ts       ← Logique séparée
    └── qol-parser.ts          ←
```

### Après V2
```
src/
├── config/
│   └── utilities.config.json  ← 1 fichier
├── domain/models/
│   └── Utility.ts             ← 1 modèle
└── core/extraction/
    └── class-parser.ts        ← Logique unifiée
```

## Résumé

**Architecture V2** = Architecture V1 (DDD + Clean) + Utilities Unifiées

**Bénéfices** :
- ✅ Configuration plus simple
- ✅ Code plus maintenable
- ✅ Détection automatique du contexte
- ✅ Meilleure extensibilité
- ✅ Moins de duplication
