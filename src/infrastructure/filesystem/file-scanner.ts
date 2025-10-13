// infrastructure/filesystem/file-scanner.ts

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

export class FileScanner {
  /**
   * Scan files matching patterns
   */
  async scan(patterns: {
    include: string[];
    exclude?: string[];
  }): Promise<string[]> {
    const files: string[] = [];

    for (const pattern of patterns.include) {
      const matches = await glob(pattern, {
        ignore: patterns.exclude || [],
        nodir: true,
      });

      files.push(...matches);
    }

    // Remove duplicates
    return [...new Set(files)];
  }

  /**
   * Read file content
   */
  readFile(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
  }

  /**
   * Read multiple files
   */
  async readFiles(filePaths: string[]): Promise<Map<string, string>> {
    const contents = new Map<string, string>();

    for (const filePath of filePaths) {
      try {
        const content = this.readFile(filePath);
        contents.set(filePath, content);
      } catch (error) {
        console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
      }
    }

    return contents;
  }
}
