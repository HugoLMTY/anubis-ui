export interface IVariation {
    [key: string]: string;
}

export interface IUtility {
    // [key: string]: string
    prefix: string;
    declaration: string;

    /** When true, class can be called without variation, creating a rule with default variation */
    standalone?: boolean;

    /**
     * Controls how variations are exported as SCSS variables:
     * - "variation": export every variations
     * - "all": export every possible color class (utility prefix + every colors)
     * - undefined: do not export variations
     */
    export?: 'variations' | 'all';

    /** Override default global variables with the "default" variation if existing */
    overrides?: string[]

    /** List of every possible variations */
    variations: IVariation;
}

export interface IRuleInfo {
    selector: string;
    declaration: string;
    color?: string;
    variant?: {
        prefix: string;
        variantName: string;
        variantValue: string;
        shouldExport: boolean;
    };
}
