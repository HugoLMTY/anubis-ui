export interface IVariation {
    [key: string]: string;
}

export interface IPreset {
    // [key: string]: string
    prefix: string;
    declaration: string;

    /** When true, class can be called without variation, creating a rule with default variation */
    standalone?: boolean;

    /**
     * Controls how variations are exported as SCSS variables:
     * - true: export only variations that are used in the codebase
     * - "always": export all variations regardless of usage
     * - undefined/false: do not export variations
     */
    'export-variations'?: boolean | 'always';

    /** List of every possible variations */
    variations: IVariation;
}
