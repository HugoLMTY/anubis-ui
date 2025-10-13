import { getFiles } from '@tools/fileStuff/file.tools';
import { mapClassesIntoRules } from '@tools/mapping/mapClassIntoRule';
import { writeCssRuleFile } from '@tools/fileStuff/css.file';
import { config } from '@tools/config.tool';
import { mapColorsIntoMixinDeclaration } from '@tools/mapping/mapColorIntoDeclaration';

import fs from 'fs';
import {
    CLASS_COMMENT,
    COLOR_COMMENT,
    VARIANT_COMMENT,
} from '../output/css.output';

// Cache for regex compilation
let cachedRegex: RegExp | null = null;
let cachedConfigHash: string | null = null;

// Performance optimization: limit concurrent file reads to avoid overwhelming the system
const MAX_CONCURRENT_FILE_READS = 10;

/**
 * Execute promises with concurrency limit
 * @param items - Items to process
 * @param fn - Async function to execute for each item
 * @param limit - Maximum number of concurrent operations
 */
const pLimit = async <T, R>(
    items: T[],
    fn: (item: T) => Promise<R>,
    limit: number
): Promise<R[]> => {
    const results: R[] = [];
    let index = 0;

    const executeNext = async (): Promise<void> => {
        if (index >= items.length) return;

        const currentIndex = index++;
        const item = items[currentIndex];
        const result = await fn(item);
        results[currentIndex] = result;
    };

    const workers = Array(Math.min(limit, items.length))
        .fill(null)
        .map(async () => {
            while (index < items.length) {
                await executeNext();
            }
        });

    await Promise.all(workers);
    return results;
};

/** Fetch vue file based on config target patterns */
const init = async () => {
    const files = await getFiles(config.files);

    const uniqueClasses = await getUniqueClasses(files);
    const { rules, variantsFromRules } = mapClassesIntoRules(uniqueClasses);

    // Generate all colors from config (no filtering)
    const mappedColors = `${COLOR_COMMENT}\n${mapColorsIntoMixinDeclaration(
        config.colors
    )}`;

    // Get all variants that should be exported (export-variations: true)
    const allExportVariants = getAllExportVariants();

    // Merge used variants with all export variants (all export variants take priority)
    const finalVariants = { ...variantsFromRules, ...allExportVariants };

    // Generate CSS variables for variants
    const variantsCss = Object.entries(finalVariants)
        .map(([varName, varValue]) => `  --${varName}: ${varValue};`)
        .join('\n');

    const wrappedVariants = variantsCss
        ? `${VARIANT_COMMENT}\n:root {\n${variantsCss}\n}`
        : '';

    const wrappedRules = rules ? `${CLASS_COMMENT}\n${rules}` : '';

    const file = writeCssRuleFile(mappedColors, wrappedVariants, wrappedRules);
    return file;
};

/** Extract detected class and map into a flat set */
const getUniqueClasses = async (files: string[]): Promise<string[]> => {
    // Use concurrency limit to avoid overwhelming the system on large codebases
    const extractedClasses = (
        await pLimit(files, extractClasses, MAX_CONCURRENT_FILE_READS)
    ).flat();

    const classes = [...extractedClasses, ...config.force].sort();

    const uniqueClasses = Array.from(new Set(classes));
    return uniqueClasses;
};

/** Build regex pattern from config */
const buildClassDetectionRegex = (): RegExp => {
    const { states, qol, presets } = config;

    const partialPrefixes = presets?.map(p => `${p.prefix}-`);
    const partialQol = qol?.map(q =>
        q.standalone ? `${q.prefix}` : `${q.prefix}-`
    );

    const mappedPrefixes = [...partialPrefixes, ...partialQol]?.join('|');
    const mappedStates = `(${states?.map(s => `${s}:`)?.join('|')})`;

    return new RegExp(
        `${mappedStates}?(${mappedPrefixes})(-?(\\w+(-+)?)+)?`,
        'g'
    );
};

/** Get cached regex or build a new one if config changed */
const getClassDetectionRegex = (): RegExp => {
    const { states, qol, presets } = config;
    const configHash = JSON.stringify({ states, qol, presets });

    if (cachedRegex && cachedConfigHash === configHash) {
        return cachedRegex;
    }

    cachedRegex = buildClassDetectionRegex();
    cachedConfigHash = configHash;
    return cachedRegex;
};

/** Find matching classes from a given file based on config states and prefixes */
const extractClasses = async (filePath: string): Promise<string[]> => {
    const file = await fs.promises.readFile(filePath, 'utf-8');
    if (!file) {
        return [];
    }

    const classDetectionRegex = getClassDetectionRegex();
    const matches = file.match(classDetectionRegex) || [];
    return matches;
};

/** Get all variants from presets with export-variations: true */
const getAllExportVariants = (): Record<string, string> => {
    const allExportVariants: Record<string, string> = {};
    const allPresets = [...(config.qol || []), ...(config.presets || [])];

    for (const preset of allPresets) {
        if (preset['export-variations'] === true && preset.variations) {
            for (const [variantName, variantValue] of Object.entries(
                preset.variations
            )) {
                const variableName = `${preset.prefix}-${variantName}`;
                allExportVariants[variableName] = variantValue as string;
            }
        }
    }

    return allExportVariants;
};

export { init };
