import { IRuleInfo } from '@/interfaces/preset.interface';
import { config } from '@tools/config.tool';
import { log } from '@tools/logger';

const mapClassesIntoRules = (classes: string[]) => {
	const usedVariations = new Map<string, string>();
	const ruleInfos = classes
		.map(cssClass => mapClassIntoRule(cssClass))
		.filter(ruleInfo => ruleInfo !== null);

	// Collecter les variations utilisés dans les règles générées
	ruleInfos.forEach(ruleInfo => {
		if (ruleInfo.variant && ruleInfo.variant.shouldExport) {
			const variableName = `${ruleInfo.variant.prefix}-${ruleInfo.variant.variantName}`;
			usedVariations.set(variableName, ruleInfo.variant.variantValue);
		}
	});

	// Générer les règles CSS
	const rules = generateCssRules(ruleInfos);

	log(`${ruleInfos.length} rules generated`);

	return {
		rules,
		variationsFromRules: Object.fromEntries(usedVariations),
	};
};

const generateCssRules = (ruleInfos: IRuleInfo[]): string => {
	return ruleInfos
		.map(ruleInfo => `.${ruleInfo.selector} { ${ruleInfo.declaration} }`)
		.join('\n');
};

const mapClassIntoRule = (stringClass: string): IRuleInfo | null => {
	const params = getClassInfos(stringClass);

	/**
	 * _ If no variations are found, maybe it's just a color like bg-primary
	 * _ So we need to check if the color exists to avoid useless computing
	 * */
	if (!params.utility) {
		const { colorExists } = getColorInfos(params.color);

		if (!colorExists) {
			return null;
		}
	}

	/**
	 * _ If the current QoL isn't standalone and doesn't have a variation (can be called without variation)
	 * _ then no
	 */
	if (!params.color && !Object.keys(params.utility?.variations || []).includes('default') && !params.variationName) {
		return null;
	}

	const ruleInfo = buildRuleInfo(params);
	return ruleInfo;
};

const getClassInfos = (stringClass: string) => {
	const { cleanedClass, state } = getStateInfos(stringClass);
	const { cleanedColor, prefix } = getPrefixInfos(cleanedClass);
	const { color, baseColor, utility, variation, variationName } = getUtilityInfos({
		cleanedColor,
		prefix,
	});

	return {
		state,

		color,
		baseColor,
		prefix,

		utility,
		variation,
		variationName,
	};
};

const getStateInfos = (stringClass: string) => {
	const state = config.states.find(configState =>
		stringClass.startsWith(configState)
	);

	const cleanedClass = state
		? stringClass.slice(state.length + 1)
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
		...config.utilities.map(u => u.prefix)
	];

	for (const prefix of prefixes) {
		if (!stringClass.startsWith(prefix)) {
			continue;
		}

		return {
			cleanedColor: stringClass.slice(prefix.length + 1),
			prefix,
		};
	}

	log(`No matching prefix found for class: ${stringClass}`);
	return { cleanedColor: stringClass, prefix: null };
};

const getUtilityInfos = ({
	cleanedColor,
	prefix,
}: {
	cleanedColor: string;
	prefix?: string;
}) => {
	/**
	 * Find utility variations matching the prefix from the config
	 * Since a prefix can be in multiple utilitys and qol, filter every matching prefixes
	 * TODO fix first default occurence getting picked when duplicate
	 */
	const possibleUtility = [...config.utilities].filter(
		p => p.prefix === prefix
	);

	if (!possibleUtility.length) {
		return { matchingUtility: null, variation: null };
	}

	const { colorExists } = getColorInfos(cleanedColor);

	/**
	 * Find the utility where the variations exist
	 * Logic:
	 * 1. If we have a valid color or no color specified, use the first utility
	 * 2. Otherwise, find a utility with a matching variation
	 */
	let matchingUtility;

	if (colorExists || !cleanedColor) {
		// Valid color exists or no color specified - use first utility
		matchingUtility = possibleUtility[0];
	} else {
		// Find utility with matching variation
		matchingUtility = possibleUtility.find(({ variations }) => {
			if (!variations) return true;

			const mappedVariations = Array.isArray(variations) ? variations : Object.keys(variations)

			return mappedVariations.some(
				v => cleanedColor === v || cleanedColor.endsWith(v)
			);
		});
	}

	if (!matchingUtility) {
		log(`No utility found for ${cleanedColor || prefix}`);

		return {
			matchingUtility,
			variation: null,
		};
	}

	if (!colorExists && !matchingUtility.variations) {
		log(`Unknow stuff -> ${[prefix, cleanedColor].join('-')}`);

		return {
			matchingUtility,
			variation: null,
		};
	}

	const possibleVariations = matchingUtility.variations || { default: '' };

	const defaultVariation = 'default';
	/**
	 * Variation matching logic:
	 * 1. Check for exact match first (prevents "xl" matching when looking for "2xl")
	 * 2. Fall back to endsWith for edge cases where variation is a suffix
	 */
	const exactVariation = Object.keys(possibleVariations).find(
		v => cleanedColor === v
	);
	const closestVariation = Object.keys(possibleVariations).find(v =>
		cleanedColor.endsWith(v)
	);

	const matchingVariation = exactVariation || closestVariation;

	const variation = possibleVariations[matchingVariation || defaultVariation];
	const color = matchingVariation
		? cleanedColor.slice(0, -matchingVariation.length - 1)
		: cleanedColor;

	const { baseColor } = getColorInfos(color)

	return {
		color,
		baseColor,
		utility: matchingUtility,
		variationName: matchingVariation,
		variation,
	};
};

