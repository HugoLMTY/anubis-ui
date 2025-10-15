import { IColor } from './color.interface';
import { IPreset } from './preset.interface';
import { IFileConfig } from './files.interface';

export interface IEnvConfig {
    utilities: IPreset[];
    files: IFileConfig;

    /** User-given classes to force the css rule creation */
    force: string[];

    colors: IColor;
    states: string[];
    [key: string]: any;
}
