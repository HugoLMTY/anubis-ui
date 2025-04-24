import { Plugin } from 'vite'

import { init as initConfig } from './config/config.tool'
import { log, logo, logPrefix } from './tools/logger'
// import { init as initPresets } from './config/'
import { init as initClassExtraction } from './tools/extract/classes'

/** List every imported colors across the projet */
const colors: string[] = []

const init = async () => {
  console.time(`${logPrefix} Config initialized in`)
  initConfig()
  console.timeEnd(`${logPrefix} Config initialized in`)
  log('---')

  console.time(`${logPrefix} Rules generated in`)
  await initClassExtraction()
  console.timeEnd(`${logPrefix} Rules generated in`)
  log('---')
}

export default function AnubisUI (): Plugin {
  return {
    name: 'anubis-ui',
    configureServer(server: any) {
      server.watcher.on('change', (file: any) => {
        console.log({ file })
      })
    },
    async buildStart() {
      logo()

      console.time(`${logPrefix} Anubis initialized in`)
      await init()
      console.timeEnd(`${logPrefix} Anubis initialized in`)
    }
  }
}

export {
  colors
}