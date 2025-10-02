import { config } from '../config.tool';
import { log } from '../logger';

const mapClassesIntoRules = (classes: string[]) => {
    const usedColors = new Set<string>();
    const usedVariants = new Map<string, string>();
    const ruleInfos = classes
        ?.map(cssClass => mapClassIntoRule(cssClass))
        ?.filter(ruleInfo => ruleInfo !== null);

    // Collecter les couleurs et variants utilisés dans les règles générées
    ruleInfos.forEach(ruleInfo => {
        if (ruleInfo.color) {
            usedColors.add(ruleInfo.color);
        }
        if (ruleInfo.variant && ruleInfo.variant.shouldExport) {
            const variableName = `${ruleInfo.variant.prefix}-${ruleInfo.variant.variantName}`;
            usedVariants.set(variableName, ruleInfo.variant.variantValue);
        }
    });

    // Générer les règles CSS
    const rules = generateCssRules(ruleInfos);

    log(`${ruleInfos.length} rules generated`);

    return {
        rules,
        colorsFromRules: Array.from(usedColors),
        variantsFromRules: Object.fromEntries(usedVariants),
    };
};

const generateCssRules = (ruleInfos: RuleInfo[]): string => {
    return ruleInfos
        .map(ruleInfo => `.${ruleInfo.selector} { ${ruleInfo.declaration} }`)
        .join('\n');
};

