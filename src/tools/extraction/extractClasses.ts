import { getFiles, outputFile, pLimit, writeFile } from '@tools/fileStuff/file.tools';
import { mapClassesIntoRules } from '@tools/mapping/mapClassIntoRule';
import { config } from '@tools/config.tool';
import { mapColorsIntoMixinDeclaration, mapColorsIntoTokens } from '@tools/mapping/mapColors';

import fs from 'fs';
import { getHeader, comments } from '../output/css.output';
import { log } from '../logger';

// Cache for regex compilation
let cachedRegex: RegExp | null = null;
let cachedConfigHash: string | null = null;

/** Fetch vue file based on config target patterns */
export const init = async () => {
		const files = await getFiles(config.files);

		const uniqueClasses = await getUniqueClasses(files);
		const { rules, variationsFromRules } = mapClassesIntoRules(uniqueClasses);

		const colors = `${comments.colors}\n${mapColorsIntoMixinDeclaration(config.colors)}`;

		const skipVariations = false
		const variations = skipVariations ? '' : handleVariations(variationsFromRules)
		const wrappedRules = rules ? `${comments.rules}\n${rules}` : '';

		const fileContent = `${getHeader()}\n${colors}\n\n${variations}\n\n${wrappedRules}`;
		const file = writeFile(outputFile, fileContent);
		return file;
};

/** Extract detected class and map into a flat set */
const getUniqueClasses = async (files: string[]): Promise<string[]> => {
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

	const extractedClasses = (await pLimit(files, extractClasses)).flat();

	const exportedClasses = getExportedClasses()

	const classes = [
		...extractedClasses,
		...exportedClasses,
		...config.force,
	].sort();

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

				/** If variation has default key and doesn't need color, can be used solo */
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
		const { states, utilities } = config;
		const configHash = JSON.stringify({ states, utilities });

		if (cachedRegex && cachedConfigHash === configHash) {
				return cachedRegex;
		}

		cachedRegex = buildClassDetectionRegex();
		cachedConfigHash = configHash;
		return cachedRegex;
};

/** Get all variations from utilities with export: "all" */
const getExportedClasses = (): string[] => {
		const possiblesClasses: string[] = [];

		const utilities = [...config.utilities];
		const colors = Object.keys(config.colors);

		for (const utility of utilities) {
				const exportValue = utility['export'];
				
				/** export every possible colors variations */
				if (exportValue === 'all') {
					possiblesClasses.push(
						...colors.map(color => `${utility.prefix}-${color}`)
					)
				}
		}

		return possiblesClasses;
};

/** Get all variations from utilities with export: "variations" */
export const getExportedVariations = (): Record<string, string> => {
		const exportAllVariations: Record<string, string> = {};
		const utilities = [...config.utilities];

		for (const utility of utilities) {
				const exportValue = utility['export'];
				// Pour "variations", exporter toutes les variations
				if (exportValue === 'variations' && utility.variations) {
						for (const [variantName, variantValue] of Object.entries(
								utility.variations
						)) {
								const variableName = `${utility.prefix}-${variantName}`;
								exportAllVariations[variableName] = variantValue as string;
						}
				}
		}

		return exportAllVariations;
};

export const handleVariations = (extractedVariations: Record<string, string>): string => {
	const exportedVariations = getExportedVariations();
		const variations = {
			...extractedVariations,
			...exportedVariations
		};

		// Generate CSS variables for variations
		const variationsCss = Object.entries(variations)
				.map(([varName, varValue]) => `	--${varName}: ${varValue};`)	
				.join('\n');

		const wrappedVariations = variationsCss
				? `${comments.variations}\n:root {\n${variationsCss}\n}`
				: '';

	return wrappedVariations
}