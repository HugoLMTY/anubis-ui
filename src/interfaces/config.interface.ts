import { IPreset } from "./preset.interface"

export interface IFilePatterns {
  targets: string|string[],
  ignore: string[]
}

export interface IEnvConfig {
  qol: IPreset[]
  presets: IPreset[],
  files: IFilePatterns,

  /** User-given classes to force the css rule creation */
  force: string[],

  colors: string[],
  states: string[],
  [key: string]: any
}