interface RuleInfo {
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

const mapClassIntoRule = (stringClass: string): RuleInfo | null => {
    const params = getClassInfos(stringClass);

    /**
     * _ If no variations are found, maybe it's just a color like bg-primary
     * _ So we need to check if the color exists to avoid useless computing
     * */
    if (!params.preset) {
        const { colorExists } = getColorInfos(params.color);

        if (!colorExists) {
            return null;
        }
    }

    /**
     * _ If the current QoL isn't standalone and doesn't have a variation (can be called without variation)
     * _ then no
     */
    if (!params.color && !params.preset?.standalone && !params.variationName) {
        return null;
    }

    const ruleInfo = buildRuleInfo(params);
    return ruleInfo;
};

const getClassInfos = (stringClass: string) => {
    const { cleanedClass, state } = getStateInfos(stringClass);
    const { cleanedColor, prefix } = getPrefixInfos(cleanedClass);
    const { baseColor, preset, variation, variationName } = getPresetInfos({
        cleanedColor,
        prefix,
    });

    return {
        state,

        color: baseColor,
        prefix,

        preset,
        variation,
        variationName,
    };
};

const getStateInfos = (stringClass: string) => {
    let state = undefined;

    for (const configState of config.states) {
        if (!stringClass.startsWith(configState)) {
            continue;
        }

        state = configState;
    }

    const cleanedClass = !!state
        ? stringClass?.slice(state?.length + 1)
        : stringClass;
    return {
        cleanedClass,
        state,
    };
};

const getPrefixInfos = (
    stringClass: string
): { cleanedColor: string; prefix: string } => {
    const prefixes = [
        ...config.presets?.map(q => q.prefix),
        ...config.qol?.map(q => q.prefix),
    ];

    for (const prefix of prefixes) {
        if (!stringClass.startsWith(prefix)) {
            continue;
        }

        return {
            cleanedColor: stringClass?.slice(prefix.length + 1),
            prefix,
        };
    }

    console.log({ prefixes, stringClass });
    return { cleanedColor: stringClass, prefix: null };
};

const getPresetInfos = ({
    cleanedColor,
    prefix,
}: {
    cleanedColor: string;
    prefix?: string;
}) => {
    /**
     * _ Find preset variants matching the prefix from the config
     * _ Since a prefix can be in multiple presets and qol, filter every matching prefixes then flatten everything
     * TODO fix first default occurence getting picked when duplicate
     *  */
    const possiblePresets = [...config.presets, ...config.qol]
        ?.filter(p => p.prefix === prefix)
        ?.flat();
    if (!possiblePresets?.length) {
        return { matchingPreset: null, variation: null };
    }

    const { colorExists } = getColorInfos(cleanedColor);

    /**
     * Find the preset where the variations exists
     * If the color exists, it is a preset, so use the preset
     * */
    const matchingPreset =
        colorExists || !cleanedColor
            ? possiblePresets[0]
            : possiblePresets?.find(
                  ({ variations }) =>
                      !variations ||
                      Object.keys(variations)?.find(
                          v => cleanedColor === v || cleanedColor.endsWith(v)
                      )
              );

    if (!matchingPreset) {
        log(`No preset found for ${cleanedColor || prefix}`);

        return {
            matchingPreset,
            variation: null,
        };
    }

    if (!colorExists && !matchingPreset?.variations) {
        log(`Unknow stuff -> ${prefix} ${cleanedColor}}`);

        return {
            matchingPreset,
            variation: null,
        };
    }

    const possibleVariations = matchingPreset.variations || { default: '' };

    const defaultVariation = 'default';
    /** What is happening here:
     * xl variation can be matched when looking for 2xl, check for exact first
     * i don't remember why but we need the endsWith in some edge cases
     */
    const exactVariation = Object.keys(possibleVariations)?.find(
        v => cleanedColor === v
    );
    const closestVariation = Object.keys(possibleVariations)?.find(v =>
        cleanedColor.endsWith(v)
    );

    const matchingVariation = exactVariation || closestVariation;

    const variation = possibleVariations[matchingVariation || defaultVariation];
    const baseColor = matchingVariation
        ? cleanedColor?.slice(0, -matchingVariation?.length - 1)
        : cleanedColor;

    return {
        baseColor,
        preset: matchingPreset,
        variationName: matchingVariation,
        variation,
    };
};

const buildRuleInfo = ({
    state,
    prefix,
    color,
    preset,
    variation,
    variationName,
}): RuleInfo | null => {
    // _ Set state selector
    let stateSelector = '';
    switch (state) {
        case 'hover':
            stateSelector = ':hover';
            break;

        case 'not-hover':
            stateSelector = ':not(:hover)';
            break;
    }

    let selector = `${prefix}${color ? `-${color}` : ''}${
        variationName ? `-${variationName}` : ''
    }`;

    if (state) {
        selector = `${state}\\:${selector}${stateSelector}`;
    }

    // Vérifier que la couleur existe dans la config
    if (color && !config.colors?.[color]) {
        log(
            `Color '${color}' not found in colors config - skipping rule generation`
        );
        return null;
    }

    // Gérer les variants avec variables SCSS
    let variableToUse = variation;
    let variantInfo = undefined;

    // Vérifier si on doit exporter ce variant
    const shouldExport =
        preset?.['export-variations'] === true ||
        preset?.['export-variations'] === 'always';

    if (variationName && variationName !== 'default') {
        const variablePrefix = prefix;
        const variableName = `${variablePrefix}-${variationName}`;
        variableToUse = `$${variableName}`;
        variantInfo = {
            prefix,
            variantName: variationName,
            variantValue: variation,
            shouldExport,
        };
    } else if (variation && variationName === 'default') {
        // Pour les variants par défaut, on utilise juste le prefix
        const variableName = `${prefix}-default`;
        variableToUse = `$${variableName}`;
        variantInfo = {
            prefix,
            variantName: 'default',
            variantValue: variation,
            shouldExport,
        };
    }

    let declaration = preset.declaration
        ?.replace('${value}', variableToUse)
        ?.replace('${color}', color ? `$${color}` : '');

    if (!declaration.endsWith(';')) {
        declaration += ';';
    }

    if (!declaration.includes('!important')) {
        declaration = declaration?.replace(';', ' !important;');
    }

    return {
        selector,
        declaration,
        color: color || undefined,
        variant: variantInfo,
    };
};

/**
 * _ Check if a color includes opacity (ends with 2 digits)
 * * Opacity is included in the color name during mixin declaration
 * */
const getColorInfos = (color: string) => {
    const opacityDetectionRegex = new RegExp(/(?:(\w-?)+)-\d{2}$/, 'gm'); // Strings that end with two digits
    const isOpacity = opacityDetectionRegex.test(color);

    const baseColor = isOpacity ? color?.slice(0, -3) : color;
    const colorExists = Object.keys(config.colors)?.some(
        configColor => configColor === baseColor
    );

    return {
        colorExists,
        isOpacity,
        baseColor,
    };
};

export { mapClassesIntoRules, mapClassIntoRule };
