interface IConfigDeclaration {
  [key: string]: string,
}

export interface IConfigPresets {
  defaultInnerBorderWidth?: string
  innerBorderWidths?: IConfigDeclaration[]

  defaultBorderWidth?: string
  borderWidths?: IConfigDeclaration[]

  defaultShadow?: string,
  shadowWidths?: IConfigDeclaration[]

  defaultBorderRadius?: string
  borderRadiuses?: IConfigDeclaration[]

  fontWeights?: IConfigDeclaration[]
}