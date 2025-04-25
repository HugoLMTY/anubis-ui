const fs = require('fs')
const path = require('path')

import { log } from '../logger'

const userConfigPath = path.join(process.cwd(), 'anubis.config.json')
let userConfig = null

const readUserConfigFile = () => {
  const userConfigExists = fs.existsSync(userConfigPath)

  if (!userConfigExists) {
    log('No user config file found, using default configuration.')
    return
  }

  const config = fs.readFileSync(userConfigPath, { encoding: 'utf-8'})
  userConfig = JSON.parse(config)

  return userConfig
}

export {
  userConfig,
  readUserConfigFile
}