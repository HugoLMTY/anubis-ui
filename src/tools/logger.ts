const logPrefix = '☯︎ [ANUBIS]'
const log = (str: string) => console.log(`${logPrefix} ${str}`)

const logo = () => {
  log('    ___    _   ____  ______  _________')
  log('   /   |  / | / / / / / __ )/  _/ ___/')
  log('  / /| | /  |/ / / / / __  |/ / \\__ \\')
  log(' / ___ |/ /|  / /_/ / /_/ // / ___/ /')
  log('/_/  |_/_/ |_/\\____/_____/___//____/')
  log('')
  log('Welcome to Anubis 1.0')
  log('Autonomous Nominative Utility Based Intuitive Styler')
  log('---')
}

const cssHeader = `/*!
 * * Anubis v.1.0.4
 * * Improba
 * * Released under the MIT License.
 * */`

export {
  logo,
  cssHeader,

  log,
  logPrefix
}