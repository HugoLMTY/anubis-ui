import { getFiles } from "../fileStuff/file.tools"
import { mapClassesIntoRules } from "../mapping/mapClassIntoRule"
import { writeCssRuleFile } from "../fileStuff/css.file"
import { config } from "../config.tool"
import { mapColorsIntoMixinDeclaration } from "../mapping/mapColorIntoDeclaration"

const fs = require('fs')

/** Fetch vue file based on config target patterns */
const init = async () => {
  const files = await getFiles(config.files)

  const mappedColors = mapColorsIntoMixinDeclaration(config.colors)

  const uniqueClasses = await getUniqueClasses(files)
  const mappedRules = mapClassesIntoRules(uniqueClasses)

  const file = writeCssRuleFile(mappedColors, mappedRules)
  return file
}

/** Extract detected class and map into a flat set */
const getUniqueClasses = async (files: string[]): Promise<string[]> => {
  const extractedClasses = (await Promise.all(
    files.map(async file => extractClasses(file))
  ))
  ?.flat()

  const classes = [...extractedClasses, ...config.force]?.sort()

  const uniqueClasses = Array.from(new Set(classes))
  return uniqueClasses
}

/** Find matching classes from a given file based on config states and prefixes */
const extractClasses = async (filePath: string): Promise<string[]> => {
  const file = await fs.promises.readFile(filePath, 'utf-8')
  if (!file) { return [] }

  const { states, qol, presets } = config

  const partialPrefixes = presets?.map(p => `${p.prefix}-`)
  const partialQol = qol?.map(q => q.standalone ? `${q.prefix}` : `${q.prefix}-`)

  const mappedPrefixes = [
    ...partialPrefixes,
    ...partialQol
  ]?.join('|')
  const mappedStates = `(${states?.map(s => `${s}:`)?.join('|')})`

  const classDetectionRegex = new RegExp(`${mappedStates}?(${mappedPrefixes})(-?(\\w+(-+)?)+)?`, 'g')

  const matches = file.match(classDetectionRegex) || []
  return matches
}

export {
  init
}