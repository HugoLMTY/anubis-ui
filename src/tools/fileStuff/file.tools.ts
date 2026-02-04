import fs from 'fs';
import fg from 'fast-glob';
import path from 'path';

import { IFileConfig } from '@interfaces/files.interface';
import { log } from '../logger';

export const srcDir = path.join(process.cwd(), 'src', 'css');
export const outputDir = path.join(srcDir, 'anubis')


export const quasarFile = 'quasar.variables.scss'

export const outputFile = '_anubis.scss';
export const tokensFile = 'anubis/_tokens.scss'
export const mixinsFile = 'anubis/_mixins.scss'
export const overridesFile = 'anubis/_overrides.scss'

export const checkOrCreateFile = (filePath: string): boolean => {
	try {
		fs.mkdirSync(outputDir, { recursive: true });

		if (fs.existsSync(filePath)) { return true }
		log(`Generating missing file ${filePath}`)

		fs.writeFileSync(filePath, '')
		return true 

	} catch(err: any) {
		throw new Error(
			`Erreur lors de la vérification du fichier: ${err.message}`
		);
	}
}

export const getFiles = async (routeConfig: IFileConfig) => {
	return await fg(routeConfig.targets || '*.vue', {
		absolute: true,
		onlyFiles: true,
		ignore: routeConfig.ignore || [],
	});
}

export const readFile = (fileName: string): string => {
	const filePath = path.join(srcDir, fileName)
	checkOrCreateFile(filePath)

	return fs.readFileSync(filePath, { encoding: 'utf-8' })
}

export const writeFile = (fileName: string, content: string): string => {
	try {
		const filePath = path.join(srcDir, fileName)
		checkOrCreateFile(filePath)

		fs.writeFileSync(filePath, content)
		return filePath
	} catch(err: any) {
		throw new Error(
			`Erreur lors de l'écriture du fichier: ${err.message}`
		);
	}
}


// Performance optimization: limit concurrent file reads to avoid overwhelming the system
const maxConcurrrentFiles = 10;
/**
 * Execute promises with concurrency limit
 * @param items - Items to process
 * @param fn - Async function to execute for each item
 * @param limit - Maximum number of concurrent operations
 */
export const pLimit = async <T, R>(
		items: T[],
		fn: (item: T) => Promise<R>,
		limit: number = maxConcurrrentFiles
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
