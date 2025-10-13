// core/config/config-merger.ts

import { Config } from './config-loader';

export class ConfigMerger {
  /**
   * Merge user config into default config
   * User config completely replaces sections (no deep merge)
   */
  merge(defaults: Config, userConfig: Partial<Config>): Config {
    return {
      utilities: userConfig.utilities ?? defaults.utilities,
      colors: userConfig.colors ?? defaults.colors,
      states: userConfig.states ?? defaults.states,
      files: userConfig.files ?? defaults.files,
      forcedClasses: userConfig.forcedClasses ?? defaults.forcedClasses,
    };
  }
}
