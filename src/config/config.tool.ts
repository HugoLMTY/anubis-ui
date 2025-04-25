import { readUserConfigFile, userConfig } from "../tools/fileHandling/configFile"
import { log } from "../tools/logger"

const fs = require('fs')
const path = require('path')

interface IPreset {
  [key: string]: string
}
interface IEnvConfig {
  files: {
    targets: string|string[],
    ignore: string[]
  },
  colors: string[],
  selectors: {
    states: string[],
    prefixes: string[]
  },
  presets: {
    'border': IPreset[],
    'inner-border': IPreset[],
    'shadow': IPreset[],
  },
  [key: string]: any
}

const anubisConfigFolder = path.join(__dirname, '..', '..', 'src', 'config');
const anubisConfigFiles = [
  'files',
  'colors',
  'presets',
  'selectors'
]

const config = {
  files: { targets: [], ignore: [] },
  colors: [],
  selectors: { states: [], prefixes: [] },
  presets: {
    border: [],
    "inner-border": [],
    shadow: [],
  },
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

      configToUse = JSON.parse(configContent)
    }

    config[file as keyof typeof config] = configToUse
  }

  return config
}

const checkUserConfig = () => {

  // todo - also check values
  const userConfigKeys = Object.keys(userConfig)

  const unknownKeys = userConfigKeys?.filter(key => !anubisConfigFiles.includes(key))
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