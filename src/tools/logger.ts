import { version } from '../version';

const logPrefix = '☯︎ [ANUBIS]'
const log = (str: string) => console.log(`${logPrefix} ${str}`)

const logo = () => {
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

export {
  logo,

  log,
  logPrefix
}
