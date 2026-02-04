import fs from 'fs';
import path from 'path';
import { log } from '@tools/logger';

const userConfigPath = path.join(process.cwd(), 'anubis.config.json');
let userConfig = null;

const readUserConfigFile = () => {
    const userConfigExists = fs.existsSync(userConfigPath);

    if (!userConfigExists) {
        log('No user config file found, using default configuration.');
        log('---')
        return;
    }

    const config = fs.readFileSync(userConfigPath, { encoding: 'utf-8' });
    userConfig = JSON.parse(config);

    return userConfig;
};

/** Print a warning if the config file has unknow keys */
const checkUserConfigFile = (configFile: string[]): void => {
    if (!userConfig) {
        return;
    }

    // todo - also check values
    const userConfigKeys = Object.keys(userConfig);

    const unknownKeys = userConfigKeys?.filter(
        key => !configFile.includes(key) && key !== 'force'
    );
    if (!unknownKeys?.length) {
        return;
    }

    log(`${unknownKeys?.length} unknown config keys found in user config file`);
    for (const key of unknownKeys) {
        log(`- ${key}`);
    }
};

export { userConfig, readUserConfigFile, checkUserConfigFile };
