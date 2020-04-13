import {
    promises as fs,
} from 'fs';

import path from 'path';

import {
    UseLibrariesOptions,
} from '../../../data/interfaces';



const useLibraries = async (
    options: UseLibrariesOptions,
) => {
    const {
        libraries,
        buildDirectory,
    } = options;

    for (const library of Object.values(libraries)) {
        const libraryPath = path.join(
            __dirname,
            library.production,
        );
        const appModulePath = path.join(
            __dirname,
            buildDirectory,
            library.production,
        );
        const appModuleDirectory = path.dirname(
            appModulePath,
        );

        await fs.mkdir(
            appModuleDirectory,
            { recursive: true },
        );
        await fs.copyFile(
            libraryPath,
            appModulePath,
        );
    }
}


export default useLibraries;
