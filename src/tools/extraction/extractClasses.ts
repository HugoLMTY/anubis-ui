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
import { log } from '../logger';

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
		// console.log({ config })
		const files = await getFiles(config.files);

		const uniqueClasses = await getUniqueClasses(files);
		const { rules, variationsFromRules } = mapClassesIntoRules(uniqueClasses);

		// Generate all colors from config (no filtering)
		const mappedColors = `${COLOR_COMMENT}\n${mapColorsIntoMixinDeclaration(
				config.colors
		)}`;

		// Get all variations that should be exported (export-variations: true)
		const allExportVariations = getAllExportVariations();

		// Merge used variations with all export variations (all export variations take priority)
		const finalVariations = { ...variationsFromRules, ...allExportVariations };

		// Generate CSS variables for variations
		const variationsCss = Object.entries(finalVariations)
				.map(([varName, varValue]) => `  --${varName}: ${varValue};`)
				.join('\n');

		const wrappedVariations = variationsCss
				? `${VARIANT_COMMENT}\n:root {\n${variationsCss}\n}`
				: '';

		const wrappedRules = rules ? `${CLASS_COMMENT}\n${rules}` : '';

		const file = writeCssRuleFile(mappedColors, wrappedVariations, wrappedRules);
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
		const { states, utilities } = config;

		const partialUtilities = utilities?.map(u => {
				const { prefix, variations: variationEntries, declaration } = u

				if (!prefix && !variationEntries) {
					log(`Something doesn't look good -> ${u}`)
				}
				const variations = Array.isArray(variationEntries) ? variationEntries : Object.keys(variationEntries || {})
				const hasVariations = !!variations?.length
				const hasDefaultVariation = hasVariations && variations.includes('default')
				const needColor = declaration.includes('${color}')

				/** If variation has default key, it's considered as a standalone - can be used solo */
				if (hasVariations && hasDefaultVariation && !needColor) {
					return `${prefix}`
				}

				return `${prefix}-`
		})

		const mappedUtilities = [...partialUtilities]?.join('|')
		const mappedStates = `(${states?.map(s => `${s}:`)?.join('|')})`;

		const regexp = new RegExp(
				`${mappedStates}?(${mappedUtilities})(-?(\\w+(-+)?)+)?`,
				'g'
		);

		return regexp
};

/** Get cached regex or build a new one if config changed */
const getClassDetectionRegex = (): RegExp => {
		const { states, qol, utilitys } = config;
		const configHash = JSON.stringify({ states, qol, utilitys });

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

/** Get all variations from utilitys with export-variations: true */
const getAllExportVariations = (): Record<string, string> => {
		const allExportVariations: Record<string, string> = {};
		const allUtilities = [...config.utilities];

		for (const utility of allUtilities) {
				if (utility['export-variations'] === true && utility.variations) {
						for (const [variantName, variantValue] of Object.entries(
								utility.variations
						)) {
								const variableName = `${utility.prefix}-${variantName}`;
								allExportVariations[variableName] = variantValue as string;
						}
				}
		}

		return allExportVariations;
};

export { init };
