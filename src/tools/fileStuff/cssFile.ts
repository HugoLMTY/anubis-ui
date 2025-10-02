import fs from 'fs'
import path from 'path'

import { cssHeader, log } from '../logger'
import { config } from '../config.tool'

const srcDir = path.join(process.cwd(), 'src', 'css')
const outputPath = path.join(srcDir, '_anubis.scss')

const checkCssRuleFilePresence = () => {
  try {
    fs.mkdirSync(srcDir, { recursive: true })

    if (fs.existsSync(outputPath)) { return }

    log('Output file missing, generating..')
    fs.writeFileSync(outputPath, '')
  } catch (err: any) {
    throw new Error(`Erreur lors de la vérification du fichier CSS: ${err.message}`)
  }
}

const generateColorVariables = (usedColors: string[] = []) => {
  const colors = config.colors || {}

  if (usedColors.length === 0) {
    return ''
  }

  const variables = usedColors
    .map(colorName => `$${colorName}: ${colors[colorName]};`)
    .join('\n')

  return `// Colors\n${variables}\n\n`
}

const generateVariantVariables = (usedVariants: Record<string, string> = {}) => {
  const variantEntries = Object.entries(usedVariants)

  if (variantEntries.length === 0) {
    return ''
  }

  const variables = variantEntries
    .map(([variantName, variantValue]) => `$${variantName}: ${variantValue};`)
    .join('\n')

  return `// Variants\n${variables}\n\n`
}

const buildCssRuleFile = (classes: string = '', usedColors: string[] = [], usedVariants: Record<string, string> = {}) => {
  try {
    checkCssRuleFilePresence()

    const colorVariables = generateColorVariables(usedColors)
    const variantVariables = generateVariantVariables(usedVariants)
    const content = cssHeader + '\n\n' + colorVariables + variantVariables + classes

    fs.writeFileSync(outputPath, content)

    return outputPath
  } catch (err: any) {
    throw new Error(`Erreur lors de l'écriture du fichier CSS: ${err.message}`)
  }
}

export {
  checkCssRuleFilePresence,
  buildCssRuleFile
}
