declare module 'anubis-ui' {
  import type { Plugin } from 'vite';
  import type { IEnvConfig } from './dist/interfaces/config.interface';

  const plugin: Plugin;
  const config: IEnvConfig;

  const anubis: {
    plugin: typeof plugin;
    config: typeof config;
  };

  export default anubis;
}