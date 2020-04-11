import {
    promises as fsPromise,
} from 'fs';

import {
    ElementQLFileImport,
} from '../data/interfaces';



export const checkRelativeImport = (
    value: string,
) => {
    const relativeRE = /\.\//;
    const relativeMatch = value.match(relativeRE);
    return !!relativeMatch;
}


export const extractFileImports = async (
    elementFilePath: string,
) => {
    const fileContents = await fsPromise.readFile(elementFilePath, 'utf-8');
    const fileLines = fileContents.split('\n');

    const imports = [];

    let importStarted = false;

    for (const fileLine of fileLines) {
        // TODO
        // check if import on one line
        // or import start
        // or import end

        const importOneLineRE = /^\s*import.*from.*('|")(.+)('|");?$/;
        const importOneLineMatch = fileLine.match(importOneLineRE);

        if (importOneLineMatch) {
            const value = importOneLineMatch[2];
            const isRelative = checkRelativeImport(value);
            // check if value is library or relative

            const fileImport: ElementQLFileImport = {
                relative: isRelative,
                library: !isRelative,
                value,
            };
            imports.push(fileImport);
        }

        if (!importStarted) {
            const importStartedRE = /^\s*import\s{$/;
            const importStartedMatch = fileLine.match(importStartedRE);

            if (importStartedMatch) {
                importStarted = true;
            }
        } else {
            const importEndedRE = /^[^import].*}?\s*from\s*('|")(.+)('|");?/;
            const importEndedMatch = fileLine.match(importEndedRE);

            if (importEndedMatch) {
                const value = importEndedMatch[2];
                const isRelative = checkRelativeImport(value);

                const fileImport: ElementQLFileImport = {
                    relative: isRelative,
                    library: !isRelative,
                    value,
                };
                imports.push(fileImport);

                importStarted = false;
            }
        }
    }

    return imports;
}
