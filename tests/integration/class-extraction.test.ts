// tests/integration/class-extraction.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClassExtractor } from '@core/extraction/class-extractor';
import { FileScanner } from '@infrastructure/filesystem/file-scanner';
import { Utility } from '@domain/models/Utility';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('ClassExtractor - Integration Tests', () => {
  let tempDir: string;
  let extractor: ClassExtractor;
  let utilities: Utility[];

  beforeEach(() => {
    // Create temp directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'anubis-test-'));

    // Setup utilities
    utilities = [
      Utility.create({
        prefix: 'bg',
        declaration: 'background: ${color}',
      }),
      Utility.create({
        prefix: 'text',
        declaration: 'color: ${color}',
      }),
      Utility.create({
        prefix: 'rounded',
        declaration: 'border-radius: ${variant}',
        variants: { sm: '4px', md: '8px', lg: '12px' },
        'default-variant': 'md',
      }),
      Utility.create({
        prefix: 'border',
        declaration: 'border-width: ${variant}; border-color: ${color}',
        variants: { thin: '1px', thick: '4px' },
      }),
      Utility.create({
        prefix: 'shadow',
        declaration: 'box-shadow: ${variant} ${color}',
        variants: { wide: '0px 0px 10px 1px' },
      }),
      Utility.create({
        prefix: 'weight',
        declaration: 'font-weight: ${variant}',
        variants: { thin: 100, bold: 700 },
      }),
      Utility.create({
        prefix: 'flex',
        declaration: 'display: flex',
      }),
    ];

    const fileScanner = new FileScanner();
    const states = ['hover', 'focus', 'active'];
    extractor = new ClassExtractor(fileScanner, utilities, states);
  });

  afterEach(() => {
    // Cleanup temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('HTML files', () => {
    it('should extract simple color classes from HTML', async () => {
      const htmlContent = `
<!DOCTYPE html>
<html>
  <body>
    <div class="bg-primary text-white"></div>
  </body>
</html>
`;
      const filePath = path.join(tempDir, 'test.html');
      fs.writeFileSync(filePath, htmlContent);

      const classes = await extractor.extract({
        include: [path.join(tempDir, '*.html')],
      });

      expect(classes).toContain('bg-primary');
      expect(classes).toContain('text-white');
    });

    it('should extract classes with opacity from HTML', async () => {
      const htmlContent = `
<div class="bg-primary-50 text-accent-80"></div>
`;
      const filePath = path.join(tempDir, 'test.html');
      fs.writeFileSync(filePath, htmlContent);

      const classes = await extractor.extract({
        include: [path.join(tempDir, '*.html')],
      });

      expect(classes).toContain('bg-primary-50');
      expect(classes).toContain('text-accent-80');
    });

    it('should extract standalone utilities from HTML', async () => {
      const htmlContent = `
<div class="rounded flex"></div>
<div class="rounded-lg"></div>
`;
      const filePath = path.join(tempDir, 'test.html');
      fs.writeFileSync(filePath, htmlContent);

      const classes = await extractor.extract({
        include: [path.join(tempDir, '*.html')],
      });

      expect(classes).toContain('rounded');
      expect(classes).toContain('rounded-lg');
      expect(classes).toContain('flex');
    });

    it('should extract color+variant utilities from HTML', async () => {
      const htmlContent = `
<div class="border-primary-thick shadow-neutral-wide"></div>
`;
      const filePath = path.join(tempDir, 'test.html');
      fs.writeFileSync(filePath, htmlContent);

      const classes = await extractor.extract({
        include: [path.join(tempDir, '*.html')],
      });

      expect(classes).toContain('border-primary-thick');
      expect(classes).toContain('shadow-neutral-wide');
    });

    it('should extract classes with state modifiers from HTML', async () => {
      const htmlContent = `
<button class="bg-primary hover:bg-primary-80 focus:border-accent-thin"></button>
`;
      const filePath = path.join(tempDir, 'test.html');
      fs.writeFileSync(filePath, htmlContent);

      const classes = await extractor.extract({
        include: [path.join(tempDir, '*.html')],
      });

      expect(classes).toContain('bg-primary');
      expect(classes).toContain('hover:bg-primary-80');
      expect(classes).toContain('focus:border-accent-thin');
    });

    it('should extract multi-word color names from HTML', async () => {
      const htmlContent = `
<div class="bg-primary-lowest text-accent-highest border-neutral-medium-thick"></div>
`;
      const filePath = path.join(tempDir, 'test.html');
      fs.writeFileSync(filePath, htmlContent);

      const classes = await extractor.extract({
        include: [path.join(tempDir, '*.html')],
      });

      expect(classes).toContain('bg-primary-lowest');
      expect(classes).toContain('text-accent-highest');
      expect(classes).toContain('border-neutral-medium-thick');
    });

    it('should handle multiple classes on same element', async () => {
      const htmlContent = `
<div class="bg-primary text-white rounded shadow-neutral-wide border-accent-thin flex"></div>
`;
      const filePath = path.join(tempDir, 'test.html');
      fs.writeFileSync(filePath, htmlContent);

      const classes = await extractor.extract({
        include: [path.join(tempDir, '*.html')],
      });

      expect(classes).toEqual([
        'bg-primary',
        'border-accent-thin',
        'flex',
        'rounded',
        'shadow-neutral-wide',
        'text-white',
      ]);
    });

    it('should ignore non-utility classes', async () => {
      const htmlContent = `
<div class="container bg-primary custom-class text-white my-component"></div>
`;
      const filePath = path.join(tempDir, 'test.html');
      fs.writeFileSync(filePath, htmlContent);

      const classes = await extractor.extract({
        include: [path.join(tempDir, '*.html')],
      });

      expect(classes).toContain('bg-primary');
      expect(classes).toContain('text-white');
      expect(classes).not.toContain('container');
      expect(classes).not.toContain('custom-class');
      expect(classes).not.toContain('my-component');
    });
  });

  describe('Vue files', () => {
    it('should extract classes from Vue template', async () => {
      const vueContent = `
<template>
  <div class="bg-primary text-white rounded">
    <button class="hover:bg-primary-80 border-accent-thin">
      Click me
    </button>
  </div>
</template>

<script>
export default {
  name: 'TestComponent'
}
</script>
`;
      const filePath = path.join(tempDir, 'Test.vue');
      fs.writeFileSync(filePath, vueContent);

      const classes = await extractor.extract({
        include: [path.join(tempDir, '*.vue')],
      });

      expect(classes).toContain('bg-primary');
      expect(classes).toContain('text-white');
      expect(classes).toContain('rounded');
      expect(classes).toContain('hover:bg-primary-80');
      expect(classes).toContain('border-accent-thin');
    });

    it('should extract classes from Vue with dynamic bindings', async () => {
      const vueContent = `
<template>
  <div :class="dynamicClass" class="bg-primary static-class">
    <span class="text-white weight-bold">Static classes</span>
  </div>
</template>
`;
      const filePath = path.join(tempDir, 'Test.vue');
      fs.writeFileSync(filePath, vueContent);

      const classes = await extractor.extract({
        include: [path.join(tempDir, '*.vue')],
      });

      // Should extract static classes only
      expect(classes).toContain('bg-primary');
      expect(classes).toContain('text-white');
      expect(classes).toContain('weight-bold');
    });
  });

  describe('Multiple files', () => {
    it('should extract classes from multiple HTML files', async () => {
      const html1 = '<div class="bg-primary text-white"></div>';
      const html2 = '<div class="rounded shadow-neutral-wide"></div>';

      fs.writeFileSync(path.join(tempDir, 'file1.html'), html1);
      fs.writeFileSync(path.join(tempDir, 'file2.html'), html2);

      const classes = await extractor.extract({
        include: [path.join(tempDir, '*.html')],
      });

      expect(classes).toContain('bg-primary');
      expect(classes).toContain('text-white');
      expect(classes).toContain('rounded');
      expect(classes).toContain('shadow-neutral-wide');
    });

    it('should deduplicate classes from multiple files', async () => {
      const html1 = '<div class="bg-primary text-white"></div>';
      const html2 = '<div class="bg-primary rounded"></div>';
      const html3 = '<div class="bg-primary text-white rounded"></div>';

      fs.writeFileSync(path.join(tempDir, 'file1.html'), html1);
      fs.writeFileSync(path.join(tempDir, 'file2.html'), html2);
      fs.writeFileSync(path.join(tempDir, 'file3.html'), html3);

      const classes = await extractor.extract({
        include: [path.join(tempDir, '*.html')],
      });

      // Each class should appear only once
      const bgPrimaryCount = classes.filter(c => c === 'bg-primary').length;
      const textWhiteCount = classes.filter(c => c === 'text-white').length;
      const roundedCount = classes.filter(c => c === 'rounded').length;

      expect(bgPrimaryCount).toBe(1);
      expect(textWhiteCount).toBe(1);
      expect(roundedCount).toBe(1);
    });
  });

  describe('Forced classes', () => {
    it('should include forced classes even if not in files', async () => {
      const htmlContent = '<div class="bg-primary"></div>';
      const filePath = path.join(tempDir, 'test.html');
      fs.writeFileSync(filePath, htmlContent);

      const classes = await extractor.extract(
        {
          include: [path.join(tempDir, '*.html')],
        },
        ['text-white', 'rounded-lg']
      );

      expect(classes).toContain('bg-primary');
      expect(classes).toContain('text-white');
      expect(classes).toContain('rounded-lg');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty files', async () => {
      const filePath = path.join(tempDir, 'empty.html');
      fs.writeFileSync(filePath, '');

      const classes = await extractor.extract({
        include: [path.join(tempDir, '*.html')],
      });

      expect(classes).toEqual([]);
    });

    it('should handle files without class attributes', async () => {
      const htmlContent = `
<html>
  <body>
    <div id="app">
      <p>No classes here</p>
    </div>
  </body>
</html>
`;
      const filePath = path.join(tempDir, 'test.html');
      fs.writeFileSync(filePath, htmlContent);

      const classes = await extractor.extract({
        include: [path.join(tempDir, '*.html')],
      });

      expect(classes).toEqual([]);
    });

    it('should handle malformed class attributes', async () => {
      const htmlContent = `
<div class="bg-primary text-white">Valid</div>
<div class="">Empty</div>
<div class="   ">Whitespace only</div>
<div class="bg-primary   text-white   ">Extra spaces</div>
`;
      const filePath = path.join(tempDir, 'test.html');
      fs.writeFileSync(filePath, htmlContent);

      const classes = await extractor.extract({
        include: [path.join(tempDir, '*.html')],
      });

      expect(classes).toContain('bg-primary');
      expect(classes).toContain('text-white');
      expect(classes.length).toBe(2); // Only valid classes
    });
  });
});
