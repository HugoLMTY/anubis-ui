"use strict";

const { init: initConfig, config } = require('./dist/config/config.tool');
const { log, logPrefix, logo } = require('./dist/tools/logger');
const { init: initClassExtraction } = require('./dist/tools/extraction/extractClasses');

const init = async () => {
  logo();

  console.time(`${logPrefix} Config initialized in`);
  initConfig();
  console.timeEnd(`${logPrefix} Config initialized in`);
  log('---');

  console.time(`${logPrefix} Rules generated in`);
  await initClassExtraction();
  console.timeEnd(`${logPrefix} Rules generated in`);
  log('---');
};

const refresh = async (file) => {
  // console.log({ file });

  // _ Prevent self change loop
  // todo - add targets / ignore detection
  if (file.endsWith('_anubis.scss')) { return }
  if (file.endsWith('anubis.config.json')) {
    log('Config file changed, restarting...')
    init();
    return
  }

  console.time(`${logPrefix} Refreshed in`);
  await initClassExtraction();
  console.timeEnd(`${logPrefix} Refreshed in`);
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