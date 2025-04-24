"use strict";

const { init: initConfig } = require('./dist/config/config.tool');
const { log, logPrefix } = require('./dist/tools/logger');
const { init: initClassExtraction } = require('./dist/tools/extract/classes');

/** List every imported colors across the projet */
const colors = [];

const init = async () => {
  console.time(`${logPrefix} Config initialized in`);
  initConfig();
  console.timeEnd(`${logPrefix} Config initialized in`);
  log('---');

  console.time(`${logPrefix} Rules generated in`);
  await initClassExtraction();
  console.timeEnd(`${logPrefix} Rules generated in`);
  log('---');
};

function AnubisUI() {
  return {
    name: 'anubis-ui',
    configureServer(server) {
      server.watcher.on('change', async (file) => {
        console.log({ file });

        // _ Prevent self change loop
        if (file.endsWith('_anubis.vue')) { return }

        console.time(`${logPrefix} Refreshed in`);
        await initClassExtraction();
        console.timeEnd(`${logPrefix} Refreshed in`);
      });
    },
    async buildStart() {
      await init();
    }
  };
}

module.exports = AnubisUI;
module.exports.colors = colors;