// core/extraction/class-extractor.ts

import { FileScanner } from '@infrastructure/filesystem/file-scanner';
import { Utility } from '@domain/models/Utility';
import { RegexCache } from '@infrastructure/cache/regex-cache';

export class ClassExtractor {
  private readonly regexCache: RegexCache;
  private cachedDetectionRegex: RegExp | null = null;

  constructor(
    private readonly fileScanner: FileScanner,
    private readonly utilities: Utility[],
    private readonly states: string[]
  ) {
    this.regexCache = new RegexCache();
  }

  /**
   * Extract classes from files
   */
  async extract(
    patterns: { include: string[]; exclude?: string[] },
    forcedClasses: string[] = []
  ): Promise<string[]> {
    // Scan files
    const files = await this.fileScanner.scan(patterns);
    const contents = await this.fileScanner.readFiles(files);

    // Extract classes from all files
    const classes = new Set<string>(forcedClasses);

    for (const content of contents.values()) {
      // First, extract all class attributes
      const classAttrRegex = /class="([^"]*)"/g;
      const classAttrMatches = content.matchAll(classAttrRegex);

      for (const attrMatch of classAttrMatches) {
        const classValue = attrMatch[1];
        // Split by whitespace to get individual classes
        const individualClasses = classValue.split(/\s+/).filter(c => c.length > 0);

        // Check each class against our utility patterns
        for (const className of individualClasses) {
          if (this.matchesUtilityPattern(className)) {
            classes.add(className);
          }
        }
      }
    }

    // Sort and return
    return Array.from(classes).sort();
  }

  /**
   * Check if a class name matches any utility pattern
   */
  private matchesUtilityPattern(className: string): boolean {
    // Build regex pattern based on config (like old version)
    const regex = this.getOrBuildClassDetectionRegex();
    return regex.test(className);
  }

  /**
   * Get cached regex or build and cache it
   */
  private getOrBuildClassDetectionRegex(): RegExp {
    // Return cached regex if available
    if (this.cachedDetectionRegex) {
      return this.cachedDetectionRegex;
    }

    // Build and cache the regex
    this.cachedDetectionRegex = this.buildClassDetectionRegex();
    return this.cachedDetectionRegex;
  }

  /**
   * Build regex pattern for class detection (based on old extractClasses.ts)
   */
  private buildClassDetectionRegex(): RegExp {
    // Build prefixes: standalone can be exact match, others need dash
    const partialPrefixes: string[] = [];

    for (const utility of this.utilities) {
      const context = utility.getContext();

      if (context === 'static' || utility.isStandalone()) {
        // Static utilities or standalone variants can be exact match
        partialPrefixes.push(utility.prefix);
      }

      if (context !== 'static') {
        // Non-static utilities can also have suffixes
        partialPrefixes.push(`${utility.prefix}-`);
      }
    }

    const mappedPrefixes = partialPrefixes.join('|');

    // Build state pattern
    const mappedStates = this.states.length > 0
      ? `(${this.states.map(s => `${s}:`).join('|')})`
      : '';

    // Pattern: [state:]prefix[-suffix]
    // Note: No 'g' flag - we use .test() which doesn't need it and 'g' causes issues with state
    const pattern = `^${mappedStates}?(${mappedPrefixes})(-?(\\w+(-+)?)+)?$`;

    // Use regex cache for compilation
    return this.regexCache.getOrCreate(pattern);
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
