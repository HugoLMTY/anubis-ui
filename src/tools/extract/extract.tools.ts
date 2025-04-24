// import fg from 'fast-glob'
const fg = require('fast-glob')

import { IFileConfig } from '../../interfaces/files.interface'

const getFiles = async (routeConfig: IFileConfig) => {
  return await fg(routeConfig.targets || '*.vue', {
    absolute: true,
    onlyFiles: true,
    ignore: routeConfig.ignore || [],
  })
}

export {
  getFiles
}