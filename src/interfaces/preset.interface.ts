export interface IVariation {
  [key: string]: string
}

export interface IPreset {
  // [key: string]: string
  prefix: string,
  declaration: string,

  /** When true, class can be called without variation, creating a rule with default variation */
  standalone?: boolean,

  /**In a quasar project (quasar.variabls.scss), will set as !default the precised key with the default variations */
  globalVariableOverride?: string,

  /** List of every possible variations */
  variations: IVariation
}