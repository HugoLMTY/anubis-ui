export interface IColor {
  [colorName: string]: {
    /** @optional Hexadecimal light color code - doesn't include opacity */
    light?: string[7]

    /** @optional Hexadecimal dark color code - doesn't include opacity */
    dark?: string[7]
  }
}