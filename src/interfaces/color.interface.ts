export interface IColor {
  [colorName: string]: {
    /** @required Hexadecimal light color code - doesn't include opacity */
    light: string[7]

    /** @optionnal Hexadecimal dark color code - doesn't include opacity */
    dark?: string[7]
  }
}