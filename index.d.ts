import { IEnvConfig } from './dist/interfaces/config.interface';

declare module 'anubis-ui' {
  import type { Plugin } from 'vite';

  export const plugin: Plugin;
  export const config: IEnvConfig;
}