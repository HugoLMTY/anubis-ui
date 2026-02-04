import { overridesFile, quasarFile, readFile, tokensFile, writeFile } from "./file.tools"

export const init = () => {
  const currentFileContent = readFile(quasarFile)
  
  const imports = [overridesFile, tokensFile]
    ?.filter(Boolean)
    ?.map(i => `@use "${i}";`)
    ?.filter(i => !currentFileContent.includes(i))
    ?.join('\n')
  
  const newContent = `${imports}\n${currentFileContent}`?.trim()
  writeFile(quasarFile, newContent)
}