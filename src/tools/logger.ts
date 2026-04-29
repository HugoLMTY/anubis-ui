import { version } from '../version';
import { config } from './config.tool';

export const logPrefix = '☯︎ [ANUBIS]'
export const log = (str: string) => !config.global.silent && console.log(`${logPrefix} ${str}`)
export const logo = () => {
  !config.global.silent && 
    log('    ___    _   ____  ______  _________')
    log('   /   |  / | / / / / / __ )/  _/ ___/')
    log('  / /| | /  |/ / / / / __  |/ / \\__ \\')
    log(' / ___ |/ /|  / /_/ / /_/ // / ___/ /')
    log('/_/  |_/_/ |_/\\____/_____/___//____/')
    log('')
    log(`Welcome to Anubis v${version}`)
    log('Autonomous Nominative Utility Based Intuitive Styler')
    log('---')
}

/** Execute a callback function and measure it's duration */
export const measureDuration = async (section: string, cb: () => any, linebreak = true) => {
  !config.global.silent && console.time(`${logPrefix} ${section} initialized in`);
  await cb()
  !config.global.silent && console.timeEnd(`${logPrefix} ${section} initialized in`);
  linebreak && log('---');
}