declare module 'anubis-ui' {
    import type { Plugin } from 'vite';
    import type { IEnvConfig } from './src/interfaces/config.interface';

    const plugin: Plugin;
    const config: IEnvConfig;

    const anubis: {
        plugin: typeof plugin;
        config: typeof config;
    };

    export default anubis;
}
