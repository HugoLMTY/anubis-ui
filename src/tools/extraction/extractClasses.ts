import { getFiles } from '../fileStuff/file.tools';
import { mapClassesIntoRules } from '../mapping/mapClassIntoRule';
import { writeCssRuleFile } from '../fileStuff/css.file';
import { config } from '../config.tool';
import { mapColorsIntoMixinDeclaration } from '../mapping/mapColorIntoDeclaration';

import fs from 'fs';

/** Fetch vue file based on config target patterns */
const init = async () => {
    const files = await getFiles(config.files);

    const mappedColors = mapColorsIntoMixinDeclaration(config.colors);

    const uniqueClasses = await getUniqueClasses(files);
    const { rules, colorsFromRules, variantsFromRules } =
        mapClassesIntoRules(uniqueClasses);

    const file = writeCssRuleFile(mappedColors, mappedRules);
    return file;
};

/** Extract detected class and map into a flat set */
const getUniqueClasses = async (files: string[]): Promise<string[]> => {
    const extractedClasses = (
        await Promise.all(files.map(async file => extractClasses(file)))
    )?.flat();

    const classes = [...extractedClasses, ...config.force]?.sort();

    const uniqueClasses = Array.from(new Set(classes));
    return uniqueClasses;
};

/** Extract SCSS variables used in the code */
const getUsedVariables = async (
    files: string[]
): Promise<{ colors: string[]; variants: Record<string, string> }> => {
    const extractedVariables = (
        await Promise.all(files.map(async file => extractVariables(file)))
    )?.flat();

    const usedColors = new Set<string>();
    const usedVariants = new Map<string, string>();

    extractedVariables.forEach(varName => {
        // Vérifier si c'est une couleur
        if (config.colors && config.colors[varName]) {
            usedColors.add(varName);
        } else {
            // Chercher dans les presets pour les variants
            const variantInfo = findVariantInConfig(varName);
            if (variantInfo) {
                usedVariants.set(varName, variantInfo);
            }
        }
    });

    return {
        colors: Array.from(usedColors),
        variants: Object.fromEntries(usedVariants),
    };
};

/** Find matching classes from a given file based on config states and prefixes */
const extractClasses = async (filePath: string): Promise<string[]> => {
    const file = await fs.promises.readFile(filePath, 'utf-8');
    if (!file) {
        return [];
    }

    const { states, qol, presets } = config;

    const partialPrefixes = presets?.map(p => `${p.prefix}-`);
    const partialQol = qol?.map(q =>
        q.standalone ? `${q.prefix}` : `${q.prefix}-`
    );

    const mappedPrefixes = [...partialPrefixes, ...partialQol]?.join('|');
    const mappedStates = `(${states?.map(s => `${s}:`)?.join('|')})`;

    const classDetectionRegex = new RegExp(
        `${mappedStates}?(${mappedPrefixes})(-?(\\w+(-+)?)+)?`,
        'g'
    );

    const matches = file.match(classDetectionRegex) || [];
    return matches;
};

/** Extract SCSS variables from a given file */
const extractVariables = async (filePath: string): Promise<string[]> => {
    const file = await fs.promises.readFile(filePath, 'utf-8');
    if (!file) {
        return [];
    }

    // Regex pour détecter les variables SCSS : $variable-name
    const variableDetectionRegex = /\$([a-zA-Z][a-zA-Z0-9-]*)/g;
    const matches = file.match(variableDetectionRegex) || [];

    // Enlever le $ et retourner les noms des variables
    return matches.map(match => match.substring(1));
};

/** Find variant value in config by variable name */
const findVariantInConfig = (varName: string): string | null => {
    // Chercher dans les presets QoL et presets
    const allPresets = [...(config.qol || []), ...(config.presets || [])];

    for (const preset of allPresets) {
        // Vérifier si ce preset exporte ses variations
        const exportVariations = preset['export-variations'];
        if (!exportVariations) {
            continue;
        }

        if (preset.variations) {
            for (const [variantName, variantValue] of Object.entries(
                preset.variations
            )) {
                const expectedVarName = `${preset.prefix}-${variantName}`;
                if (expectedVarName === varName) {
                    return variantValue as string;
                }
            }
        }
    }

    return null;
};

/** Get all variants from presets with export-variations: "always" */
const getAlwaysExportVariants = (): Record<string, string> => {
    const alwaysExportVariants: Record<string, string> = {};
    const allPresets = [...(config.qol || []), ...(config.presets || [])];

    for (const preset of allPresets) {
        if (preset['export-variations'] === 'always' && preset.variations) {
            for (const [variantName, variantValue] of Object.entries(
                preset.variations
            )) {
                const variableName = `${preset.prefix}-${variantName}`;
                alwaysExportVariants[variableName] = variantValue as string;
            }
        }
    }

    return alwaysExportVariants;
};

export { init };
