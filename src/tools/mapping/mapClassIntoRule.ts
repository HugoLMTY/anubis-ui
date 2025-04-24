import { config } from "../../config/config.tool"

const mapClassIntoRule = (stringClass: string) => {
  const colorExists = config.colors?.some(color => stringClass.includes(color))
  if (!colorExists) { return }

  const params = getClassInfos(stringClass)
  // console.log({ params })

  const rule = mapIntoRule(params)
  // console.log({ rule })

  return rule
}

const getClassInfos = (stringClass: string): { state?: string, prefix?: string, color: string, variation?: { key: string, value: string } } => {
  const { cleanedClass, state } = getStateInfos(stringClass)
  const { cleanedColor, prefix } = getPrefixInfos(cleanedClass)
  const { color, variation } = getVariantInfos({ cleanedColor, prefix })

  // console.log({ state, color, prefix, variation })
  return { state, color, prefix, variation }
}

const getStateInfos = (stringClass: string) => {
  let state = undefined

  for (const configState of config.selectors?.states) {
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
  let prefix = ''

  for (const configPrefix of config.selectors.prefixes) {
    if (!stringClass.startsWith(configPrefix)) { continue }

    prefix = configPrefix
  }

  return {
    cleanedColor: stringClass?.slice(prefix.length + 1),
    prefix,
  }
}

const getVariantInfos = ({ cleanedColor, prefix }: { cleanedColor: string, prefix?: string }): { color: string, variation?: { key: string, value: string } } => {
  // _ Handle opacity | bg-primary-10
  const opacityDetectionRegex = new RegExp(/(?:(\w-?)+)-\d{2}$/, 'gm') // Strings that end with two digits
  const isOpacity = opacityDetectionRegex.test(cleanedColor)
  if (isOpacity) {
    return {
      color: cleanedColor?.slice(0, -3),
      variation: {
        key: 'opacity',
        value: cleanedColor?.slice(-2),
      }
    }
  }

  // _ Find preset variants matching the prefix from the config
  const variants = config.presets[prefix as keyof typeof config.presets]
  if (!variants) { return { color: cleanedColor } }

  // _ Map found variants into a key/value object
  const matchingVariants = variants
    ?.map(v => Object.entries(v))
    ?.flat()
    ?.map(([key, value]) => ({ key, value }))
    // ?.filter(({ key }) => key !== 'default')

  const variation = matchingVariants?.find(({ key }) => cleanedColor.endsWith(key)) || matchingVariants?.find(({ key }) => key === 'default')
  // console.log({ variation })

  const color = variation && variation.key !== 'default'
    ? cleanedColor?.slice(0, variation.key.length + 1)
    : cleanedColor

  return {
    color,
    variation
  }
}

function mapIntoRule({ state, prefix, color, variation }: { state?: string, prefix?: string, color: string, variation?: { key: string, value: string } }) {  
  const colorVar = `var(--${color})`

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

  let declaration = ''

  // _ Set prefix declaration
  // ! Don't forget to add the prefix in the selector.config root file
  switch (prefix) {
    case 'bg':
      declaration = `background: ${colorVar} !important`
      break

    case 'text':
      declaration = `color: ${colorVar} !important`
      break

    case 'border':
      declaration = `border-width: ${variation?.value} !important; border-color: ${colorVar} !important; border-style: solid`
      break

    case 'inner-border':
      declaration = `box-shadow: inset ${variation?.value} ${colorVar} !important`
      break

    case 'shadow':
      declaration = `box-shadow: ${variation?.value} ${colorVar} !important`
      break

    default:
      // _ custom rule from config file
      const customDeclaration = config.customRules?.find((r: any) => r.prefix === prefix)?.declaration
      if (!customDeclaration) { return }

      declaration = customDeclaration?.replace('${value}', color) + ' !important'
      break
  }

  let selector = `${prefix}-${color}`
  if (state) {
    selector = `${state}\\:${selector}${stateSelector}`
  }

  const rule = `.${selector} { ${declaration} }`

  return rule
}

export {
  mapClassIntoRule
}