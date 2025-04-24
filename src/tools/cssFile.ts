// import fs from 'fs'
// import path from 'path'
const fs = require('fs')
const path = require('path')

import { cssHeader, log } from './logger'

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

const buildCssRuleFile = (classes: string = '') => {
  try {
    checkCssRuleFilePresence()

    fs.writeFileSync(outputPath, cssHeader + '\n' + classes)

    return outputPath
  } catch (err: any) {
    throw new Error(`Erreur lors de l'écriture du fichier CSS: ${err.message}`)
  }
}

export {
  checkCssRuleFilePresence,
  buildCssRuleFile
}