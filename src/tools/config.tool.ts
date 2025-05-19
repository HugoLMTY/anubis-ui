import { IEnvConfig } from "../interfaces/config.interface";
import { readUserConfigFile, userConfig } from "./fileStuff/configFile"
import { log } from "./logger"

const fs = require('fs')
const path = require('path')

const anubisConfigFolder = path.join(__dirname, '..', '..', 'src', 'config');
const anubisConfigFiles = [
  'qol',
  'files',
  'colors',
  'states',
  'presets',
]

const config = {
  qol: [],
  presets: [],

  force: [],

  files: { targets: [], ignore: [] },
  colors: [],
  states: [],
} as IEnvConfig

const init = () => {
  readUserConfigFile()

  checkUserConfig()

  for (const file of anubisConfigFiles) {
    let configToUse = null

    if (userConfig && userConfig[file]) {
      log(`${file} config found, overriding default.`)
      configToUse = userConfig[file]
    } else {
      const filePath = path.join(anubisConfigFolder, `${file}.config.json`)
      const configContent = fs.readFileSync(filePath, { encoding: 'utf-8' })
      if (!configContent) { continue }

      configToUse = JSON.parse(configContent)
    }

    config[file as keyof typeof config] = configToUse
  }

  const forceClasses = userConfig?.['force']

  if (forceClasses?.length) {
    log(`Forcing the creation of ${forceClasses?.length} classes`)
    config.force = userConfig['force']
  }

  return config
}

const checkUserConfig = () => {
  if (!userConfig) { return }

  // todo - also check values
  const userConfigKeys = Object.keys(userConfig)

  const unknownKeys = userConfigKeys?.filter(key => !anubisConfigFiles.includes(key) && key !== 'force')
  if (!unknownKeys?.length) { return }

  log(`${unknownKeys?.length} unknown config keys found in user config file`)
  for (const key of unknownKeys) {
    log(`- ${key}`)
  }
}

export {
  init,
  config
}