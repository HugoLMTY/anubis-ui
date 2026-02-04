import { IColor } from "@/interfaces/color.interface";
import { defineColor, defineToken } from "../output/css.output";
import { config } from "../config.tool";

export const mapColorsIntoMixinDeclaration = (colors: IColor) => {
  const mappedColors = Object.entries(colors)
    ?.map(([colorName, { light, dark }]) =>
      defineColor(colorName, light, dark)
    )
    ?.join('\n');

  return mappedColors;
};

export const mapColorsIntoTokens = () => {
  const colors = config.colors

  const tokenizedColors = Object.entries(colors)
  ?.map(([colorName, { light, dark }]) =>
    defineToken(colorName, light, dark)
  )
  ?.join('\n\n');
  
  return tokenizedColors
}