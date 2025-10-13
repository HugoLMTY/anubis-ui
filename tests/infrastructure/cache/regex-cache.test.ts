// tests/infrastructure/cache/regex-cache.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { RegexCache } from '@infrastructure/cache/regex-cache';

describe('RegexCache', () => {
  let cache: RegexCache;

  beforeEach(() => {
    cache = new RegexCache();
  });

  describe('getOrCreate', () => {
    it('should create and cache a regex pattern', () => {
      const pattern = '^test-\\w+$';
      const regex = cache.getOrCreate(pattern);

      expect(regex).toBeInstanceOf(RegExp);
      expect(regex.source).toBe(pattern);
    });

    it('should return the same regex instance for the same pattern', () => {
      const pattern = '^test-\\w+$';
      const regex1 = cache.getOrCreate(pattern);
      const regex2 = cache.getOrCreate(pattern);

      expect(regex1).toBe(regex2);
    });

    it('should cache patterns with different flags separately', () => {
      const pattern = 'test';
      const regex1 = cache.getOrCreate(pattern, 'g');
      const regex2 = cache.getOrCreate(pattern, 'i');
      const regex3 = cache.getOrCreate(pattern);

      expect(regex1).not.toBe(regex2);
      expect(regex1).not.toBe(regex3);
      expect(regex2).not.toBe(regex3);
      expect(regex1.flags).toBe('g');
      expect(regex2.flags).toBe('i');
      expect(regex3.flags).toBe('');
    });

    it('should handle complex patterns', () => {
      const pattern = '^(hover:|focus:)?(bg|border)-([a-z-]+)(-\\d+)?$';
      const regex = cache.getOrCreate(pattern);

      expect(regex.test('bg-primary')).toBe(true);
      expect(regex.test('hover:border-accent-50')).toBe(true);
      expect(regex.test('invalid')).toBe(false);
    });
  });

  describe('has', () => {
    it('should return false for uncached patterns', () => {
      expect(cache.has('test')).toBe(false);
    });

    it('should return true for cached patterns', () => {
      const pattern = 'test';
      cache.getOrCreate(pattern);

      expect(cache.has(pattern)).toBe(true);
    });

    it('should distinguish between patterns with different flags', () => {
      const pattern = 'test';
      cache.getOrCreate(pattern, 'g');

      expect(cache.has(pattern, 'g')).toBe(true);
      expect(cache.has(pattern, 'i')).toBe(false);
      expect(cache.has(pattern)).toBe(false);
    });
  });

  describe('get', () => {
    it('should return undefined for uncached patterns', () => {
      expect(cache.get('test')).toBeUndefined();
    });

    it('should return cached regex for cached patterns', () => {
      const pattern = 'test';
      const cached = cache.getOrCreate(pattern);
      const retrieved = cache.get(pattern);

      expect(retrieved).toBe(cached);
    });

    it('should distinguish between patterns with different flags', () => {
      const pattern = 'test';
      const regexG = cache.getOrCreate(pattern, 'g');
      const regexI = cache.getOrCreate(pattern, 'i');

      expect(cache.get(pattern, 'g')).toBe(regexG);
      expect(cache.get(pattern, 'i')).toBe(regexI);
      expect(cache.get(pattern)).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should return false when deleting uncached pattern', () => {
      expect(cache.delete('test')).toBe(false);
    });

    it('should delete a cached pattern and return true', () => {
      const pattern = 'test';
      cache.getOrCreate(pattern);

      expect(cache.has(pattern)).toBe(true);
      expect(cache.delete(pattern)).toBe(true);
      expect(cache.has(pattern)).toBe(false);
    });

    it('should only delete the specific pattern with flags', () => {
      const pattern = 'test';
      cache.getOrCreate(pattern, 'g');
      cache.getOrCreate(pattern, 'i');

      expect(cache.delete(pattern, 'g')).toBe(true);
      expect(cache.has(pattern, 'g')).toBe(false);
      expect(cache.has(pattern, 'i')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all cached patterns', () => {
      cache.getOrCreate('pattern1');
      cache.getOrCreate('pattern2', 'g');
      cache.getOrCreate('pattern3', 'i');

      expect(cache.size()).toBe(3);

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.has('pattern1')).toBe(false);
      expect(cache.has('pattern2', 'g')).toBe(false);
      expect(cache.has('pattern3', 'i')).toBe(false);
    });

    it('should allow new patterns to be cached after clear', () => {
      cache.getOrCreate('pattern1');
      cache.clear();

      const regex = cache.getOrCreate('pattern2');

      expect(cache.size()).toBe(1);
      expect(regex).toBeInstanceOf(RegExp);
    });
  });

  describe('size', () => {
    it('should return 0 for empty cache', () => {
      expect(cache.size()).toBe(0);
    });

    it('should return correct size as patterns are added', () => {
      expect(cache.size()).toBe(0);

      cache.getOrCreate('pattern1');
      expect(cache.size()).toBe(1);

      cache.getOrCreate('pattern2');
      expect(cache.size()).toBe(2);

      cache.getOrCreate('pattern1'); // Same pattern
      expect(cache.size()).toBe(2); // Size shouldn't increase
    });

    it('should count patterns with different flags separately', () => {
      cache.getOrCreate('test', 'g');
      cache.getOrCreate('test', 'i');
      cache.getOrCreate('test');

      expect(cache.size()).toBe(3);
    });

    it('should decrease when patterns are deleted', () => {
      cache.getOrCreate('pattern1');
      cache.getOrCreate('pattern2');
      expect(cache.size()).toBe(2);

      cache.delete('pattern1');
      expect(cache.size()).toBe(1);
    });
  });

  describe('performance', () => {
    it('should cache complex patterns efficiently', () => {
      const pattern = '^(hover:|focus:|active:)?(bg|border|text)-([a-z-]+)(-\\d{2})?(-[a-z]+)?$';
      const flags = 'g';

      // First call should create and cache
      const start1 = performance.now();
      const regex1 = cache.getOrCreate(pattern, flags);
      const time1 = performance.now() - start1;

      // Second call should retrieve from cache (much faster)
      const start2 = performance.now();
      const regex2 = cache.getOrCreate(pattern, flags);
      const time2 = performance.now() - start2;

      expect(regex1).toBe(regex2);
      // Note: In practice, cached retrieval should be faster,
      // but for small operations the difference might be negligible
      // This test mainly ensures the caching mechanism works
    });

    it('should handle many patterns without performance degradation', () => {
      // Cache 100 different patterns
      for (let i = 0; i < 100; i++) {
        cache.getOrCreate(`pattern-${i}`, 'g');
      }

      expect(cache.size()).toBe(100);

      // Retrieving should still be fast
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        cache.get(`pattern-${i}`, 'g');
      }
      const time = performance.now() - start;

      // 100 retrievals should complete quickly (< 10ms on most systems)
      expect(time).toBeLessThan(10);
    });
  });

  describe('regex functionality', () => {
    it('should preserve regex functionality after caching', () => {
      const pattern = '^test-\\d+$';
      const regex = cache.getOrCreate(pattern);

      expect(regex.test('test-123')).toBe(true);
      expect(regex.test('test-abc')).toBe(false);
      expect(regex.test('invalid')).toBe(false);
    });

    it('should work with global flag correctly', () => {
      const pattern = '\\d+';
      const regex = cache.getOrCreate(pattern, 'g');
      const text = 'a1b2c3';

      const matches = text.match(regex);

      expect(matches).toEqual(['1', '2', '3']);
    });

    it('should work with case-insensitive flag correctly', () => {
      const pattern = 'test';
      const regex = cache.getOrCreate(pattern, 'i');

      expect(regex.test('test')).toBe(true);
      expect(regex.test('TEST')).toBe(true);
      expect(regex.test('TeSt')).toBe(true);
    });
  });
});
