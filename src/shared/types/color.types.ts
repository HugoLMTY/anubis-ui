// shared/types/color.types.ts

export type ColorValue = string;

export interface ColorDefinition {
  /** @optional Hexadecimal light color code - doesn't include opacity */
  light?: ColorValue;

  /** @optional Hexadecimal dark color code - doesn't include opacity */
  dark?: ColorValue;
}

export interface IColor {
  [colorName: string]: ColorDefinition;
}
