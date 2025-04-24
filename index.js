"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.colors = void 0;

const config_tool_1 = require("./src/config/config.tool");
const logger_1 = require("./src/tools/logger");
const classes_1 = require("./src/tools/extract/classes");

/** List every imported colors across the projet */
const colors = [];
exports.colors = colors;

const init = async () => {
  console.time(`${logger_1.logPrefix} Config initialized in`);
  (0, config_tool_1.init)();
  console.timeEnd(`${logger_1.logPrefix} Config initialized in`);
  (0, logger_1.log)('---');

  console.time(`${logger_1.logPrefix} Rules generated in`);
  await (0, classes_1.init)();
  console.timeEnd(`${logger_1.logPrefix} Rules generated in`);
  (0, logger_1.log)('---');
};

function AnubisUI() {
  return {
    name: 'anubis-ui',
    configureServer(server) {
      server.watcher.on('change', (file) => {
        console.log({ file });

        console.time(`${logger_1.logPrefix} Refreshed in`);
        await (0, classes_1.init)();
        console.timeEnd(`${logger_1.logPrefix} Refreshed in`);
      });
    },
    async buildStart() {
      (0, logger_1.logo)();

      console.time(`${logger_1.logPrefix} Anubis initialized in`);
      await init();
      console.timeEnd(`${logger_1.logPrefix} Anubis initialized in`);
    }
  };
}

exports.default = AnubisUI;