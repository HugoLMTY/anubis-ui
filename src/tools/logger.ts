import { version } from '../version';

export const logPrefix = '☯︎ [ANUBIS]'
export const log = (str: string) => console.log(`${logPrefix} ${str}`)
export const logo = () => {
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
  console.time(`${logPrefix} ${section} initialized in`);
  await cb()
  console.timeEnd(`${logPrefix} ${section} initialized in`);
  linebreak && log('---');
}