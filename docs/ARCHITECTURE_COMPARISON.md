# Comparaison des Architectures

## 📐 Architecture Actuelle vs Proposée

### Architecture Actuelle

```
┌─────────────────────────────────────────┐
│           Vite Plugin (index.js)        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      tools/config.tool.ts (God Object)  │
│  • Load config                          │
│  • Merge config                         │
│  • Validate config                      │
│  • Manage state                         │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐  ┌──────────────────┐
│ tools/       │  │ tools/           │
│ extraction/  │  │ mapping/         │
│              │  │                  │
│ • Extract    │  │ • Map classes    │
│   classes    │  │ • Generate rules │
└──────┬───────┘  └────────┬─────────┘
       │                   │
       ▼                   ▼
┌──────────────────────────────────┐
│   tools/fileStuff/ (I/O mixed)   │
│   • Read files                   │
│   • Write CSS                    │
│   • Scan files                   │
└──────────────────────────────────┘
```

**Problèmes** :
- ❌ Responsabilités mélangées
- ❌ Difficile à tester (God Object)
- ❌ Couplage fort entre modules
- ❌ I/O mélangé avec logique métier
- ❌ Pas de validation structurée

---

### Architecture Proposée

```
┌─────────────────────────────────────────────────┐
│              Vite Plugin (index.js)             │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│           Application Layer (Facade)             │
│                                                  │
│  • ConfigService.initialize()                    │
│  • ClassExtractor.extract()                      │
│  • CSSGenerator.generate()                       │
└────────────────────┬─────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌─────────────────┐    ┌──────────────────────┐
│   CORE LAYER    │    │    DOMAIN LAYER      │
│                 │    │                      │
│ • Config        │    │ • Models             │
│   - Loader      │    │   - Color            │
│   - Merger      │    │   - Preset           │
│   - Validator   │    │   - Rule             │
│                 │    │                      │
│ • Extraction    │    │ • Validators         │
│   - Extractor   │    │   - ColorValidator   │
│   - RegexBuild  │    │   - PresetValidator  │
│   - Parser      │    │   - ConfigValidator  │
│                 │    │                      │
│ • Generation    │    │ • Value Objects      │
│   - RuleGen     │    │   - CSSRule          │
│   - ColorGen    │    │   - Variant          │
│   - VariantGen  │    └──────────────────────┘
└─────────┬───────┘
          │
          ▼
┌────────────────────────────────────────┐
│      INFRASTRUCTURE LAYER              │
│                                        │
│  • Filesystem                          │
│    - FileReader                        │
│    - FileWriter                        │
│    - FileScanner                       │
│                                        │
│  • Cache                               │
│    - RegexCache                        │
│                                        │
│  • Output                              │
│    - CSSWriter                         │
│    - SCSSTemplates                     │
└────────────────────────────────────────┘
         ▲
         │
         └──────────────────────┐
                                │
                    ┌───────────▼──────────┐
                    │    SHARED LAYER      │
                    │                      │
                    │  • Types             │
                    │  • Constants         │
                    │  • Utils             │
                    └──────────────────────┘
```

**Avantages** :
- ✅ Séparation claire des responsabilités
- ✅ Testabilité maximale (DI)
- ✅ Couplage faible entre couches
- ✅ Infrastructure interchangeable
- ✅ Validation structurée et extensible

---

## 📊 Comparaison Détaillée

### 1. Configuration

#### Avant
```typescript
// UN SEUL FICHIER fait tout
// tools/config.tool.ts (~60 lignes)

const init = () => {
  readUserConfigFile()           // I/O
  checkUserConfigFile()           // Validation

  for (const file of configFiles) {
    // Load...
    // Merge...
  }

  validateColors(config.colors)   // Inline validation

  return config                   // État global mutable
}
```

#### Après
```typescript
// RESPONSABILITÉS SÉPARÉES

// core/config/loader.ts
class ConfigLoader {
  loadDefaults(): Config { ... }
  loadUserConfig(): UserConfig | null { ... }
}

// core/config/merger.ts
class ConfigMerger {
  merge(defaults: Config, user: UserConfig): Config { ... }
}

// core/config/validator.ts
class ConfigValidator {
  validate(config: Config): ValidationResult { ... }
}

// Orchestration via Service
class ConfigService {
  initialize(): Config {
    const defaults = this.loader.loadDefaults()
    const user = this.loader.loadUserConfig()
    const merged = this.merger.merge(defaults, user)
    const result = this.validator.validate(merged)

    if (!result.valid) throw new ValidationError(result.errors)

    return merged
  }
}
```

### 2. Validation

