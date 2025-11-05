import { IEnvConfig } from '@interfaces/config.interface';
import { readUserConfigFile, checkUserConfigFile, userConfig } from '@tools/fileStuff/config.file';
import { log } from '@tools/logger';
import { validateColors } from '@validation/color.validation';
import fs from 'fs';
import path from 'path';

const anubisConfigFolder = path.join(__dirname, '..', '..', 'src', 'config');
const anubisConfigFiles = [
  'utilities',
  'files',
  'colors',
  'states',
  'force',
]

const config = {
  utilities: [],

  force: [],

  files: { targets: [], ignore: [] },
  colors: {},
  states: [],
} as IEnvConfig

const init = () => {
  readUserConfigFile()
  checkUserConfigFile(anubisConfigFiles)

  for (const file of anubisConfigFiles) {
    let configToUse = null

    if (userConfig && userConfig[file]) {
      log(`${file} config found, overriding default.`)
      configToUse = userConfig[file]
    } else {
      const filePath = path.join(anubisConfigFolder, `${file}.config.json`)
      const fileExists = fs.existsSync(filePath)
      if (!fileExists) { continue }

      const configContent = fs.readFileSync(filePath, { encoding: 'utf-8' })
      if (!configContent) { continue }

      configToUse = JSON.parse(configContent)
    }

    config[file as keyof typeof config] = configToUse

    switch (file) {
      case 'colors':
        validateColors(config.colors)
        break

      case 'force':
        const forceClasses = userConfig?.['force']
        if (forceClasses?.length) {
          log(`Forcing the creation of ${forceClasses?.length} classes`)
        }
        break
    }
  }

  return config
}

export {
  init,
  config
}