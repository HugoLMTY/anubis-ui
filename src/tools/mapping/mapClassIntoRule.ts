import { config } from "../../config/config.tool"
import { IPreset } from "../../interfaces/preset.interface"
import { log } from "../logger"

const mapClassesIntoRules = (classes: string[]) => {
  const mappedRules = classes
    ?.map(cssClass => mapClassIntoRule(cssClass))
    ?.filter(rule => rule)

  log(`${mappedRules?.length} rules generated`)

  const rules = mappedRules?.join('\n')
  return rules
}

const mapClassIntoRule = (stringClass: string) => {
  const params = getClassInfos(stringClass)

  /**
   * _ If no variations are found, maybe it's just a color like bg-primary
   * _ So we need to check if the color exists to avoid useless computing
   * */
  if (!params.preset) {
    const { colorExists } = checkOpacity(params.color)

    if (!colorExists) {
      return
    }
  }

  /**
   * _ If the current QoL isn't standalone (can be called without variation)
   * _ no
   */
  if (!params.color && !params.preset?.standalone) {
    return
  }

  const rule = mapIntoRule(params)
  return rule
}

const getClassInfos = (stringClass: string) => {
  const { cleanedClass, state } = getStateInfos(stringClass)
  const { cleanedColor, prefix } = getPrefixInfos(cleanedClass)
  const { preset, variation } = getPresetInfos({ cleanedColor, prefix })

  return {
    state,

    color: cleanedColor,
    prefix,

    preset,
    variation
  }
}

const getStateInfos = (stringClass: string) => {
  let state = undefined

  for (const configState of config.states) {
    if (!stringClass.startsWith(configState)) { continue }

    state = configState
  }

  const cleanedClass = !!state ? stringClass?.slice(state?.length + 1) : stringClass
  return {
    cleanedClass,
    state,
  }
}

const getPrefixInfos = (stringClass: string): { cleanedColor: string, prefix: string } => {
  const prefixes = [
    ...config.presets?.map(q => q.prefix),
    ...config.qol?.map(q => q.prefix)
  ]

  for (const prefix of prefixes) {
    if (!stringClass.startsWith(prefix)) { continue }

    return {
      cleanedColor: stringClass?.slice(prefix.length + 1),
      prefix
    }
  }

  return null
}

const getPresetInfos = ({ cleanedColor, prefix }: { cleanedColor: string, prefix?: string }) => {
  /**
   * _ Find preset variants matching the prefix from the config
   * _ Since a prefix can be in multiple presets and qol, filter every matching prefixes then flatten everything
   * TODO fix first default occurence getting picked when duplicate
  *  */
  const possiblePresets = [...config.presets, ...config.qol]
    ?.filter(p => p.prefix === prefix)
    ?.flat()
  if (!possiblePresets?.length) { return { matchingPreset: null, variation: null } }

  const { colorExists } = checkOpacity(cleanedColor)

  /**
   * Find the preset where the variations exists
   * If the color exists, it is a preset, so use the preset
   * */
  const matchingPreset = colorExists || !cleanedColor
    ? possiblePresets[0]
    : possiblePresets?.find(({ variations }) => !variations || Object.keys(variations)?.find(v => cleanedColor.endsWith(v)))

  if (!matchingPreset) {
    log(`No preset found for ${cleanedColor || prefix}`)

    return {
      matchingPreset,
      variation: null
    }
  }

  const possibleVariations = (matchingPreset.variations || { default: '' })

  const matchingVariation = Object.keys(possibleVariations)
    ?.find(v => cleanedColor.endsWith(v)) || 'default'

  const variation = possibleVariations[matchingVariation]

  return {
    preset: matchingPreset,
    variation,
  }
}

const mapIntoRule = ({ state, prefix, color, preset, variation }) => {
  // _ Set state selector
  let stateSelector = ''
  switch (state) {
    case 'hover':
      stateSelector = ':hover'
      break

    case 'not-hover':
      stateSelector = ':not(:hover)'
      break
  }

  let selector = `${prefix}${color ? `-${color}` : ''}`
  if (state) {
    selector = `${state}\\:${selector}${stateSelector}`
  }

  const colorVar = `var(--${color})`
  let declaration = preset.declaration
    ?.replace('${value}', variation)
    ?.replace('${color}', colorVar)

  if (!declaration.endsWith(';')) {
    declaration += ';'
  }

  if (!declaration.includes('!important')) {
    declaration = declaration
      ?.replace(';', ' !important;')
  }

  const rule = `.${selector} { ${declaration} }`
  return rule
}

/**
 * _ Check if a color includes opacity (ends with 2 digits)
 * * Opacity is included in the color name during mixin declaration
 * */
const checkOpacity = (color: string) => {
  const opacityDetectionRegex = new RegExp(/(?:(\w-?)+)-\d{2}$/, 'gm') // Strings that end with two digits
  const isOpacity = opacityDetectionRegex.test(color)

  const baseColor = isOpacity ? color?.slice(0, -3) : color
  const colorExists = config.colors?.some(configColor => configColor === baseColor)

  return {
    colorExists,
    isOpacity,
    baseColor
  }
}

export {
  mapClassesIntoRules,
  mapClassIntoRule
}