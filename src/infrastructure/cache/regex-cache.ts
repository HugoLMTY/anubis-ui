// infrastructure/cache/regex-cache.ts

/**
 * Cache key type - combination of pattern and flags
 */
export type RegexCacheKey = string;

/**
 * Cache for compiled regular expressions
 * Improves performance by avoiding recompilation of the same regex patterns
 */
export class RegexCache {
  private cache: Map<RegexCacheKey, RegExp>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Get a cached regex or create and cache it if it doesn't exist
   * @param pattern - The regex pattern string
   * @param flags - Optional regex flags (e.g., 'g', 'i', 'gi')
   * @returns The compiled RegExp instance
   */
  getOrCreate(pattern: string, flags?: string): RegExp {
    const key = this.generateKey(pattern, flags);

    // Check cache first
    let regex = this.cache.get(key);

    if (!regex) {
      // Compile and cache the regex
      regex = new RegExp(pattern, flags);
      this.cache.set(key, regex);
    }

    return regex;
  }

  /**
   * Check if a regex pattern is cached
   * @param pattern - The regex pattern string
   * @param flags - Optional regex flags
   * @returns true if the pattern is cached
   */
  has(pattern: string, flags?: string): boolean {
    const key = this.generateKey(pattern, flags);
    return this.cache.has(key);
  }

  /**
   * Get a cached regex without creating it
   * @param pattern - The regex pattern string
   * @param flags - Optional regex flags
   * @returns The cached RegExp or undefined
   */
  get(pattern: string, flags?: string): RegExp | undefined {
    const key = this.generateKey(pattern, flags);
    return this.cache.get(key);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove a specific pattern from the cache
   * @param pattern - The regex pattern string
   * @param flags - Optional regex flags
   * @returns true if the pattern was in the cache
   */
  delete(pattern: string, flags?: string): boolean {
    const key = this.generateKey(pattern, flags);
    return this.cache.delete(key);
  }

  /**
   * Get the number of cached regex patterns
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Generate a unique cache key from pattern and flags
   * @param pattern - The regex pattern string
   * @param flags - Optional regex flags
   * @returns A unique key for caching
   */
  private generateKey(pattern: string, flags?: string): RegexCacheKey {
    return flags ? `${pattern}::${flags}` : pattern;
  }
}

/**
 * Singleton instance for global regex caching
 */
export const globalRegexCache = new RegexCache();
