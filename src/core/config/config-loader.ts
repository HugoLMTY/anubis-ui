// core/config/config-loader.ts

import fs from 'fs';
import path from 'path';
import { UtilityConfig } from '@shared/types/utility.types';
import { IColor } from '@shared/types/color.types';

export interface Config {
  utilities: UtilityConfig[];
  colors: IColor;
  states: string[];
  files: {
    include: string[];
    exclude?: string[];
  };
  forcedClasses?: string[];
}

export class ConfigLoader {
  constructor(
    private readonly configDir: string = path.resolve(__dirname, '../../../src/config'),
    private readonly userConfigPath?: string
  ) {}

  /**
   * Load default configuration from config files
   */
  loadDefaults(): Config {
    const utilities = this.loadJsonFile<UtilityConfig[]>(
      path.join(this.configDir, 'utilities.config.json')
    );

    const colors = this.loadJsonFile<IColor>(
      path.join(this.configDir, 'colors.config.json')
    );

    const states = this.loadJsonFile<string[]>(
      path.join(this.configDir, 'states.config.json')
    );

    const files = this.loadJsonFile<{ include: string[]; exclude?: string[] }>(
      path.join(this.configDir, 'files.config.json')
    );

    return {
      utilities,
      colors,
      states,
      files,
    };
  }

  /**
   * Load user configuration if exists
   */
  loadUserConfig(): Partial<Config> | null {
    if (!this.userConfigPath) {
      return null;
    }

    if (!fs.existsSync(this.userConfigPath)) {
      return null;
    }

    try {
      return this.loadJsonFile<Partial<Config>>(this.userConfigPath);
    } catch (error) {
      throw new Error(`Failed to load user config: ${error.message}`);
    }
  }

  /**
   * Load and parse a JSON file
   */
  private loadJsonFile<T>(filePath: string): T {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load config file ${filePath}: ${error.message}`);
    }
  }
}
