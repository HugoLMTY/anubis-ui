"use strict";

const { config } = require('./dist/tools/config.tool');
const { measureDuration, log, logo } = require('./dist/tools/logger');
const { init: initAnubis, refresh: refreshAnubis } = require('./dist/tools/main')

const init = async () => {
  logo();
  await measureDuration('Anubis', initAnubis, false)
};

const onFileChange = async (file) => {
  // todo - add targets / ignore detection
  // _ Prevent self change loop
  if (file.endsWith('_anubis.scss')) { return }

  // _ Init everything again if config changes
  if (file.endsWith('anubis.config.json')) {
    log('Config file changed, restarting...')
    await init();
    return
  }

  await refreshAnubis()
}

function AnubisUI() {
  return {
    name: 'anubis-ui',
    configureServer(server) {
      server.watcher.on('change', async (file) => {
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
          await onFileChange(file)
        } else {
          log('Trying to build in a not Node environment, aborting')
        }
      });
    },
    async buildStart() {
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        await init();
      } else {
        log('Trying to build in a not Node environment, aborting')
      }
    }
  };
}

module.exports = {
  plugin: AnubisUI(),
  config
}