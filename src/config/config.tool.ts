// import fs from 'fs'
// import path from 'path'
const fs = require('fs')
const path = require('path')

import { log } from '../tools/logger'

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

const configFolder = path.join(__dirname, '..', 'config')
const configFiles = [
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
  for (const file of configFiles) {
    const filePath = path.join(configFolder, `${file}.config.json`)

    const configContent = fs.readFileSync(filePath, { encoding: 'utf-8' })

    config[file as keyof typeof config] = JSON.parse(configContent)
  }

  return config
}

export {
  init,
  config
}