#### Avant
```typescript
// tools/validation/color.validation.ts
// Validation procédurale

const validateColors = (colors: IColor): void => {
  const errors: string[] = []

  Object.entries(colors).forEach(([name, config]) => {
    // Validation inline...
    if (!light && !dark) {
      errors.push(`Color "${name}"...`)
    }
  })

  if (errors.length > 0) {
    log(errorMessage)
    throw new Error('Invalid color configuration')
  }
}
```

#### Après
```typescript
// domain/models/Color.ts
// Validation dans le domain model

class Color {
  static create(name: string, light?: string, dark?: string): Color {
    if (!light && !dark) {
      throw new DomainError(`Color "${name}" must have at least one theme`)
    }

    if (light && !Color.isValidValue(light)) {
      throw new DomainError(`Invalid light color: ${light}`)
    }

    return new Color(name, light, dark)
  }
}

// domain/validators/color.validator.ts
// Validator composable et réutilisable

class ColorValidator implements Validator<ColorsConfig> {
  validate(colors: ColorsConfig): ValidationError[] {
    return Object.entries(colors).flatMap(([name, def]) => {
      try {
        Color.create(name, def.light, def.dark)
        return []
      } catch (error) {
        return [{
          field: `colors.${name}`,
          message: error.message,
          value: def
        }]
      }
    })
  }
}
```

### 3. Extraction de Classes

#### Avant
```typescript
// tools/extraction/extractClasses.ts
// Tout dans un seul fichier (~190 lignes)

const init = async () => {
  const files = await getFiles(config.files)      // I/O
  const uniqueClasses = await getUniqueClasses()  // Extraction
  const { rules } = mapClassesIntoRules()         // Mapping
  const mappedColors = mapColorsIntoMixin()       // Generation
  writeCssRuleFile(...)                           // I/O
  return file
}
```

#### Après
```typescript
// core/extraction/class-extractor.ts
class ClassExtractor {
  constructor(
    private fileScanner: FileScanner,      // DI
    private regexBuilder: RegexBuilder     // DI
  ) {}

  async extract(config: Config): Promise<string[]> {
    const files = await this.fileScanner.scan(config.files)
    const regex = this.regexBuilder.build(config)

    // Extraction logic only
    return this.extractClasses(files, regex)
  }
}

// core/generation/rule-generator.ts
class RuleGenerator {
  generate(classes: string[], config: Config): CSSRule[] {
    // Generation logic only
  }
}

// infrastructure/output/css-writer.ts
class CSSWriter {
  async write(path: string, rules: CSSRule[]): Promise<void> {
    // I/O only
  }
}
```

### 4. Testabilité

#### Avant
```typescript
// Difficile à tester (dépendances cachées)

describe('config.tool', () => {
  it('should init config', () => {
    // Doit mocker fs, path, globals...
    // Effets de bord...
    const config = init()  // ❌ Lit vraiment les fichiers
  })
})
```

#### Après
```typescript
// Facile à tester (DI + interfaces)

describe('ConfigLoader', () => {
  it('should load defaults', () => {
    const mockFs = {
      readFileSync: vi.fn().mockReturnValue('{"colors":{}}')
    }

    const loader = new ConfigLoader('/config', undefined, mockFs)
    const config = loader.loadDefaults()  // ✅ Isolé

    expect(config).toBeDefined()
  })
})

describe('Color', () => {
  it('should create valid color', () => {
    const color = Color.create('primary', '#fff', '#000')  // ✅ Pure
    expect(color.hasLight()).toBe(true)
  })
})
```

## 🎯 Résumé des Améliorations

| Critère | Avant | Après |
|---------|-------|-------|
| **Responsabilités** | Mélangées | Séparées (SRP) |
| **Testabilité** | Difficile | Facile (DI) |
| **Couplage** | Fort | Faible |
| **Extensibilité** | Limitée | Excellente |
| **Maintenabilité** | Moyenne | Élevée |
| **Complexité** | Élevée (God Object) | Réduite (modules simples) |
| **Documentation** | Implicite | Explicite (types/interfaces) |
| **Performance** | OK | Optimisable (cache, lazy) |

## 🚀 Prochaines Étapes Recommandées

1. **Quick Win** : Commencer par migrer les types vers `shared/types/`
2. **Domain Models** : Créer `Color` et `Preset` models avec validation
3. **Tests** : Ajouter tests unitaires pour le domain
4. **Refactoring** : Migrer progressivement `core/config/`
5. **Infrastructure** : Isoler I/O dans `infrastructure/`

## 💡 Conseils d'Implémentation

1. **Pas de big bang** - Migrer module par module
2. **Garder compatibilité** - Maintenir l'API publique
3. **Tests first** - Écrire tests avant migration
4. **Documentation** - Documenter au fur et à mesure
5. **Review** - Code review systématique

---

> **Note** : Cette architecture est inspirée de DDD (Domain-Driven Design) et Clean Architecture, adaptée à la taille et aux besoins du projet AnubisUI.