// Map state names to CSS pseudo-selectors
const stateSelectors: Record<string, string> = {
	hover: ':hover',
	'not-hover': ':not(:hover)',
};

const buildRuleInfo = ({
	state,
	prefix,
	color,
	baseColor,
	utility,
	variation,
	variationName,
}): IRuleInfo | null => {
	// Get state selector from mapping
	const stateSelector = state ? stateSelectors[state] || '' : '';

	let selector = `${prefix}${color ? `-${color}` : ''}${
		variationName ? `-${variationName}` : ''
	}`;

	if (state) {
		selector = `${state}\\:${selector}${stateSelector}`;
	}

	// Vérifier que la couleur existe dans la config
	if (baseColor && !config.colors[baseColor]) {
		log(
			`Color '${baseColor}' not found in colors config - skipping rule generation`
		);
		return null;
	}

	// Gérer les variations avec variables CSS ou valeurs directes
	let variableToUse = variation;
	let variantInfo = undefined;

	// Vérifier si on doit exporter les variations en tant que variables CSS
	const exportVariations = utility['export-variations'];
	const useVariables = exportVariations === true;

	if (variationName && variationName !== 'default') {
		const variablePrefix = prefix;
		const variableName = `${variablePrefix}-${variationName}`;

		// Si export-variations: true, utiliser une variable CSS, sinon la valeur directe
		if (useVariables) {
			variableToUse = `var(--${variableName})`;
			variantInfo = {
				prefix,
				variantName: variationName,
				variantValue: variation,
				shouldExport: true,
			};
		} else {
			// Utiliser la valeur directe, pas de variable CSS
			variableToUse = variation;
		}
	} else if (variation && variationName === 'default') {
		// Pour les variations par défaut
		const variableName = `${prefix}-default`;

		if (useVariables) {
			variableToUse = `var(--${variableName})`;
			variantInfo = {
				prefix,
				variantName: 'default',
				variantValue: variation,
				shouldExport: true,
			};
		} else {
			variableToUse = variation;
		}
	}

	let declaration = utility.declaration
		.replace('${value}', variableToUse)
		.replace('${color}', color ? `var(--${color})` : '');

	if (!declaration.endsWith(';')) {
		declaration += ';';
	}

	if (!declaration.includes('!important')) {
		declaration = declaration.replace(';', ' !important;');
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
// Cache regex outside function to avoid recompilation on every call
const OPACITY_DETECTION_REGEX = /(?:(\w-?)+)-\d{2}$/; // Strings that end with two digits (e.g., primary-50)
const OPACITY_SUFFIX_LENGTH = 3; // Length of "-NN" format

const getColorInfos = (color: string) => {
	const isOpacity = OPACITY_DETECTION_REGEX.test(color);

	const baseColor = isOpacity
		? color.slice(0, -OPACITY_SUFFIX_LENGTH)
		: color;
	const colorExists = Object.keys(config.colors).some(
		configColor => configColor === baseColor
	);
	color === 'primary-10' && console.log({ colorExists, baseColor })

	return {
		colorExists,
		isOpacity,
		baseColor,
	};
};

export { mapClassesIntoRules };
