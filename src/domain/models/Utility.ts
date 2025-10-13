// domain/models/Utility.ts

import { UtilityConfig, UtilityContext, VariantDefinition } from '@shared/types/utility.types';

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

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

  /**
   * Factory method to create a Utility with validation
   */
  static create(config: UtilityConfig): Utility {
    // Validate prefix
    if (!config.prefix || config.prefix.trim() === '') {
      throw new DomainError('Utility prefix cannot be empty');
    }

    // Validate declaration
    if (!config.declaration || config.declaration.trim() === '') {
      throw new DomainError(`Utility "${config.prefix}": declaration cannot be empty`);
    }

    // Check for placeholders
    const hasColor = config.declaration.includes('${color}');
    const hasVariant = config.declaration.includes('${variant}');

    // Validate variants requirement
    if (hasVariant && !config.variants) {
      throw new DomainError(
        `Utility "${config.prefix}": declaration uses \${variant} but no variants are defined`
      );
    }

    // Validate default variant
    if (config['default-variant']) {
      if (!config.variants) {
        throw new DomainError(
          `Utility "${config.prefix}": default-variant specified but no variants defined`
        );
      }

      const normalizedVariants = Array.isArray(config.variants)
        ? config.variants
        : Object.keys(config.variants);

      if (!normalizedVariants.includes(config['default-variant'])) {
        throw new DomainError(
          `Utility "${config.prefix}": default-variant "${config['default-variant']}" not found in variants`
        );
      }
    }

    return new Utility(
      config.prefix,
      config.declaration,
      config.variants,
      config['default-variant'],
      config['export-variants'] ?? false
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

  isStandalone(): boolean {
    return !!this.defaultVariant;
  }

  requiresColor(): boolean {
    return this.hasColor;
  }

  requiresVariant(): boolean {
    return this.hasVariant && !this.isStandalone();
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

    // Replace ${color}
    if (params.color && this.hasColor) {
      declaration = declaration.replace(/\$\{color\}/g, `var(--${params.color})`);
    }

    // Replace ${variant}
    if (this.hasVariant) {
      const variantName = params.variant || (this.isStandalone() ? this.defaultVariant : null);

      if (variantName) {
        const variants = this.getNormalizedVariants();
        const value = variants?.[variantName];

        if (value) {
          const replacement = this.exportVariants
            ? `var(--${this.prefix}-${variantName})`
            : value;

          declaration = declaration.replace(/\$\{variant\}/g, replacement);
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

  toConfig(): UtilityConfig {
    return {
      prefix: this.prefix,
      declaration: this.declaration,
      ...(this.variants && { variants: this.variants }),
      ...(this.defaultVariant && { 'default-variant': this.defaultVariant }),
      ...(this.exportVariants && { 'export-variants': this.exportVariants }),
    };
  }
}
