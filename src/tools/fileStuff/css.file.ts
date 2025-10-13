import fs from 'fs';
import path from 'path';

import { log } from '@tools/logger';
import { getHeader } from '@tools/output/css.output';

const srcDir = path.join(process.cwd(), 'src', 'css');
const outputPath = path.join(srcDir, '_anubis.scss');

const checkCssRuleFilePresence = () => {
    try {
        fs.mkdirSync(srcDir, { recursive: true });

        if (fs.existsSync(outputPath)) {
            return;
        }

        log('Output file missing, generating..');
        fs.writeFileSync(outputPath, '');
    } catch (err: any) {
        throw new Error(
            `Erreur lors de la vérification du fichier CSS: ${err.message}`
        );
    }
};

const writeCssRuleFile = (
    colors: string = '',
    variants: string = '',
    classes: string = ''
) => {
    try {
        checkCssRuleFilePresence();

        const content = `${getHeader()}\n${colors}\n\n${variants}\n\n${classes}`;

        fs.writeFileSync(outputPath, content);

        return outputPath;
    } catch (err: any) {
        throw new Error(
            `Erreur lors de l'écriture du fichier CSS: ${err.message}`
        );
    }
};

export { writeCssRuleFile };
