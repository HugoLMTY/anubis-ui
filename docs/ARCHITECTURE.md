# Architecture Proposée - AnubisUI

## Vue d'ensemble

Architecture basée sur les principes DDD (Domain-Driven Design) léger avec séparation claire des responsabilités.

## Structure Proposée

```
src/
├── core/                       # Logique métier principale
│   ├── config/
│   │   ├── loader.ts          # Chargement de configuration
│   │   ├── merger.ts          # Fusion user + default config
│   │   └── validator.ts       # Orchestration validation
│   ├── extraction/
│   │   ├── class-extractor.ts # Extraction classes des fichiers
│   │   ├── regex-builder.ts   # Construction regex dynamique
│   │   └── class-parser.ts    # Parsing des classes
│   └── generation/
│       ├── rule-generator.ts  # Génération règles CSS
│       ├── color-generator.ts # Génération variables couleurs
│       └── variant-generator.ts # Génération variants
│
├── domain/                     # Modèle de domaine
│   ├── models/
│   │   ├── Color.ts           # Entité Color
│   │   ├── Preset.ts          # Entité Preset
│   │   ├── Rule.ts            # Value Object Rule
│   │   └── Config.ts          # Agrégat Config
│   └── validators/
│       ├── color.validator.ts
│       ├── preset.validator.ts
│       ├── qol.validator.ts
│       └── config.validator.ts
│
├── infrastructure/             # Couche infrastructure
│   ├── filesystem/
│   │   ├── file-reader.ts     # Lecture fichiers
│   │   ├── file-writer.ts     # Écriture fichiers
│   │   └── file-scanner.ts    # Scan glob patterns
│   ├── cache/
│   │   └── regex-cache.ts     # Cache pour regex
│   └── output/
│       ├── css-writer.ts      # Écriture CSS
│       └── scss-templates.ts  # Templates SCSS
│
├── shared/                     # Code partagé
│   ├── types/                  # Types TypeScript
│   │   ├── config.types.ts
│   │   ├── color.types.ts
│   │   ├── preset.types.ts
│   │   └── rule.types.ts
│   ├── constants/
│   │   ├── state-selectors.ts # Mapping états -> sélecteurs
│   │   └── defaults.ts        # Valeurs par défaut
│   └── utils/
│       ├── logger.ts
│       └── validation-helpers.ts
│
└── config/                     # Fichiers config par défaut
    ├── colors.config.json
    ├── presets.config.json
    ├── qol.config.json
    ├── states.config.json
    └── files.config.json
```

## Principes Architecturaux

### 1. **Séparation des Couches**

#### Core Layer (Logique Métier)
- Contient la logique métier principale
- Indépendant de l'infrastructure
- Testable sans dépendances externes

#### Domain Layer (Modèle de Domaine)
- Entités et Value Objects
- Règles métier pures
- Validations domaine

#### Infrastructure Layer
- I/O, filesystem, cache
- Détails d'implémentation
- Interchangeable

#### Shared Layer
- Code réutilisable
- Types et constantes
- Utilitaires

### 2. **Responsabilité Unique**

Chaque module a une responsabilité claire :

```typescript
// ❌ Avant - config.tool.ts fait tout
export const init = () => {
  readUserConfigFile()
  checkUserConfigFile()
  // ... load config
  // ... merge config
  // ... validate config
  return config
}

// ✅ Après - responsabilités séparées
// core/config/loader.ts
export const loadConfig = () => { ... }

// core/config/merger.ts
export const mergeConfigs = (user, defaults) => { ... }

// core/config/validator.ts
export const validateConfig = (config) => { ... }
```

### 3. **Dependency Injection**

```typescript
// Infrastructure injectée dans le core
export class ClassExtractor {
  constructor(
    private fileReader: FileReader,
    private regexBuilder: RegexBuilder
  ) {}

  async extract(patterns: string[]): Promise<string[]> {
    const files = await this.fileReader.scan(patterns)
    const regex = this.regexBuilder.build()
    // ...
  }
}
```

### 4. **Domain Models**

