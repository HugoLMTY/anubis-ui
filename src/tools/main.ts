import { mixinsFile, overridesFile, tokensFile, writeFile } from "./fileStuff/file.tools";
import { measureDuration } from "./logger";
import { mapColorsIntoTokens } from "./mapping/mapColors";
import { mapUtilitiesIntoOverride } from "./mapping/mapUtilities";
import { mixins } from "./output/css.output";

const { init: initClassExtraction } = require('./extraction/extractClasses');
const { init: initConfig } = require('./config.tool');
const { init: initQuasarVariables } = require('./fileStuff/quasar-variables.file');

export const init = async () => {
  /** Extract and set global configurations */
  await measureDuration('Config', initConfig, false)

  /**
   * Write static mixins to designated file
   * @output anubis/_mixins.scss
   */
  await measureDuration('Mixins', initMixins, false) 

  /**
   * Map every colors entries from the config into tokens
   * @output anubis/_tokens.scss
   *  */
  await measureDuration('Tokens', initTokens, false) 

  /**
   * Map configured utilities overrides into a file
   * @output anubis/_overrides.scss
   */
  await measureDuration('Overrides', initOverrides, false)


  /**
   * Add imports to quasar.variables.scss file
   * @imports tokens, overrides
   * @output quasar.variables.scss
   */
  await measureDuration('Quasar imports', initQuasarVariables, false)

  /**
   * Extract classes from the project to remap them into css declaration
   * @output _anubis.scss
   * */
  await measureDuration('Rules', initClassExtraction) 

  return 
}

const initMixins = () => {
  writeFile(mixinsFile, mixins)
}

const initTokens = () => {
  const tokenizedColors = mapColorsIntoTokens()
  writeFile(tokensFile, tokenizedColors)
}

const initOverrides = () => {
  const mappedOverrides = mapUtilitiesIntoOverride()
  writeFile(overridesFile, mappedOverrides)
}