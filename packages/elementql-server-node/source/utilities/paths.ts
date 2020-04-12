import path from 'path';



export const isElementsPath = (
    path: string,
    elementsPaths: string[],
) => {
    for (const elementPath of elementsPaths) {
        const cleanElementPath = elementPath.replace('/', '');
        const cleanPath = path.replace('/', '')

        if (cleanElementPath.includes(cleanPath)) {
            return true;
        }
    }
    return false;
}


export const computeElementBaseName = (
    elementsPath: string,
    elementsDirectories: string[],
    basename?: string,
) => {
    const pathBasename = isElementsPath(path.basename(elementsPath), elementsDirectories)
        ? ''
        : path.basename(elementsPath);
    const elementBasename = basename
        ? basename + '/' + pathBasename
        : pathBasename;

    return elementBasename;
}
