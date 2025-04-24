import { config } from "../../../config/config.tool"
import { buildCssRuleFile } from "../../cssFile"
import { mapClassesIntoRules } from "../../mapping/mapClassIntoRule"
import { getFiles } from "../extract.tools"

// import fs from 'fs'
const fs = require('fs')

/** Fetch vue file based on config target patterns */
const init = async () => {
  const files = await getFiles(config.files)
  // console.log({ files })

  const uniqueClasses = await getUniqueClasses(files)
  const mappedRules = mapClassesIntoRules(uniqueClasses)
  // console.log({ uniqueClasses, mappedRules })

  const file = buildCssRuleFile(mappedRules)
  // console.log({ file })
}

/** Extract detected class and map into a flat set */
const getUniqueClasses = async (files: string[]): Promise<string[]> => {
  const extractedClasses = (await Promise.all(
    files.map(async file => extractClasses(file))
  ))
  ?.flat()
  ?.sort()

  const uniqueClasses = Array.from(new Set(extractedClasses))
  // log(`${uniqueClasses?.length} classes found`)

  return uniqueClasses
}

/** Find matching classes from a given file based on config states and prefixes */
const extractClasses = async (filePath: string): Promise<string[]> => {
  const file = await fs.promises.readFile(filePath, 'utf-8')
  if (!file) { return [] }

  const { states, prefixes } = config.selectors

  const partialStates = `(${states?.map(s => `${s}:`)?.join('|')})`
  const partialPrefixes = `(${prefixes?.map(p => `${p}-`)?.join('|')})`

  const classDetectionRegex = new RegExp(`${partialStates}?${partialPrefixes}(\\w+(-+)?)+`, 'gi')

  const matches = file.match(classDetectionRegex)
  if (!matches?.length) { return [] }

  return matches
}

export {
  init
}