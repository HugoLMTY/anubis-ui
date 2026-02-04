"use strict";

const { config } = require('./dist/tools/config.tool');
const { measureDuration, log, logPrefix, logo } = require('./dist/tools/logger');
const { init: initAnubis } = require('./dist/tools/main')

const init = async () => {
  logo();
  await measureDuration('Anubis', initAnubis, false)
};

const refresh = async (file) => {
  // _ Prevent self change loop
  // todo - add targets / ignore detection
  if (file.endsWith('_anubis.scss')) { return }
  if (file.endsWith('anubis.config.json')) {
    log('Config file changed, restarting...')
    init();
    return
  }

  await measureDuration('Refresh', initAnubis, false)
}

function AnubisUI() {
  return {
    name: 'anubis-ui',
    configureServer(server) {
      server.watcher.on('change', async (file) => {
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
          await refresh(file)
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