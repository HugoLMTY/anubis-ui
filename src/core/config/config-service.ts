// core/config/config-service.ts

import { ConfigLoader, Config } from './config-loader';
import { ConfigMerger } from './config-merger';
import { ConfigValidator } from './config-validator';
import { log } from '@shared/utils/logger';

export class ConfigService {
  private config?: Config;

  constructor(
    private readonly loader: ConfigLoader,
    private readonly merger: ConfigMerger,
    private readonly validator: ConfigValidator
  ) {}

  /**
   * Initialize configuration
   */
  initialize(): Config {
    log('🔧 Loading configuration...');

    // Load default config
    const defaults = this.loader.loadDefaults();
    log(`  ✓ Loaded ${defaults.utilities.length} utilities`);
    log(`  ✓ Loaded ${Object.keys(defaults.colors).length} colors`);

    // Load user config
    const userConfig = this.loader.loadUserConfig();
    if (userConfig) {
      log('  ✓ Loaded user configuration');
    }

    // Merge configs
    const merged = this.merger.merge(defaults, userConfig || {});

    // Validate
    const result = this.validator.validate(merged);
    if (!result.valid) {
      const errorMessage = [
        '❌ Configuration validation failed:',
        ...result.errors.map(err => `  - [${err.field}] ${err.message}`),
        '',
        'Please check your configuration files.',
      ].join('\n');

      log(errorMessage);
      throw new Error('Invalid configuration');
    }

    log('✅ Configuration validated successfully');

    this.config = merged;
    return merged;
  }

  /**
   * Get current configuration
   */
  getConfig(): Config {
    if (!this.config) {
      throw new Error('Configuration not initialized. Call initialize() first.');
    }
    return this.config;
  }
}
