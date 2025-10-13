"use strict";

const { init, refresh } = require('./dist/index');
const { log, logPrefix } = require('./dist/shared/utils/logger');

const initAnubis = async () => {
  try {
    await init();
  } catch (error) {
    console.error(`${logPrefix} ❌ Initialization failed:`, error.message);
    throw error;
  }
};

const refreshAnubis = async (file) => {
  // Prevent self change loop
  if (file.endsWith('_anubis.scss')) {
    return;
  }

  // If config changed, reinitialize
  if (file.endsWith('anubis.config.json')) {
    log('Config file changed, reinitializing...');
    await initAnubis();
    return;
  }

  // Otherwise just refresh
  try {
    await refresh();
  } catch (error) {
    console.error(`${logPrefix} ❌ Refresh failed:`, error.message);
  }
};

function AnubisUI() {
  return {
    name: 'anubis-ui',
    configureServer(server) {
      server.watcher.on('change', async (file) => {
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
          await refreshAnubis(file);
        } else {
          log('Trying to build in a not Node environment, aborting');
        }
      });
    },
    async buildStart() {
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        await initAnubis();
      } else {
        log('Trying to build in a not Node environment, aborting');
      }
    }
  };
}

module.exports = {
  plugin: AnubisUI(),
};
