import { IColor } from '@interfaces/color.interface';
import { defineColor } from '@tools/output/css.output';

const mapColorsIntoMixinDeclaration = (colors: IColor) => {
    const mappedColors = Object.entries(colors)
        ?.map(([colorName, { light, dark }]) =>
            defineColor(colorName, light, dark)
        )
        ?.join('\n');

    return mappedColors;
};

export { mapColorsIntoMixinDeclaration };
