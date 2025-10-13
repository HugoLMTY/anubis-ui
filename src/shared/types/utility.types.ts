// shared/types/utility.types.ts

export type VariantDefinition =
  | string[]
  | Record<string, string | number>;

export interface UtilityConfig {
  prefix: string;
  declaration: string;
  variants?: VariantDefinition;
  'default-variant'?: string;
  'export-variants'?: boolean;
}

export type UtilityContext = 'color' | 'variant' | 'both' | 'static';
