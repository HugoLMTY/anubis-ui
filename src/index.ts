// src/index.ts

import path from 'path';
import { AnubisService } from '@core/anubis-service';
import { logo } from '@shared/utils/logger';

let service: AnubisService | null = null;

/**
 * Initialize AnubisUI
 */
export async function init(userConfigPath?: string): Promise<void> {
  logo();

  // Create service
  const configPath = userConfigPath || path.resolve(process.cwd(), 'anubis.config.json');
  service = new AnubisService(configPath);

  // Initialize
  console.time('⏱️  Config initialized in');
  await service.initialize();
  console.timeEnd('⏱️  Config initialized in');

  // Generate CSS
  const outputPath = path.resolve(process.cwd(), 'src/css/_anubis.scss');
  console.time('⏱️  CSS generated in');
  await service.generate(outputPath);
  console.timeEnd('⏱️  CSS generated in');
}

/**
 * Refresh CSS generation
 */
export async function refresh(): Promise<void> {
  if (!service) {
    throw new Error('AnubisUI not initialized. Call init() first.');
  }

  const outputPath = path.resolve(process.cwd(), 'src/css/_anubis.scss');
  console.time('⏱️  CSS refreshed in');
  await service.generate(outputPath);
  console.timeEnd('⏱️  CSS refreshed in');
}

/**
 * Get the service instance
 */
export function getService(): AnubisService {
  if (!service) {
    throw new Error('AnubisUI not initialized. Call init() first.');
  }
  return service;
}