```typescript
// domain/models/Color.ts
export class Color {
  private constructor(
    public readonly name: string,
    public readonly light?: string,
    public readonly dark?: string
  ) {}

  static create(name: string, light?: string, dark?: string): Color {
    // Validation dans le constructeur
    if (!light && !dark) {
      throw new DomainError('Color must have at least one theme')
    }
    return new Color(name, light, dark)
  }

  hasOpacity(): boolean {
    return /\-\d{2}$/.test(this.name)
  }

  getBaseColor(): string {
    return this.hasOpacity()
      ? this.name.slice(0, -3)
      : this.name
  }
}
```

### 5. **Validation Strategy Pattern**

```typescript
// domain/validators/config.validator.ts
export class ConfigValidator {
  private validators: Validator[] = [
    new ColorValidator(),
    new PresetValidator(),
    new QolValidator(),
  ]

  validate(config: Config): ValidationResult {
    const errors = this.validators
      .flatMap(v => v.validate(config))

    return errors.length > 0
      ? { valid: false, errors }
      : { valid: true }
  }
}
```

## Migration Progressive

### Phase 1: Restructuration des types
1. Créer `shared/types/` avec tous les types
2. Migrer les interfaces existantes
3. Ajouter types manquants

### Phase 2: Domain Layer
1. Créer entités `Color`, `Preset`, `Rule`
2. Implémenter validations dans le domaine
3. Migrer validations existantes

### Phase 3: Core Layer
1. Extraire logique de `tools/` vers `core/`
2. Séparer responsabilités (load/merge/validate)
3. Implémenter DI basique

### Phase 4: Infrastructure
1. Isoler I/O dans `infrastructure/`
2. Créer abstractions (interfaces)
3. Rendre infrastructure interchangeable

### Phase 5: Tests et Optimisation
1. Ajouter tests unitaires (domain)
2. Ajouter tests intégration (core)
3. Optimiser performance

## Avantages de la Nouvelle Architecture

### 1. **Testabilité**
```typescript
// Facile à tester avec mocks
const extractor = new ClassExtractor(
  mockFileReader,
  mockRegexBuilder
)
```

### 2. **Maintenabilité**
- Responsabilités claires
- Modules découplés
- Facile à comprendre

### 3. **Extensibilité**
```typescript
// Ajouter nouveau validator
validators.push(new FilesValidator())

// Ajouter nouveau générateur
generators.push(new AnimationGenerator())
```

### 4. **Réutilisabilité**
- Domain models réutilisables
- Validations composables
- Infrastructure interchangeable

## Patterns Utilisés

1. **Repository Pattern** - Accès données config
2. **Strategy Pattern** - Validation extensible
3. **Factory Pattern** - Création entités
4. **Dependency Injection** - Découplage
5. **Value Object** - Immutabilité
6. **Aggregate** - Cohérence config

## Exemple Complet: Feature Validation

### Structure Actuelle
```typescript
// src/tools/validation/color.validation.ts
export const validateColors = (colors: IColor): void => {
  // Validation inline
}
```

### Structure Proposée
```typescript
// domain/models/Color.ts
export class Color {
  static create(...) { /* validation */ }
}

// domain/validators/color.validator.ts
export class ColorValidator implements Validator {
  validate(config: Config): ValidationError[] {
    return config.colors.flatMap(color =>
      this.validateColor(color)
    )
  }
}

// core/config/validator.ts
export class ConfigValidator {
  validate(config: Config) {
    const validator = new ConfigValidator([
      new ColorValidator(),
      new PresetValidator(),
    ])
    return validator.validate(config)
  }
}
```

## Règles de Développement

1. **Domain ne dépend de rien** - Pur TypeScript
2. **Core dépend de Domain** - Logique métier
3. **Infrastructure dépend de Core** - Implémentation
4. **Shared accessible par tous** - Utilitaires

## Prochaines Étapes

1. Valider l'architecture avec l'équipe
2. Créer un prototype pour une feature
3. Migrer progressivement
4. Documenter patterns et bonnes pratiques
